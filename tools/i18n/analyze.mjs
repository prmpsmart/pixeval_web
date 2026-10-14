/**
 * Finds user-visible English text in source files and rewrites it, at build time, into lookups
 * (`__t("English text", { vars }, count?)`). The source files themselves stay plain English.
 *
 * Translated: JSX text, whitelisted JSX attributes, and the text arguments of toast()/ask()/done().
 * Not translated: anything else (ids, class names, log entries). Strings in constants and arrays are
 * translated where they are displayed (see src/i18n/runtime.ts `translate`) or marked with `tr()`.
 */
import ts from 'typescript'

/** JSX attributes whose string values are user-visible. */
const ATTRS = new Set([
  'title',
  'sub',
  'label',
  'placeholder',
  'hint',
  'alt',
  'aria-label',
  'ok',
  'done',
  'message',
])
/** Local helper functions whose listed arguments are user-visible text (argument indexes). */
const TEXT_CALLS = { flag: [1], group: [0] }
/** Object properties of `ask({...})` that are user-visible. */
const ASK_PROPS = new Set(['title', 'message', 'ok', 'done'])

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }
const decode = (s) =>
  s.replace(/&(#x?[0-9a-f]+|\w+);/gi, (m, e) => {
    if (e[0] === '#')
      return String.fromCodePoint(
        e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10),
      )
    return ENTITIES[e] ?? m
  })

const hasLetters = (s) => /\p{L}{2,}/u.test(s)
/** Brand names, sample data and language names are never translated. */
const NEVER =
  /^(pi|eval|DINATEN|English|Español|esc)$|Examen TJ|Técnico Jurídico|prmpsmart|OMR EXAMINATION SUITE|^…\/|\bsheet_omr\.db\b/
const looksLikeFile = (s) =>
  /^[\w\-./]+\.(pdf|xlsx|docx|csv|zip|db|jpg|png|json|txt|gift|xml|md|html)$/i.test(s) ||
  /^[\w.\-]*_[\w.\-]*$/.test(s) ||
  /^[\w\-.]+\/[\w\-./]*$/.test(s)
/** Static text of a message, ignoring placeholders. */
const isUiText = (s) =>
  !NEVER.test(s.trim()) &&
  hasLetters(s.replace(/\{\w+\}/g, ' ')) &&
  !looksLikeFile(s.replace(/\{\w+\}/g, '').trim())

const strip = (n) => {
  while (ts.isParenthesizedExpression(n) || ts.isAsExpression(n) || ts.isNonNullExpression(n))
    n = n.expression
  return n
}

