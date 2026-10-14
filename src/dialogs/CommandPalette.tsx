import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../components/ui'
import { NAV } from '../lib/nav'
import { examName } from '../lib/domain'
import { useApp } from '../store/useApp'

interface Item { icon: Parameters<typeof Icon>[0]['name']; label: string; hint?: string; run: () => void }

/** ⌘K — jump to a screen, an exam, or run a common action. */
export function CommandPalette() {
  const [q, setQ] = useState('')
  const nav = useNavigate()
  const { exams, set, close, open, saving, setSaving } = useApp()
  const go = (to: string) => () => { close(); nav(to) }
  const text = q.toLowerCase()
  const match = (s: string) => s.toLowerCase().includes(text)

  const screens: Item[] = NAV.filter((n) => n.to && n.id !== 'logout' && match(n.label)).map((n) => ({ icon: n.icon, label: n.label, run: go(n.to!) }))
  const examItems: Item[] = exams.filter((e) => match(examName(e))).map((e) => ({ icon: 'file', label: examName(e), hint: e.subject, run: () => { set({ exam: String(e.id), subject: e.subject }); close(); nav('/history') } }))
  const actions: Item[] = ([
    { icon: 'down', label: 'Export grades (XLSX)', run: go('/grades') },
    { icon: 'plus', label: 'New exam', run: go('/add-exam') },
    { icon: 'cog', label: 'Open configuration', run: () => { close(); open('config') } },
    { icon: 'db', label: 'Backup database', run: go('/utilities') },
    { icon: 'spark', label: 'Toggle saving to DB', run: () => { close(); setSaving(!saving) } },
  ] as Item[]).filter((a) => match(a.label))

  const group = (title: string, items: Item[]) => items.length > 0 && (
    <div className="g"><h6>{title}</h6>
      {items.map((it) => <div className="it" key={it.label} onClick={it.run}><Icon name={it.icon} />{it.label}{it.hint && <span className="kbd">{it.hint}</span>}</div>)}
    </div>
  )
  const empty = !screens.length && !examItems.length && !actions.length
  return (
    <div className="ov show" style={{ alignItems: 'start' }} onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div className="cmd">
        <div className="q"><Icon name="search" /><input autoFocus placeholder="Search or jump to…" value={q} onChange={(e) => setQ(e.target.value)} /><span className="kbd">esc</span></div>
        {group('Go to', screens.slice(0, 7))}{group('Exams', examItems)}{group('Actions', actions)}
        {empty && <div className="empty">No results</div>}
        <div className="ft"><span>click to open</span><span>esc close</span></div>
      </div>
    </div>
  )
}
