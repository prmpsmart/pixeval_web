import { getLanguage } from '../i18n/runtime'

/** Research documents: the Markdown files in `src/research/` (English) and `src/research/<lang>/`, bundled at build time. */
const files = import.meta.glob('/src/research/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

export interface ResearchDoc {
  id: string
  title: string
  label: string
  body: string
}

/** Short names for the document list. */
const LABELS: Record<string, string> = {
  README: 'Index',
  '06-final-technical-report': 'Final technical report',
  '00-baseline-current-stack': 'Baseline: the current stack',
  '01-pyside6-widgets-modernised': '01 · Modernise Qt Widgets',
  '02-qt-webengine-hybrid': '02 · Qt WebEngine hybrid',
  '03-local-web-app-fastapi-react': '03 · Web app in the browser',
  '04-pywebview-native-window': '04 · Web app in a pywebview window',
  '05-comparison-and-roadmap': 'Comparison and roadmap',
}

const titleOf = (body: string, fallback: string) => /^#\s+(.+)$/m.exec(body)?.[1].trim() ?? fallback

/** Index first, then the final report, then the numbered notes in order. */
const rank = (id: string) => (id === 'README' ? 0 : id.startsWith('06-') ? 1 : 2)

/** Localised label: the document's own title up to the first colon, e.g. "03 · Local web app". */
const shortTitle = (title: string) => title.split(/:| — /)[0].trim()

/** Documents for the current language; a missing translation falls back to English. */
export function getDocs(): ResearchDoc[] {
  const lang = getLanguage()
  const byId = new Map<string, ResearchDoc>()
  for (const l of lang === 'en' ? ['en'] : ['en', lang]) {
    for (const [path, body] of Object.entries(files)) {
      const parts = path.replace('/src/research/', '').split('/')
      if ((parts.length === 1 ? 'en' : parts[0]) !== l) continue
      const id = parts[parts.length - 1].replace(/\.md$/, '')
      const title = titleOf(body, id)
      byId.set(id, { id, title, label: l === 'en' ? (LABELS[id] ?? title) : shortTitle(title), body })
    }
  }
  return [...byId.values()].sort((a, b) => rank(a.id) - rank(b.id) || a.id.localeCompare(b.id))
}

export const findDoc = (docs: ResearchDoc[], id?: string) => docs.find((d) => d.id === (id ?? 'README'))
