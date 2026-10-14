import { Dialog } from '../components/Dialog'
import { Btn } from '../components/ui'
import { useApp } from '../store/useApp'

export function ConfirmDialog() {
  const c = useApp((s) => s.confirm)
  const { close, toast } = useApp.getState()
  if (!c) return null
  const run = () => { close(); c.run(); toast(c.done ?? 'Done') }
  return (
    <Dialog width="w1" icon={c.danger ? 'alert' : 'info'} title={c.title}
      footer={<div className="r">
        <Btn onClick={close}>Cancel</Btn>
        <Btn variant={c.danger ? '' : 'p'} style={c.danger ? { background: 'var(--bad)', borderColor: 'var(--bad)', color: '#fff' } : undefined} onClick={run}>{c.ok}</Btn>
      </div>}>
      <p style={{ margin: 0, color: 'var(--ink-2)', lineHeight: 1.6 }}>{c.message}</p>
    </Dialog>
  )
}
