import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Btn, Card, Body, Check, Empty, Field, Icon, Input, PageHead, Select } from '../components/ui'
import { SheetView } from '../components/SheetView'
import { useApp } from '../store/useApp'

/** Error sheets: HR = reading errors, HI = identity errors. */
export function Errors() {
  const nav = useNavigate()
  const { kind: param } = useParams()
  const kind = param === 'hi' ? 'HI' : 'HR'
  const { errorsHR, errorsHI, participants, loadErrors, deleteError, clearErrors, open, toast } = useApp()
  const list = kind === 'HR' ? errorsHR : errorsHI
  const [sel, setSel] = useState(0)
  const [anon, setAnon] = useState(true), [marks, setMarks] = useState('')
  const cur = list[Math.min(sel, list.length - 1)]
  const sheet = cur && participants.find((p) => p.sn === cur.pid)

  const removeCurrent = (msg?: string) => { if (cur) { deleteError(kind, cur.id); setSel(0); if (msg) toast(msg, 'Removed from the error list') } }
  return (<>
    <PageHead title={`Errors ${kind}`} sub={kind === 'HR' ? 'Sheets that could not be read reliably by OMR.' : 'Sheets whose participant identity could not be matched.'}
      actions={<Btn icon="back" onClick={() => nav('/grades')}>Back to grades</Btn>} />
    <div className="seg" style={{ marginBottom: 16 }}>
      <span className={kind === 'HR' ? 'on' : ''} onClick={() => { setSel(0); nav('/errors/hr') }}>Errors HR</span>
      <span className={kind === 'HI' ? 'on' : ''} onClick={() => { setSel(0); nav('/errors/hi') }}>Errors HI</span>
    </div>
    <div className="grid" style={{ gridTemplateColumns: '1.1fr 1fr', alignItems: 'start' }}>
      <div className="grid">
        <Card flush>
          <table>
            <thead><tr><th>ID</th><th>Model</th><th>Sheet</th><th>ID</th><th>Ex</th><th>Marks</th></tr></thead>
            <tbody>
              {list.map((e, i) => (
                <tr key={e.id} className={i === sel ? 'sel-row' : ''} style={{ cursor: 'pointer' }} onClick={() => setSel(i)}>
                  <td className="mono">{e.id}</td><td>{e.model}</td><td className="mono">{e.sheet}</td><td className="mono">{e.idr}</td><td>{e.ex}</td><td>{e.marks || '—'}</td>
                </tr>
              ))}
              {!list.length && <tr><td colSpan={6}><Empty icon="check">0 error sheets — every scanned sheet was read cleanly.<br />
                <a style={{ color: 'var(--brand)', fontWeight: 600, cursor: 'pointer' }} onClick={() => loadErrors(kind)}>Load sample error sheets</a></Empty></td></tr>}
            </tbody>
          </table>
        </Card>
        <Card><Body>
          <div className="sec-t">Recognised ID</div>
          <div className="row">
            <Field label="Proposed ID"><Select value={cur?.idr ?? ''} onChange={() => undefined} options={cur ? [cur.sheet, ...participants.slice(0, 8).map((p) => p.id)].map((x) => [x, x]) : [['', '—']]} /></Field>
            <div style={{ flex: '0 0 90px' }}><Field label="Model"><Select value="1" onChange={() => undefined} options={[['1', '1'], ['2', '2']]} /></Field></div>
          </div>
          <div style={{ margin: '14px 0' }}><Check on={anon} onChange={setAnon}>Anonymous correction</Check></div>
          <label className="f">Marks</label><Input value={marks} onChange={setMarks} placeholder="Marks" />
          <hr className="s" />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Btn variant="d" icon="trash" onClick={() => { clearErrors(kind); setSel(0); toast('All errors deleted') }}>Delete all errors</Btn>
            <Btn variant="p" icon="refresh" onClick={() => removeCurrent('Sheet corrected again')}>Correct again</Btn>
            <Btn variant="d" icon="trash" onClick={() => removeCurrent('Error sheet deleted')}>Delete</Btn>
          </div>
        </Body></Card>
      </div>
      <Card><Body>
        {sheet ? <SheetView p={sheet} rows={18} /> : (
          <div style={{ aspectRatio: '3/4', maxHeight: 520, display: 'grid', placeItems: 'center', borderRadius: 10, background: 'radial-gradient(circle at 50% 40%,#DCE6FF,#F3F6FF)', color: '#9DB0E6' }}><Icon name="img" /></div>
        )}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 14 }}>
          <button className="ib" onClick={() => toast('Rotated left')}><Icon name="rotl" /></button>
          <Btn variant="p" icon="eye" onClick={() => open('report', String(cur?.pid ?? 1))}>Show</Btn>
          <button className="ib" onClick={() => toast('Rotated right')}><Icon name="rotr" /></button>
        </div>
      </Body></Card>
    </div>
  </>)
}
