import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Icon } from './ui'
import { NAV, type NavItem } from '../lib/nav'
import { useApp } from '../store/useApp'
import { USER } from '../data/seed'

const section = (path: string) => '/' + (path.split('/')[1] ?? '')

function Sidebar({ onNavigate }: { onNavigate: () => void }) {
  const { subjects, subject, participants, questions, exams, lang, open, set } = useApp()
  const nav = useNavigate()
  const sub = subjects.find((s) => s.id === subject) ?? subjects[0]
  const counts: Record<string, number> = {
    subjects: subjects.length,
    questions: questions.filter((q) => q.subject === subject).length,
    participants: participants.filter((p) => p.subject === subject).length,
    exams: exams.length,
  }
  const item = (n: NavItem) => {
    const label = lang === 'Español' ? n.es : n.label
    const inner = <>{<Icon name={n.icon} />}{label}{counts[n.id] !== undefined && <span className="ct">{counts[n.id]}</span>}</>
    if (n.dialog) return <a key={n.id} onClick={() => { onNavigate(); open(n.dialog!) }}>{inner}</a>
    return <NavLink key={n.id} to={n.to!} className={({ isActive }) => (isActive ? 'on' : '')} onClick={onNavigate}>{inner}</NavLink>
  }
  return (
    <aside className="nav">
      <div className="brand" style={{ cursor: 'pointer' }} onClick={() => nav('/dashboard')}>
        <div className="logo">X</div><div><b>pi<i>X</i>eval</b><small>OMR EXAMINATION SUITE</small></div>
      </div>
      <div className="ws" style={{ cursor: 'pointer' }} onClick={() => nav('/subjects')}>
        <div className="tag">{sub?.id ?? '—'}</div><div><strong>{sub?.name ?? 'No subject'}</strong><span>{USER.db}</span></div><Icon name="chev" />
      </div>
      <div className="grp">Library</div>{NAV.filter((n) => n.group === 'Library').map(item)}
      <div className="grp">Examination</div>{NAV.filter((n) => n.group === 'Examination').map(item)}
      <div className="spacer" />
      <div className="foot">
        {NAV.filter((n) => n.group === 'foot').map(item)}
        <label className="lang"><Icon name="globe" />{lang}<Icon name="chev" />
          <select value={lang} onChange={(e) => { set({ lang: e.target.value as 'English' | 'Español' }); useApp.getState().toast('Interface language: ' + e.target.value, 'Demo: navigation labels only') }}>
            <option>English</option><option>Español</option>
          </select>
        </label>
      </div>
    </aside>
  )
}

function Topbar({ crumbs, onMenu }: { crumbs: string[]; onMenu: () => void }) {
  const { saving, setSaving, open, reset, ask, fastForward } = useApp()
  const [menu, setMenu] = useState(false)
  const nav = useNavigate()
  return (
    <header className="top">
      <button className="ib hamb" onClick={onMenu}><Icon name="menu" /></button>
      <div className="crumb">{crumbs.map((c, i) => i === crumbs.length - 1 ? <b key={i}>{c}</b> : <span key={i} style={{ display: 'contents' }}>{c}<Icon name="right" /></span>)}</div>
      <span className="proto" title="All data is sample data">Design preview</span>
      <div className="search" onClick={() => open('cmd')} style={{ cursor: 'pointer' }}><Icon name="search" /><span>Search or jump to…</span><span className="kbd">⌘K</span></div>
      <div className={`save ${saving ? 'on' : ''}`} onClick={() => setSaving(!saving)}><span className="sw" /><span className="t">{saving ? 'Saving to DB' : 'Not saving to DB'}</span></div>
      <div className="ava" onClick={() => setMenu((m) => !m)}>{USER.initials}</div>
      {menu && (
        <div className="menu" onMouseLeave={() => setMenu(false)}>
          <div className="hd"><b>{USER.name}</b>{USER.email}</div>
          <a onClick={() => { setMenu(false); ask({ title: 'Reset demo data?', message: 'All changes stored in this browser are erased and the sample data comes back.', ok: 'Reset', danger: true, done: 'Resetting…', run: () => setTimeout(reset, 300) }) }}><Icon name="refresh" />Reset demo data</a>
          <a onClick={() => { setMenu(false); fastForward() }}><Icon name="zap" />Fast-forward demo</a>
          <a onClick={() => { setMenu(false); open('config') }}><Icon name="cog" />Configuration</a>
          <a onClick={() => { setMenu(false); open('credits') }}><Icon name="award" />Credits</a>
          <a onClick={() => nav('/login')}><Icon name="out" />Logout</a>
        </div>
      )}
    </header>
  )
}

const CRUMBS: Record<string, string[]> = {
  '/dashboard': ['Library', 'Dashboard'], '/subjects': ['Library', 'Subjects'], '/questions': ['Library', 'Questions'],
  '/participants': ['Library', 'Participants'], '/exams': ['Examination', 'Exams'], '/add-exam': ['Examination', 'Add exam'],
  '/sheets': ['Examination', 'Sheets management'], '/corrections': ['Examination', 'Corrections'], '/assign': ['Examination', 'Assign identities'],
  '/grades': ['Examination', 'Grades'], '/reserve': ['Examination', 'Reserve questions'], '/history': ['Examination', 'History'],
  '/close': ['Examination', 'Close exams'], '/utilities': ['System', 'Utilities'], '/errors': ['Examination', 'Grades', 'Errors'], '/research': ['System', 'Research'],
}

export function Shell() {
  const loc = useLocation()
  const openDialog = useApp((a) => a.open)
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openDialog('cmd') } }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [openDialog])
  const [open, setOpen] = useState(false)
  const sec = section(loc.pathname)
  const crumbs = [...(CRUMBS[sec] ?? ['piXeval']), ...(sec === '/participants' && loc.pathname.split('/')[2] ? [loc.pathname.split('/')[2]] : [])]
  return (
    <div className={`app ${open ? '' : ''}`}>
      <div className={open ? 'navopen-wrap' : ''} style={{ display: 'contents' }}>
        <Sidebar onNavigate={() => setOpen(false)} />
      </div>
      <div className="main">
        <Topbar crumbs={crumbs} onMenu={() => { setOpen((o) => !o); document.body.classList.toggle('navopen') }} />
        <div className="content"><Outlet /></div>
      </div>
      <div className="scrim" onClick={() => { setOpen(false); document.body.classList.remove('navopen') }} />
    </div>
  )
}
