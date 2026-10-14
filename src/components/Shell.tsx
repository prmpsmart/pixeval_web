import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Icon } from './ui'
import { NAV, type NavItem } from '../lib/nav'
import { useApp } from '../store/useApp'
import { tr } from '../i18n/mark'
import { LANGS, setLanguage, translate, useLanguage, type LangCode } from '../i18n/runtime'
import { USER } from '../data/seed'

const section = (path: string) => '/' + (path.split('/')[1] ?? '')

function Sidebar({ onNavigate }: { onNavigate: () => void }) {
  const { subjects, subject, participants, questions, exams, open } = useApp()
  const lang = useLanguage()
  const nav = useNavigate()
  const sub = subjects.find((s) => s.id === subject) ?? subjects[0]
  const counts: Record<string, number> = {
    subjects: subjects.length,
    questions: questions.filter((q) => q.subject === subject).length,
    participants: participants.filter((p) => p.subject === subject).length,
    exams: exams.length,
  }
  const item = (n: NavItem) => {
    const label = translate(n.label)
    const inner = (
      <>
        {<Icon name={n.icon} />}
        {label}
        {counts[n.id] !== undefined && <span className="ct">{counts[n.id]}</span>}
      </>
    )
    if (n.dialog)
      return (
        <a
          key={n.id}
          onClick={() => {
            onNavigate()
            open(n.dialog!)
          }}
        >
          {inner}
        </a>
      )
    return (
      <NavLink
        key={n.id}
        to={n.to!}
        className={({ isActive }) => (isActive ? 'on' : '')}
        onClick={onNavigate}
      >
        {inner}
      </NavLink>
    )
  }
  return (
    <aside className="nav">
      <div className="brand" style={{ cursor: 'pointer' }} onClick={() => nav('/dashboard')}>
        <div className="logo">X</div>
        <div>
          <b>
            pi<i>X</i>eval
          </b>
          <small>OMR EXAMINATION SUITE</small>
        </div>
      </div>
      <div className="ws" style={{ cursor: 'pointer' }} onClick={() => nav('/subjects')}>
        <div className="tag">{sub?.id ?? '—'}</div>
        <div>
          <strong>{sub?.name ?? 'No subject'}</strong>
          <span>{USER.db}</span>
        </div>
        <Icon name="chev" />
      </div>
      <div className="grp">Library</div>
      {NAV.filter((n) => n.group === 'Library').map(item)}
      <div className="grp">Examination</div>
      {NAV.filter((n) => n.group === 'Examination').map(item)}
      <div className="spacer" />
      <div className="foot">
        {NAV.filter((n) => n.group === 'foot').map(item)}
        <label className="lang">
          <Icon name="globe" />
          {LANGS.find((l) => l.code === lang)?.name}
          <Icon name="chev" />
          <select value={lang} onChange={(e) => setLanguage(e.target.value as LangCode)}>
            {LANGS.map((l) => (
              <option key={l.code} value={l.code}>
                {l.name}
              </option>
            ))}
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
      <button className="ib hamb" onClick={onMenu}>
        <Icon name="menu" />
      </button>
      <div className="crumb">
        {crumbs.map((c, i) =>
          i === crumbs.length - 1 ? (
            <b key={i}>{translate(c)}</b>
          ) : (
            <span key={i} style={{ display: 'contents' }}>
              {translate(c)}
              <Icon name="right" />
            </span>
          ),
        )}
      </div>
      <span className="proto" title="All data is sample data">
        Design preview
      </span>
      <div className="search" onClick={() => open('cmd')} style={{ cursor: 'pointer' }}>
        <Icon name="search" />
        <span>Search or jump to…</span>
        <span className="kbd">⌘K</span>
      </div>
      <div className={`save ${saving ? 'on' : ''}`} onClick={() => setSaving(!saving)}>
        <span className="sw" />
        <span className="t">{saving ? 'Saving to DB' : 'Not saving to DB'}</span>
      </div>
      <div className="ava" onClick={() => setMenu((m) => !m)}>
        {USER.initials}
      </div>
      {menu && (
        <div className="menu" onMouseLeave={() => setMenu(false)}>
          <div className="hd">
            <b>{USER.name}</b>
            {USER.email}
          </div>
          <a
            onClick={() => {
              setMenu(false)
              ask({
                title: 'Reset demo data?',
                message: 'All changes stored in this browser are erased and the sample data comes back.',
                ok: 'Reset',
                danger: true,
                done: 'Resetting…',
                run: () => setTimeout(reset, 300),
              })
            }}
          >
            <Icon name="refresh" />
            Reset demo data
          </a>
          <a
            onClick={() => {
              setMenu(false)
              fastForward()
            }}
          >
            <Icon name="zap" />
            Fast-forward demo
          </a>
          <a
            onClick={() => {
              setMenu(false)
              open('config')
            }}
          >
            <Icon name="cog" />
            Configuration
          </a>
          <a
            onClick={() => {
              setMenu(false)
              open('credits')
            }}
          >
            <Icon name="award" />
            Credits
          </a>
          <a onClick={() => nav('/login')}>
            <Icon name="out" />
            Logout
          </a>
        </div>
      )}
    </header>
  )
}

const CRUMBS: Record<string, string[]> = {
  '/dashboard': [tr('Library'), tr('Dashboard')],
  '/subjects': [tr('Library'), tr('Subjects')],
  '/questions': [tr('Library'), tr('Questions')],
  '/participants': [tr('Library'), tr('Participants')],
  '/exams': [tr('Examination'), tr('Exams')],
  '/add-exam': [tr('Examination'), tr('Add exam')],
  '/sheets': [tr('Examination'), tr('Sheets management')],
  '/corrections': [tr('Examination'), tr('Corrections')],
  '/assign': [tr('Examination'), tr('Assign identities')],
  '/grades': [tr('Examination'), tr('Grades')],
  '/reserve': [tr('Examination'), tr('Reserve questions')],
  '/history': [tr('Examination'), tr('History')],
  '/close': [tr('Examination'), tr('Close exams')],
  '/utilities': [tr('System'), tr('Utilities')],
  '/errors': [tr('Examination'), tr('Grades'), tr('Errors')],
  '/research': [tr('System'), tr('Research')],
}

export function Shell() {
  const loc = useLocation()
  const openDialog = useApp((a) => a.open)
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        openDialog('cmd')
      }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [openDialog])
  const [open, setOpen] = useState(false)
  const sec = section(loc.pathname)
  const crumbs = [
    ...(CRUMBS[sec] ?? ['piXeval']),
    ...(sec === '/participants' && loc.pathname.split('/')[2] ? [loc.pathname.split('/')[2]] : []),
  ]
  return (
    <div className={`app ${open ? '' : ''}`}>
      <div className={open ? 'navopen-wrap' : ''} style={{ display: 'contents' }}>
        <Sidebar onNavigate={() => setOpen(false)} />
      </div>
      <div className="main">
        <Topbar
          crumbs={crumbs}
          onMenu={() => {
            setOpen((o) => !o)
            document.body.classList.toggle('navopen')
          }}
        />
        <div className="content">
          <Outlet />
        </div>
      </div>
      <div
        className="scrim"
        onClick={() => {
          setOpen(false)
          document.body.classList.remove('navopen')
        }}
      />
    </div>
  )
}
