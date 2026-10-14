import { useApp } from '../store/useApp'
import { Icon } from './ui'

export function Toasts() {
  const toasts = useApp((s) => s.toasts)
  return (
    <div id="toasts">
      {toasts.map((t) => (
        <div className="toast" key={t.id}>
          <Icon name="check" />
          <div>
            {t.msg}
            {t.sub && <small>{t.sub}</small>}
          </div>
        </div>
      ))}
    </div>
  )
}
