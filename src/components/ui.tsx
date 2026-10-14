import type { ChangeEvent, ReactNode } from 'react'
import { translate } from '../i18n/runtime'
import { PATHS, type IconName } from '../lib/iconPaths'

export function Icon({ name, className = '' }: { name: IconName; className?: string }) {
  return (
    <svg
      className={`i ${className}`}
      viewBox="0 0 24 24"
      dangerouslySetInnerHTML={{ __html: PATHS[name] ?? '' }}
    />
  )
}

export function PageHead({
  title,
  sub,
  actions,
}: {
  title: ReactNode
  sub?: ReactNode
  actions?: ReactNode
}) {
  return (
    <div className="ph">
      <div>
        <h1>{title}</h1>
        {sub && <p>{sub}</p>}
      </div>
      {actions && <div className="act">{actions}</div>}
    </div>
  )
}

type BtnProps = {
  children?: ReactNode
  icon?: IconName
  right?: IconName
  variant?: string
  onClick?: () => void
  style?: React.CSSProperties
  disabled?: boolean
}
export function Btn({ children, icon, right, variant = '', onClick, style, disabled }: BtnProps) {
  return (
    <button className={`btn ${variant}`} onClick={onClick} style={style} disabled={disabled}>
      {icon && <Icon name={icon} />}
      {children}
      {right && <Icon name={right} />}
    </button>
  )
}

export const Pill = ({ tone, children, plain }: { tone: string; children: ReactNode; plain?: boolean }) => (
  <span className={`pill ${tone} ${plain ? 'np' : ''}`}>{children}</span>
)

export function Select({
  label,
  value,
  options,
  onChange,
}: {
  label?: string
  value: string
  options: [string, string][]
  onChange: (v: string) => void
}) {
  const cur = options.find((o) => o[0] === value) ?? options[0] ?? ['', '—']
  return (
    <label className="sel">
      {label && <span className="k">{label}</span>}
      <span className="v">{translate(cur[1])}</span>
      <select value={value} onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}>
        {options.length ? (
          options.map(([v, l]) => (
            <option key={v} value={v}>
              {translate(l)}
            </option>
          ))
        ) : (
          <option value="">—</option>
        )}
      </select>
      <Icon name="chev" />
    </label>
  )
}

export function Input({
  value,
  onChange,
  placeholder,
  icon,
  mono,
  type,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  icon?: IconName
  mono?: boolean
  type?: string
}) {
  return (
    <label className="in">
      {icon && <Icon name={icon} />}
      <input
        className={mono ? 'mono' : ''}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  )
}

export const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="field">
    <label className="f">{label}</label>
    {children}
  </div>
)

export function Empty({ icon, children }: { icon: IconName; children: ReactNode }) {
  return (
    <div className="empty">
      <div className="ic-sq">
        <Icon name={icon} />
      </div>
      {children}
    </div>
  )
}

export function Pager({
  page,
  total,
  per,
  onPage,
}: {
  page: number
  total: number
  per: number
  onPage: (p: number) => void
}) {
  const pages = Math.max(1, Math.ceil(total / per))
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '12px 16px',
        borderTop: '1px solid var(--line-2)',
        fontSize: 12.5,
        color: 'var(--muted)',
      }}
    >
      <span>{`${total ? page * per + 1 : 0}–${Math.min(total, (page + 1) * per)} of ${total}`}</span>
      <span style={{ marginLeft: 'auto' }} />
      <Btn variant="sm" disabled={page === 0} onClick={() => onPage(page - 1)}>
        Prev
      </Btn>
      <span>{`Page ${page + 1} / ${pages}`}</span>
      <Btn variant="sm" disabled={page >= pages - 1} onClick={() => onPage(page + 1)}>
        Next
      </Btn>
    </div>
  )
}

export function Check({
  on,
  onChange,
  children,
}: {
  on: boolean
  onChange: (v: boolean) => void
  children?: ReactNode
}) {
  return (
    <div className={`chk ${on ? 'on' : ''}`} onClick={() => onChange(!on)}>
      <span className="b">{on && <Icon name="check" />}</span>
      {children}
    </div>
  )
}

export function Stepper({
  value,
  onChange,
  min = 0,
  max = 999,
  step = 1,
}: {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  step?: number
}) {
  const clamp = (v: number) => Math.min(max, Math.max(min, v))
  return (
    <div className="stepper">
      <span onClick={() => onChange(clamp(value - step))}>−</span>
      <b>{value}</b>
      <span onClick={() => onChange(clamp(value + step))}>+</span>
    </div>
  )
}

export interface TabDef<T extends string> {
  id: T
  label: string
  icon?: IconName
}
export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  pill,
}: {
  tabs: TabDef<T>[]
  value: T
  onChange: (v: T) => void
  pill?: boolean
}) {
  return (
    <div className={`tabs ${pill ? 'pill-t' : ''}`}>
      {tabs.map((t) => (
        <span key={t.id} className={value === t.id ? 'on' : ''} onClick={() => onChange(t.id)}>
          {t.icon && <Icon name={t.icon} />}
          {translate(t.label)}
        </span>
      ))}
    </div>
  )
}

export function Seg<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: [T, string][]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="seg">
      {tabs.map(([id, label]) => (
        <span key={id} className={value === id ? 'on' : ''} onClick={() => onChange(id)}>
          {translate(label)}
        </span>
      ))}
    </div>
  )
}

export const Mini = ({ value, label, tone }: { value: ReactNode; label: string; tone?: string }) => (
  <div className="mini">
    <b style={tone ? { color: `var(--${tone})` } : undefined}>{value}</b>
    <span>{translate(label)}</span>
  </div>
)

export const Tag = ({ children }: { children: ReactNode }) => <span className="tagid">{children}</span>

export function TextArea({
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
}) {
  return (
    <textarea
      className="in"
      rows={rows}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

export function Drop({ title, hint, onDrop }: { title: string; hint?: string; onDrop?: () => void }) {
  return (
    <div className="drop" onClick={onDrop}>
      <div>
        <div className="ic">
          <Icon name="img" />
        </div>
        <b>{title}</b>
        {hint}
      </div>
    </div>
  )
}

export const Card = ({
  title,
  sub,
  right,
  children,
  flush,
  style,
}: {
  title?: ReactNode
  sub?: ReactNode
  right?: ReactNode
  children?: ReactNode
  flush?: boolean
  style?: React.CSSProperties
}) => (
  <div className={`card ${flush ? 'flush' : ''}`} style={style}>
    {title && (
      <div className="hd" style={flush ? { paddingBottom: 14 } : undefined}>
        <h3>{title}</h3>
        {sub && <span className="sub">{sub}</span>}
        {right && <div className="r">{right}</div>}
      </div>
    )}
    {children}
  </div>
)
export const Body = ({ children, style }: { children: ReactNode; style?: React.CSSProperties }) => (
  <div className="bd" style={style}>
    {children}
  </div>
)
export const Muted = ({ children }: { children: ReactNode }) => <div className="hint">{children}</div>
