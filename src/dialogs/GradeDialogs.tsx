import { Dialog, DialogFooter } from '../components/Dialog'
import { Btn, Check, Mini } from '../components/ui'
import { PathField } from '../components/PathField'
import { SheetView } from '../components/SheetView'
import { displayName, fmt, markTone, score } from '../lib/domain'
import { useSubjectData } from '../lib/hooks'
import { useApp } from '../store/useApp'
import { useState } from 'react'

export function ReportDialog({ arg }: { arg?: string }) {
  const data = useApp()
  const { participants } = useSubjectData()
  const p = data.participants.find((x) => String(x.sn) === arg) ?? participants[0]
  if (!p) return <Dialog width="w1" title="Exam report"><p>No sheets yet.</p></Dialog>
  const s = score(data, p)
  const done = data.corrected
  const { toast, close } = data
  return (
    <Dialog width="w3" icon="file" title="Exam report" sub={`${displayName(p)} · ID ${p.id}`}
      footer={<><Btn icon="mail" onClick={() => toast('Report emailed', p.email)}>Email</Btn>
        <DialogFooter><Btn variant="p" icon="file" onClick={() => { toast('Report saved', `report_${p.id}.pdf`); close() }}>Save report</Btn></DialogFooter></>}>
      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', alignItems: 'start' }}>
        <SheetView p={p} rows={20} />
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 14 }}>
            <span style={{ fontSize: 44, fontWeight: 700, letterSpacing: '-.04em' }} className={`mark ${done ? markTone(s.grade) : ''}`}>{done ? fmt(s.grade) : '—'}</span>
            <span style={{ color: 'var(--muted)' }}>/ 10</span>
          </div>
          <div className="grid g3" style={{ gap: 8 }}>
            <Mini value={done ? s.C : '—'} label="Correct" tone="ok" /><Mini value={done ? s.E : '—'} label="Errors" tone="bad" /><Mini value={done ? s.B : '—'} label="Blank" />
          </div>
          <hr className="s" />
          <div className="sec-t">Formula</div>
          <span className="formula">{data.formula}</span>
          <div className="hint" style={{ marginTop: 12 }}>Model 1 · {s.N} questions counted{data.cancelled.length ? ` (${data.cancelled.length} cancelled)` : ''}</div>
          {!done && <div className="hint" style={{ color: 'var(--warn)' }}>Run a correction to see results.</div>}
        </div>
      </div>
    </Dialog>
  )
}

export function OutputFolderDialog() {
  const { participants } = useSubjectData()
  const { toast, close, log } = useApp()
  const [marked, setMarked] = useState(true)
  const [anon, setAnon] = useState(false)
  const [zip, setZip] = useState(false)
  const run = () => { log('Bulk reports'); toast('Bulk reports generated', `${participants.length} PDFs`); close() }
  return (
    <Dialog icon="folder" title="Select output folder" sub="Bulk reports — one PDF per participant"
      footer={<DialogFooter><Btn variant="p" icon="file" onClick={run}>Generate</Btn></DialogFooter>}>
      <div className="field"><label className="f">Output folder</label><PathField id="bulkReports" placeholder="Select output folder" /></div>
      <div style={{ display: 'grid', gap: 10 }}>
        <Check on={marked} onChange={setMarked}>Include marked sheet</Check>
        <Check on={anon} onChange={setAnon}>Anonymize reports</Check>
        <Check on={zip} onChange={setZip}>Zip reports</Check>
      </div>
    </Dialog>
  )
}

export function StatisticsDialog() {
  const data = useApp()
  const { participants } = useSubjectData()
  const g = participants.map((p) => (data.corrected ? score(data, p).grade : 0)).sort((a, b) => a - b)
  const n = g.length || 1
  const avg = g.reduce((a, b) => a + b, 0) / n
  return (
    <Dialog icon="stats" title="Statistics" sub={`${participants.length} participants`}>
      {data.corrected && g.length ? (<>
        <div className="grid g4" style={{ gap: 10, marginBottom: 16 }}>
          <Mini value={fmt(avg)} label="Average" /><Mini value={fmt(g[n >> 1])} label="Median" /><Mini value={fmt(g[g.length - 1])} label="Highest" /><Mini value={fmt(g[0])} label="Lowest" />
        </div>
        <div className="hint">Pass rate (≥ 5): <b>{Math.round((g.filter((x) => x >= 5).length / n) * 100)}%</b></div>
      </>) : <div className="empty">Run a correction first to see statistics.</div>}
    </Dialog>
  )
}
