import { Dialog } from '../components/Dialog'
import { USER } from '../data/seed'

export function CreditsDialog() {
  return (
    <Dialog icon="award" title="Credits" sub="Developer and tools used">
      <div className="sec-t">Tools</div>
      <div className="grid g4" style={{ gap: 10, marginBottom: 20 }}>
        {['Python', 'Qt / PySide', 'SQLite', 'OpenCV', 'NumPy', 'Java', 'piXeval', 'DINATEN'].map((t) => (
          <div key={t} className="mini" style={{ height: 84, display: 'grid', placeItems: 'center', textAlign: 'center', fontWeight: 700, color: 'var(--ink-2)' }}>{t}</div>
        ))}
      </div>
      <hr className="s" />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>Developed by <b style={{ fontSize: 20, color: '#0891B2', letterSpacing: '.04em' }}>DINATEN</b><span className="mono hint" style={{ marginLeft: 'auto' }}>v{USER.version}</span></div>
    </Dialog>
  )
}
