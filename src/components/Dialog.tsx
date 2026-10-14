import { useEffect, type ReactNode } from 'react'
import { Icon, Btn } from './ui'
import type { IconName } from '../lib/iconPaths'
import { useApp } from '../store/useApp'

export function Dialog({
  title,
  sub,
  icon,
  width = 'w2',
  children,
  footer,
}: {
  title: ReactNode
  sub?: ReactNode
  icon?: IconName
  width?: 'w1' | 'w2' | 'w3' | 'w4'
  children: ReactNode
  footer?: ReactNode
}) {
  const close = useApp((s) => s.close)
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [close])
  return (
    <div className="ov show" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div className={`dlg ${width}`}>
        <div className="dh">
          {icon && (
            <span className="ic-sq c-blue" style={{ width: 34, height: 34 }}>
              <Icon name={icon} />
            </span>
          )}
          <div>
            <h2>{title}</h2>
            {sub && (
              <div className="hint" style={{ margin: '1px 0 0' }}>
                {sub}
              </div>
            )}
          </div>
          <button className="ib" onClick={close}>
            <Icon name="x" />
          </button>
        </div>
        <div className="db">{children}</div>
        {footer && <div className="df">{footer}</div>}
      </div>
    </div>
  )
}

export const DialogFooter = ({ children }: { children: ReactNode }) => {
  const close = useApp((s) => s.close)
  return (
    <div className="r">
      <Btn onClick={close}>Cancel</Btn>
      {children}
    </div>
  )
}
