import { useState } from 'react'
import { Dialog, DialogFooter } from '../components/Dialog'
import { Btn, Field, Icon, Input, Select } from '../components/ui'
import { useApp } from '../store/useApp'

export function ImportParticipantsDialog() {
  const { groups, group, importParts, close } = useApp()
  const [g, setG] = useState(group)
  return (
    <Dialog width="w2" icon="down" title="Import participants" sub="From an XLSX or CSV file (demo: adds 10 sample participants)"
      footer={<DialogFooter><Btn variant="p" icon="down" onClick={() => { importParts(g); close() }}>Import</Btn></DialogFooter>}>
      <Field label="File"><div className="in ph-t"><Icon name="folder" />Select participants file</div></Field>
      <Field label="Year / group"><Select value={g} options={groups.map((x) => [x, x])} onChange={setG} /></Field>
    </Dialog>
  )
}

export function YearGroupDialog() {
  const { groups, participants, addGroup, deleteGroup, ask, close } = useApp()
  const [year, setYear] = useState('2026')
  const [grp, setGrp] = useState('2')
  return (
    <Dialog width="w1" icon="users" title="Year / group"
      footer={<DialogFooter><Btn variant="p" icon="plus" onClick={() => { addGroup(`${year} | ${grp}`); close() }}>Add year / group</Btn></DialogFooter>}>
      <div className="card flush" style={{ boxShadow: 'none', marginBottom: 16 }}>
        {groups.map((g) => (
          <div key={g} style={{ display: 'flex', alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid var(--line-2)' }}>
            <b>{g}</b>
            <span className="hint" style={{ margin: '0 0 0 auto' }}>{participants.filter((p) => p.group === g).length} participants</span>
            <button className="ib" onClick={() => ask({ title: `Delete group ${g}?`, message: 'Its participants are deleted too.', ok: 'Delete', danger: true, done: 'Group deleted', run: () => deleteGroup(g) })}><Icon name="trash" /></button>
          </div>
        ))}
      </div>
      <div className="row"><Field label="Year"><Input value={year} onChange={setYear} /></Field><Field label="Group"><Input value={grp} onChange={setGrp} /></Field></div>
    </Dialog>
  )
}

export function SearchParticipantsDialog() {
  const { participants, subject, open, close } = useApp()
  const [q, setQ] = useState('')
  const t = q.toLowerCase()
  const hits = t ? participants.filter((p) => p.subject === subject && `${p.name} ${p.surnames} ${p.dni} ${p.id}`.toLowerCase().includes(t)).slice(0, 8) : []
  return (
    <Dialog width="w2" icon="search" title="Search participants">
      <label className="in"><Icon name="search" /><input autoFocus placeholder="Name, DNI, ID or barcode…" value={q} onChange={(e) => setQ(e.target.value)} /></label>
      <div style={{ marginTop: 14 }}>
        {hits.map((p) => (
          <div key={p.sn} className="hov" onClick={() => { close(); open('participant', String(p.sn)) }}
            style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 10, marginBottom: 6, cursor: 'pointer' }}>
            <span className="ic-sq c-blue" style={{ width: 32, height: 32 }}><Icon name="users" /></span>
            <div><b>{p.surnames}, {p.name}</b><div className="hint" style={{ margin: 0 }}>{p.dni} · {p.email}</div></div>
            <Icon name="right" />
          </div>
        ))}
        {!hits.length && <div className="hint">{q ? 'No results.' : 'Start typing to search across all participants.'}</div>}
      </div>
    </Dialog>
  )
}
