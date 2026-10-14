import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Btn, Card, Body, Check, Icon, PageHead, Pager, Select } from '../components/ui'
import { ExamSelect, GroupSelect, SubjectSelect } from '../components/ContextBar'
import { PathField } from '../components/PathField'
import { displayName, fmt, markTone, score } from '../lib/domain'
import { useSubjectData } from '../lib/hooks'
import { useApp } from '../store/useApp'

const PER = 12

export function Grades() {
  const nav = useNavigate()
  const data = useApp()
  const { corrected, formula, markAll, open, ask, toast, log } = data
  const { participants } = useSubjectData()
  const [q, setQ] = useState(''), [page, setPage] = useState(0), [selected, setSelected] = useState<number>()
  const [allGroups, setAllGroups] = useState(false), [fmtSel, setFmtSel] = useState('XLSX')
  const [hsn, setHsn] = useState(false), [anon, setAnon] = useState(false), [sheet, setSheet] = useState(false)

  const list = useMemo(() => {
    const t = q.toLowerCase()
    return participants.filter((p) => !t || `${displayName(p)}${p.id}`.toLowerCase().includes(t))
  }, [participants, q])
  const pg = Math.min(page, Math.max(0, Math.ceil(list.length / PER) - 1))
  const cur = selected ?? participants[0]?.sn
  const mark = (p: typeof participants[number]) => (corrected ? score(data, p).grade : 0)

  return (<>
    <PageHead title="Grades" sub="Review, export and report grades for the selected exam."
      actions={<><Btn icon="alert" onClick={() => nav('/errors/hr')}>Error sheets HR</Btn><Btn icon="alert" onClick={() => nav('/errors/hi')}>Error sheets HI</Btn></>} />
    {!corrected && (
      <div className="card" style={{ marginBottom: 16, background: 'var(--warn-soft)', borderColor: '#F3DDA3' }}>
        <div className="bd" style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '14px 20px' }}>
          <span style={{ color: 'var(--warn)' }}><Icon name="alert" /></span>
          <div><b>No correction has been run yet</b><div className="hint" style={{ margin: 0, color: '#8a5a00' }}>Grades show 0,00 until the scanned sheets are corrected.</div></div>
          <span style={{ marginLeft: 'auto' }}><Btn variant="p sm" onClick={() => nav('/corrections')}>Go to corrections</Btn></span>
        </div>
      </div>
    )}
    <div className="grid" style={{ gridTemplateColumns: '1fr 1.3fr 1fr auto', marginBottom: 16, alignItems: 'center' }}>
      <SubjectSelect /><ExamSelect /><GroupSelect /><Check on={allGroups} onChange={setAllGroups}>All groups</Check>
    </div>
    <div className="grid" style={{ gridTemplateColumns: '1fr 250px', alignItems: 'start' }}>
      <Card flush>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--line-2)' }}>
          <label className="in" style={{ boxShadow: 'none' }}><Icon name="search" /><input placeholder="Search by name or ID…" value={q} onChange={(e) => { setQ(e.target.value); setPage(0) }} /></label>
        </div>
        <div className="tablewrap" style={{ maxHeight: 'none' }}>
          <table>
            <thead><tr><th className="n">S/N</th><th>ID</th><th>Barcode</th><th>Reference</th><th>Name</th><th className="n">Grade</th><th>✓</th></tr></thead>
            <tbody>{list.slice(pg * PER, pg * PER + PER).map((p) => {
              const g = mark(p)
              return (
                <tr key={p.sn} className={cur === p.sn ? 'sel-row' : ''} style={{ cursor: 'pointer' }} onClick={() => setSelected(p.sn)}>
                  <td className="n">{p.sn}</td><td className="mono">{p.id}</td><td className="mono">{p.assigned ? p.barcode : ''}</td><td className="mono">{p.assigned ? p.dni : ''}</td>
                  <td>{displayName(p)}</td><td className="n"><span className={`mark ${corrected ? markTone(g) : ''}`}>{fmt(g)}</span></td><td>{p.marked && <Icon name="check" />}</td>
                </tr>
              )
            })}</tbody>
          </table>
        </div>
        <Pager page={pg} total={list.length} per={PER} onPage={setPage} />
      </Card>
      <div className="grid">
        <Card><Body><div className="sec-t">Formula</div><span className="formula" style={{ cursor: 'pointer' }} onClick={() => open('formula')}><Icon name="fx" />{formula}</span></Body></Card>
        <Card><Body style={{ display: 'grid', gap: 8 }}><Btn variant="sm" onClick={() => markAll(true)}>Mark all</Btn><Btn variant="sm" onClick={() => markAll(false)}>Unmark all</Btn></Body></Card>
        <Card><Body style={{ display: 'grid', gap: 8 }}>
          <Btn icon="eye" style={{ justifyContent: 'flex-start' }} onClick={() => open('report', String(cur))}>View</Btn>
          <Btn icon="mail" style={{ justifyContent: 'flex-start' }} onClick={() => ask({ title: 'Send emails', message: 'Email each participant their result using the Email configuration.', ok: 'Send', done: `Emails queued · ${participants.length} messages`, run: () => log('Send emails') })}>Send emails</Btn>
          <Btn icon="file" style={{ justifyContent: 'flex-start' }} onClick={() => open('output-folder')}>Bulk reports</Btn>
          <Btn icon="stats" style={{ justifyContent: 'flex-start' }} onClick={() => open('statistics')}>Statistics</Btn>
        </Body></Card>
      </div>
    </div>
    <div className="card" style={{ marginTop: 16 }}><div className="bd">
      <div style={{ display: 'flex', gap: 26, alignItems: 'center', flexWrap: 'wrap' }}>
        <Check on={hsn} onChange={setHsn}>Header S/N</Check>
        <div style={{ width: 200 }}><Select label="Format:" value={fmtSel} onChange={setFmtSel} options={['XLSX', 'CSV', 'ODS'].map((x) => [x, x])} /></div>
        <Check on={anon} onChange={setAnon}>Anonymize export grades?</Check><Check on={sheet} onChange={setSheet}>Add marked sheet?</Check>
      </div>
      <hr className="s" /><PathField id="gradesFile" placeholder="Select a spreadsheet to import or export" mode="file" />
      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        <Btn icon="down" onClick={() => toast('Grades imported', 'grades.xlsx')}>Import grades</Btn><span style={{ flex: 1 }} />
        <Btn variant="p" icon="up" onClick={() => toast('Grades exported', `grades_${data.subject}.${fmtSel.toLowerCase()}`)}>Export grades</Btn>
        <Btn variant="p" icon="file" onClick={() => toast('Extended export ready', 'grades_extended.xlsx')}>Export extended</Btn>
      </div>
    </div></div>
  </>)
}
