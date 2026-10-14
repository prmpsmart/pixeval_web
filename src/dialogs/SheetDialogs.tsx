import { Dialog, DialogFooter } from '../components/Dialog'
import { Btn } from '../components/ui'
import { useSubjectData } from '../lib/hooks'
import { useApp } from '../store/useApp'

export function InstructionsDialog() {
  return (
    <Dialog icon="eye" title="Instruction preview">
      <div className="sheetprev" style={{ padding: 26 }}>
        <b>Instructions</b>
        <ol style={{ color: 'var(--ink-2)', lineHeight: 1.8, margin: '10px 0 18px' }}>
          <li>Use a black or blue pen.</li><li>Fill each bubble completely.</li><li>Do not fold or stain this sheet.</li><li>Only one answer per question.</li>
        </ol>
        <div style={{ display: 'flex', gap: 18 }}><div className="bub"><i className="f" /> Correct</div><div className="bub"><i /> Empty</div></div>
      </div>
    </Dialog>
  )
}

export function BarcodesDialog() {
  const { participants } = useSubjectData()
  const { toast, close } = useApp()
  return (
    <Dialog width="w3" icon="barcode" title="Barcodes" sub="Unique identifiers for anonymous sheets"
      footer={<DialogFooter><Btn variant="p" icon="up" onClick={() => { toast('Barcodes exported', 'barcodes.pdf'); close() }}>Export</Btn></DialogFooter>}>
      <div className="grid g4" style={{ gap: 10 }}>
        {participants.slice(0, 12).map((p) => (
          <div key={p.sn} className="mini" style={{ textAlign: 'center' }}>
            <div style={{ height: 34, background: 'repeating-linear-gradient(90deg,#0E1726 0 2px,#fff 2px 4px,#0E1726 4px 5px,#fff 5px 8px)', borderRadius: 3, marginBottom: 6 }} />
            <span className="mono">{p.barcode}</span>
          </div>
        ))}
      </div>
    </Dialog>
  )
}
