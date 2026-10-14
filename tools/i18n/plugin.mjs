import { readFileSync } from 'node:fs'
import MagicString from 'magic-string'
import { analyze } from './analyze.mjs'

/** Source files that are scanned for user-visible text. */
export const isSource = (id) =>
  /\/src\/.*\.tsx?$/.test(id) && !/\/src\/(i18n|research)\//.test(id) && !/iconPaths|\.d\.ts$/.test(id)

/**
 * Vite plugin: translates user-visible text at build time. Runs before React's transform and rewrites
 * English literals into `__t(...)` lookups; the source files stay plain English.
 */
export default function autoI18n() {
  return {
    name: 'auto-i18n',
    enforce: 'pre',
    transform(code, id) {
      const file = id.split('?')[0]
      if (!isSource(file)) return null
      const { edits } = analyze(code, file)
      if (!edits.length) return null
      const ms = new MagicString(code)
      for (const e of edits) ms.overwrite(e.start, e.end, e.text)
      ms.prepend("import { __t } from '/src/i18n/runtime'\n")
      return { code: ms.toString(), map: ms.generateMap({ hires: true, source: file }) }
    },
  }
}

export { readFileSync }