/** Parse a source file and return the rewrite edits and the English keys found. */
export function analyze(code, fileName) {
  const kind = fileName.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  const sf = ts.createSourceFile(fileName, code, ts.ScriptTarget.Latest, true, kind)
  const edits = []
  const keys = new Set()
  const text = (n) => code.slice(n.getStart(sf), n.end)

  const call = (key, vars, count) => {
    keys.add(key)
    const v = vars.length
      ? `, { ${vars.map(([k, e]) => (k === e ? k : `${k}: ${e}`)).join(', ')} }`
      : count
        ? ', undefined'
        : ''
    return `__t(${JSON.stringify(key)}${v}${count ? `, ${count}` : ''})`
  }

  const isPluralCond = (e) => {
    e = strip(e)
    if (!ts.isConditionalExpression(e)) return null
    const c = strip(e.condition)
    if (
      !ts.isBinaryExpression(c) ||
      ![ts.SyntaxKind.EqualsEqualsEqualsToken, ts.SyntaxKind.EqualsEqualsToken].includes(c.operatorToken.kind)
    )
      return null
    const one = (n) => ts.isNumericLiteral(n) && n.text === '1'
    const count = one(c.right) ? c.left : one(c.left) ? c.right : null
    const t = strip(e.whenTrue),
      f = strip(e.whenFalse)
    if (!count || !ts.isStringLiteralLike(t) || !ts.isStringLiteralLike(f)) return null
    return { count, one: t.text, other: f.text }
  }

  /** Placeholder name for an interpolated expression. */
  const nameFor = (expr, used) => {
    const e = strip(expr)
    let name = ts.isIdentifier(e) ? e.text : ts.isPropertyAccessExpression(e) ? e.name.text : 'value'
    if (name === 'length') name = 'count'
    if (!/^[A-Za-z_]\w*$/.test(name)) name = 'value'
    let n = name,
      i = 2
    while (used.has(n)) n = name + i++
    used.add(n)
    return n
  }

  /** Build the translation call for a template literal (with plural support), or null. */
  const fromTemplate = (node) => {
    if (ts.isNoSubstitutionTemplateLiteral(node)) return isUiText(node.text) ? call(node.text, []) : null
    const used = new Set(),
      vars = []
    let one = node.head.text,
      other = node.head.text,
      plural = null,
      countNode = null
    for (const span of node.templateSpans) {
      const pc = isPluralCond(span.expression)
      if (pc && (!plural || text(pc.count) === plural)) {
        plural = text(pc.count)
        countNode = pc.count
        one += pc.one + span.literal.text
        other += pc.other + span.literal.text
        continue
      }
      let name = vars.find(([, e]) => e === text(span.expression))?.[0]
      if (!name) {
        name = nameFor(span.expression, used)
        vars.push([name, text(span.expression)])
      }
      one += `{${name}}` + span.literal.text
      other += `{${name}}` + span.literal.text
    }
    if (plural) {
      if (!vars.some(([, e]) => e === plural)) vars.push([nameFor(countNode, used), plural])
      return isUiText(one) ? call(`${one}|${other}`, vars, plural) : null
    }
    return isUiText(one) ? call(one, vars) : null
  }

  /** Rewrite a value that is shown to the user (string, template, or the branches of a conditional). */
  const value = (n) => {
    n = strip(n)
    if (ts.isStringLiteralLike(n) && !ts.isNoSubstitutionTemplateLiteral(n)) {
      if (isUiText(n.text)) edits.push({ start: n.getStart(sf), end: n.end, text: call(n.text, []) })
    } else if (ts.isNoSubstitutionTemplateLiteral(n) || ts.isTemplateExpression(n)) {
      const r = fromTemplate(n)
      if (r) edits.push({ start: n.getStart(sf), end: n.end, text: r })
    } else if (ts.isConditionalExpression(n)) {
      value(n.whenTrue)
      value(n.whenFalse)
    } else if (
      ts.isBinaryExpression(n) &&
      [ts.SyntaxKind.QuestionQuestionToken, ts.SyntaxKind.BarBarToken].includes(n.operatorToken.kind)
    ) {
      value(n.left)
      value(n.right)
    } else if (ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken) {
      value(n.right)
    }
  }

  const calleeName = (c) =>
    ts.isIdentifier(c.expression)
      ? c.expression.text
      : ts.isPropertyAccessExpression(c.expression)
        ? c.expression.name.text
        : ''

  /** Keys only (no rewrite): labels that components translate where they are displayed. */
  const labelKey = (n) => {
    n = strip(n)
    if (ts.isStringLiteral(n) && isUiText(n.text)) keys.add(n.text)
  }
  const optionKeys = (arr) => {
    arr = strip(arr)
    if (!ts.isArrayLiteralExpression(arr)) return
    for (const el of arr.elements) {
      const e = strip(el)
      if (ts.isArrayLiteralExpression(e) && e.elements[1]) labelKey(e.elements[1])
    }
  }

  const visit = (node) => {
    if (ts.isPropertyAssignment(node) && node.name.getText(sf) === 'label') {
      labelKey(node.initializer)
    } else if (
      ts.isJsxAttribute(node) &&
      ['tabs', 'options'].includes(node.name.getText(sf)) &&
      node.initializer &&
      ts.isJsxExpression(node.initializer) &&
      node.initializer.expression
    ) {
      optionKeys(node.initializer.expression)
    }
    if (ts.isJsxText(node)) {
      const raw = node.getText(sf)
      const lines = raw
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
      const effective = decode(lines.join(' '))
      if (effective && isUiText(effective)) {
        const lead = /^[^\S\n]+/.test(raw),
          trail = /[^\S\n]+$/.test(raw)
        edits.push({
          start: node.getStart(sf),
          end: node.end,
          text: `${lead ? "{' '}" : ''}{${call(effective, [])}}${trail ? "{' '}" : ''}`,
        })
      }
    } else if (ts.isJsxAttribute(node) && ATTRS.has(node.name.getText(sf)) && node.initializer) {
      const init = node.initializer
      if (ts.isStringLiteral(init)) {
        const s = decode(init.text)
        if (isUiText(s)) edits.push({ start: init.getStart(sf), end: init.end, text: `{${call(s, [])}}` })
      } else if (ts.isJsxExpression(init) && init.expression) value(init.expression)
    } else if (ts.isJsxExpression(node) && node.expression && !ts.isJsxAttribute(node.parent)) {
      value(node.expression)
    } else if (ts.isCallExpression(node)) {
      const name = calleeName(node)
      if (name === 'toast') node.arguments.forEach(value)
      else if (name === 'done' && node.arguments.length >= 2) node.arguments.slice(1).forEach(value)
      else if (name === 'tr' && node.arguments.length === 1) {
        // explicit marker: translate the argument, then drop the `tr(` ... `)` wrapper
        const a = node.arguments[0]
        value(a)
        edits.push({ start: node.getStart(sf), end: a.getStart(sf), text: '' })
        edits.push({ start: a.end, end: node.end, text: '' })
      } else if (TEXT_CALLS[name])
        TEXT_CALLS[name].forEach((i) => node.arguments[i] && value(node.arguments[i]))
      else if (name === 'ask' && node.arguments[0] && ts.isObjectLiteralExpression(node.arguments[0])) {
        for (const p of node.arguments[0].properties) {
          if (ts.isPropertyAssignment(p) && ASK_PROPS.has(p.name.getText(sf))) value(p.initializer)
        }
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(sf)

  // an outer edit wins over edits nested inside it
  edits.sort((a, b) => a.start - b.start || b.end - a.end)
  const kept = []
  for (const e of edits) if (!kept.length || e.start >= kept[kept.length - 1].end) kept.push(e)
  return { edits: kept, keys }
}
