/** Research documents: the Markdown files in `src/research/`, bundled at build time. */
const files = import.meta.glob('/src/research/*.md', {
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

export const docs: ResearchDoc[] = Object.entries(files)
  .map(([path, body]) => {
    const id = path.split('/').pop()!.replace(/\.md$/, '')
    return { id, title: titleOf(body, id), label: LABELS[id] ?? titleOf(body, id), body }
  })
  .sort((a, b) => rank(a.id) - rank(b.id) || a.id.localeCompare(b.id))

export const findDoc = (id?: string) => docs.find((d) => d.id === (id ?? 'README'))
