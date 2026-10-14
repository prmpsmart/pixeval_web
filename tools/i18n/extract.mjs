/**
 * Lists every English string that the plugin translates, and reports what is missing per language.
 *
 *   node tools/i18n/extract.mjs            write src/i18n/keys.json and print a coverage report
 *   node tools/i18n/extract.mjs --missing  also write the missing strings per language to tools/i18n/missing/<lang>.json
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { analyze } from './analyze.mjs'
import { isSource } from './plugin.mjs'

const LANGS = ['es', 'fr', 'gl', 'ca', 'eu']
const walk = (dir) =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f)
    return statSync(p).isDirectory() ? walk(p) : [p]
  })

const keys = new Set()
for (const f of walk('src')) {
  const abs = '/' + f
  if (!isSource(abs)) continue
  for (const k of analyze(readFileSync(f, 'utf8'), f).keys) keys.add(k)
}
// strings translated where they are displayed (labels kept in constants and arrays)
const extra = JSON.parse(readFileSync('src/i18n/extra-keys.json', 'utf8'))
extra.forEach((k) => keys.add(k))
const sorted = [...keys].sort((a, b) => a.localeCompare(b))
writeFileSync('src/i18n/keys.json', JSON.stringify(sorted, null, 2) + '\n')
console.log(`${sorted.length} strings`)

for (const lang of LANGS) {
  const file = `src/i18n/locales/${lang}.json`
  const dict = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {}
  const missing = sorted.filter((k) => !dict[k])
  const unused = Object.keys(dict).filter((k) => !keys.has(k))
  console.log(
    `${lang}: ${sorted.length - missing.length}/${sorted.length} translated, ${missing.length} missing, ${unused.length} unused`,
  )
  if (process.argv.includes('--missing')) {
    mkdirSync('tools/i18n/missing', { recursive: true })
    writeFileSync(
      `tools/i18n/missing/${lang}.json`,
      JSON.stringify(Object.fromEntries(missing.map((k) => [k, ''])), null, 2) + '\n',
    )
  }
}
