import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Btn, Field, Icon, Input } from '../components/ui'
import { USER } from '../data/seed'
import { useApp } from '../store/useApp'

export function Login() {
  const nav = useNavigate()
  const log = useApp((s) => s.log)
  const [tab, setTab] = useState<'login' | 'proxy'>('login')
  const [email, setEmail] = useState(USER.email)
  const [proxy, setProxy] = useState({ host: '', port: '', user: '', pass: '' })
  const bubbles = [1, 2, 0, 1, 0, 2, 1]
  return (
    <div className="lgrid">
      <div className="hero">
        <div className="brand" style={{ padding: 0 }}>
          <div className="logo">X</div>
          <div>
            <b>
              pi<i>X</i>eval
            </b>
          </div>
        </div>
        <div className="sheet">
          <div style={{ fontWeight: 700, fontSize: 13 }}>TJ – Técnico Jurídico</div>
          <div style={{ fontSize: 11, color: '#8A94A8', marginBottom: 10 }}>Examen TJ (02/01/2026)</div>
          {bubbles.map((b, i) => (
            <div className="r" key={i}>
              <b>{String(i + 1).padStart(2, '0')}</b>
              {[0, 1, 2].map((o) => (
                <i key={o} className={`o ${o === b ? 'f' : ''}`} />
              ))}
            </div>
          ))}
        </div>
        <h2>From question bank to published grades.</h2>
        <p>
          The complete lifecycle of paper-based, OMR-graded examinations — built for institutions that need
          every sheet accounted for.
        </p>
        <div className="feat">
          <span>
            <Icon name="lock" />
            Anonymous sheets
          </span>
          <span>
            <Icon name="scan" />
            OMR correction
          </span>
          <span>
            <Icon name="grade" />
            Grades &amp; reports
          </span>
        </div>
      </div>
      <div className="form">
        <div className="fb">
          <div className="seg">
            {(['login', 'proxy'] as const).map((t) => (
              <span key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>
                {t === 'login' ? 'Login' : 'Proxy'}
              </span>
            ))}
          </div>
          <div style={{ height: 26 }} />
          {tab === 'login' ? (
            <>
              <h1>Welcome back</h1>
              <p>Sign in with your license email and open your database.</p>
              <Field label="Email address">
                <Input icon="mail" value={email} onChange={setEmail} placeholder="you@institution.edu" />
              </Field>
              <Field label="Select DB folder">
                <div className="in">
                  <Icon name="db" />
                  <span className="mono" style={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    …/extra/18-02-2026/sheet_omr.db
                  </span>
                  <Icon name="folder" />
                </div>
                <div className="hint">Last opened · 18 Feb 2026</div>
              </Field>
              <Btn
                variant="p lg"
                right="right"
                style={{ width: '100%', justifyContent: 'center', marginTop: 10 }}
                onClick={() => {
                  log('Login')
                  nav('/dashboard')
                }}
              >
                Login
              </Btn>
            </>
          ) : (
            <>
              <h1>Proxy settings</h1>
              <p>Route piXeval's license check through your institution's proxy.</p>
              <div className="row">
                <Field label="Proxy server">
                  <Input
                    icon="globe"
                    value={proxy.host}
                    onChange={(v) => setProxy({ ...proxy, host: v })}
                    placeholder="proxy.institution.edu"
                  />
                </Field>
                <div style={{ flex: '0 0 100px' }}>
                  <Field label="Port">
                    <Input
                      value={proxy.port}
                      onChange={(v) => setProxy({ ...proxy, port: v })}
                      placeholder="8080"
                    />
                  </Field>
                </div>
              </div>
              <Field label="User">
                <Input
                  value={proxy.user}
                  onChange={(v) => setProxy({ ...proxy, user: v })}
                  placeholder="Enter proxy user"
                />
              </Field>
              <Field label="Password">
                <Input
                  icon="key"
                  type="password"
                  value={proxy.pass}
                  onChange={(v) => setProxy({ ...proxy, pass: v })}
                  placeholder="Enter password"
                />
              </Field>
              <Btn
                variant="p lg"
                style={{ width: '100%', justifyContent: 'center', marginTop: 10 }}
                onClick={() => {
                  useApp.getState().toast('Proxy saved', 'Demo: not applied')
                  setTab('login')
                }}
              >
                Save proxy
              </Btn>
            </>
          )}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 22,
              fontSize: 12.5,
              color: 'var(--muted)',
            }}
          >
            <span>
              Need help?{' '}
              <b
                style={{ color: 'var(--brand)', cursor: 'pointer' }}
                onClick={() => useApp.getState().toast('Guide', 'Opens the user guide in the real app')}
              >
                Open guide
              </b>
            </span>
            <span className="mono">v{USER.version}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
