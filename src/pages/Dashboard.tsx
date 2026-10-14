import { useNavigate } from 'react-router-dom'
import { Btn, Empty, Icon, PageHead, Pill } from '../components/ui'
import type { IconName } from '../lib/iconPaths'
import { fmt, score } from '../lib/domain'
import { USER } from '../data/seed'
import { useApp } from '../store/useApp'
import { tr } from '../i18n/mark'
import { translate } from '../i18n/runtime'

const Spark = ({ d, c }: { d: string; c: string }) => (
  <svg className="spark" viewBox="0 0 92 34">
    <path d={d} fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" />
  </svg>
)

function Kpi({
  icon,
  tone,
  label,
  value,
  sub,
  to,
  spark,
}: {
  icon: IconName
  tone: string
  label: string
  value: number
  sub: string
  to: string
  spark?: [string, string]
}) {
  const nav = useNavigate()
  return (
    <a className="card kpi hov" onClick={() => nav(to)}>
      <div className="l">
        <span className={`ic ${tone}`}>
          <Icon name={icon} />
        </span>
        {label}
      </div>
      <div className="v">{value}</div>
      <div className="d">{sub}</div>
      {spark && <Spark d={spark[0]} c={spark[1]} />}
    </a>
  )
}

export function Dashboard() {
  const nav = useNavigate()
  const d = useApp()
  const grades = d.participants.map((p) => score(d, p).grade)
  const bins = Array<number>(10).fill(0)
  grades.forEach((g) => bins[Math.min(9, Math.floor(g))]++)
  const mx = Math.max(1, ...bins)
  const avg = grades.length ? grades.reduce((a, b) => a + b, 0) / grades.length : 0
  const pass = grades.filter((g) => g >= 5).length
  const errors = d.errorsHR.length + d.errorsHI.length
  const models = d.exams.reduce((a, e) => a + e.models, 0)
  const steps: [string, string, string, boolean][] = [
    [tr('Subjects & Topics'), `${d.subjects.length} · ${d.topics.length}`, '/subjects', true],
    [tr('Question bank'), tr(`${d.questions.length} questions`), '/questions', d.questions.length > 0],
    [
      tr('Compose exam'),
      tr(`${d.exams.length} exam${d.exams.length === 1 ? '' : 's'}`),
      '/add-exam',
      d.exams.length > 0,
    ],
    [tr('Answer sheets'), tr('Print & administer'), '/sheets', false],
    [tr('Correction'), tr('Scan & assign'), '/corrections', false],
    [tr('Grades'), tr('Export & report'), '/grades', false],
  ]
  const cur = steps.findIndex((s) => !s[3])
  const last = d.exams[d.exams.length - 1]

  return (
    <>
      <PageHead
        title={`Good morning, ${USER.name.split(' ')[0]}`}
        sub={
          <>
            Here’s the state of your examination workspace — <span className="mono">{USER.db}</span>
          </>
        }
        actions={
          <>
            <Btn icon="down" onClick={() => nav('/questions')}>
              Import
            </Btn>
            <Btn variant="p" icon="plus" onClick={() => nav('/add-exam')}>
              New exam
            </Btn>
          </>
        }
      />

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="bd" style={{ padding: '18px 22px' }}>
          <div className="flow">
            {steps.map((s, i) => (
              <div
                key={s[0]}
                className={`st ${i < cur ? 'done' : i === cur ? 'cur' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => nav(s[2])}
              >
                <div className="nd">{i < cur ? <Icon name="check" /> : i + 1}</div>
                <div className="tx">
                  {s[0]}
                  <small>{s[1]}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid g4" style={{ marginBottom: 16 }}>
        <Kpi
          icon="layers"
          tone="c-blue"
          label="Subjects"
          value={d.subjects.length}
          sub={`${d.topics.length} topic${d.topics.length === 1 ? '' : 's'}`}
          to="/subjects"
        />
        <Kpi
          icon="help"
          tone="c-vio"
          label="Questions"
          value={d.questions.length}
          sub={`across ${d.topics.length} topic${d.topics.length === 1 ? '' : 's'}`}
          to="/questions"
          spark={['M0 28 14 24 28 26 42 16 56 18 70 8 92 4', '#7A5AF8']}
        />
        <Kpi
          icon="users"
          tone="c-teal"
          label="Participants"
          value={d.participants.length}
          sub={`${d.groups.length} year / group${d.groups.length === 1 ? '' : 's'}`}
          to="/participants"
          spark={['M0 30 18 26 36 22 54 20 72 12 92 6', '#0891B2']}
        />
        <Kpi
          icon="file"
          tone="c-ok"
          label="Exams"
          value={d.exams.length}
          sub={`${models} model${models === 1 ? '' : 's'}`}
          to="/exams"
        />
      </div>

      <div className="grid g21" style={{ marginBottom: 16 }}>
        <div className="grid" style={{ alignContent: 'start' }}>
          <div className="card flush">
            <div className="hd" style={{ paddingBottom: 14 }}>
              <h3>Subject listing</h3>
              <span className="sub">
                {`${d.subjects.length} subject${d.subjects.length === 1 ? '' : 's'}`}
              </span>
            </div>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Subject</th>
                  <th className="n">Topics</th>
                  <th className="n">Questions</th>
                  <th className="n">Exams</th>
                  <th>Coverage</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {d.subjects.map((s) => {
                  const nq = d.questions.filter((q) => q.subject === s.id).length,
                    ne = d.exams.filter((e) => e.subject === s.id).length,
                    nt = d.topics.filter((t) => t.subject === s.id).length
                  return (
                    <tr
                      key={s.id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        d.set({ subject: s.id })
                        nav('/subjects')
                      }}
                    >
                      <td>
                        <span className="tagid">{s.id}</span>
                      </td>
                      <td>
                        <b>{s.name}</b>
                      </td>
                      <td className="n">{nt}</td>
                      <td className="n">{nq}</td>
                      <td className="n">{ne}</td>
                      <td style={{ width: 200 }}>
                        <div className="bar">
                          <i style={{ width: nq ? '100%' : 0 }} />
                        </div>
                        <div className="hint" style={{ marginTop: 3 }}>
                          {nq ? `${nq} questions · ${ne} exam${ne === 1 ? '' : 's'}` : 'No questions yet'}
                        </div>
                      </td>
                      <td>
                        <Icon name="right" />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="card">
            <div className="hd">
              <h3>Grade distribution</h3>
              {d.corrected && (
                <>
                  <span className="sub">{`${d.participants.length} participants`}</span>
                  <div className="r">
                    <Pill tone="c-blue" plain>
                      {`Avg ${fmt(avg)}`}
                    </Pill>
                    <Pill tone="c-ok" plain>
                      {`${pass} passed`}
                    </Pill>
                  </div>
                </>
              )}
            </div>
            {d.corrected ? (
              <div className="bd">
                <div className="bars">
                  {bins.map((b, i) => (
                    <div key={i}>
                      <b>{b}</b>
                      <i style={{ height: `${Math.max(2, (b / mx) * 100)}%` }} />
                      <span>
                        {i}–{i + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <Empty icon="grade">
                No grades yet.{' '}
                <a
                  style={{ color: 'var(--brand)', fontWeight: 600, cursor: 'pointer' }}
                  onClick={() => nav('/corrections')}
                >
                  Run a correction
                </a>
              </Empty>
            )}
          </div>
        </div>
        <div className="grid" style={{ alignContent: 'start' }}>
          <div className="card">
            <div className="hd">
              <h3>Health</h3>
              <div className="r">
                <Pill tone="c-ok">All clear</Pill>
              </div>
            </div>
            <div className="bd">
              {[
                [
                  'c-ok',
                  'check',
                  tr(`${errors} error sheets`),
                  tr('Nothing waiting for recovery'),
                  () => nav('/errors/hr'),
                ],
                [
                  'c-blue',
                  'scan',
                  tr(`${d.logs.length} log entries`),
                  tr('Audit trail recorded'),
                  () => nav('/utilities'),
                ],
                [
                  d.saving ? 'c-ok' : 'c-warn',
                  d.saving ? 'check' : 'alert',
                  tr(d.saving ? 'Saving to DB' : 'Not saving to DB'),
                  tr(d.saving ? 'Changes are persisted' : 'Click to turn on and persist changes'),
                  () => d.setSaving(!d.saving),
                ] as const,
              ].map(([tone, icon, t, s, fn]) => (
                <div
                  key={t as string}
                  style={{
                    display: 'flex',
                    gap: 14,
                    alignItems: 'center',
                    padding: '6px 0',
                    cursor: 'pointer',
                  }}
                  onClick={fn as () => void}
                >
                  <span className={`ic-sq ${tone}`} style={{ width: 34, height: 34 }}>
                    <Icon name={icon as IconName} />
                  </span>
                  <div>
                    <b>{t as string}</b>
                    <div className="hint" style={{ margin: 0 }}>
                      {s as string}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div
            className="card"
            style={{ background: 'linear-gradient(160deg,#0B1630,#1B2E66)', color: '#fff', border: 0 }}
          >
            <div className="bd">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  color: '#9DB6FF',
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: '.06em',
                  textTransform: 'uppercase',
                }}
              >
                <Icon name="spark" />
                Suggested next step
              </div>
              <div style={{ fontSize: 17, fontWeight: 650, margin: '10px 0 6px', letterSpacing: '-.01em' }}>
                {last ? `Generate answer sheets for ${last.name}` : 'Generate answer sheets for your exam'}
              </div>
              <div style={{ color: '#B9C6E6', fontSize: 13, marginBottom: 14 }}>
                {`${d.questions.length} questions in the bank and ${errors} pending errors.`}
              </div>
              <button
                className="btn"
                style={{ background: '#fff', border: 0, color: '#0B1630' }}
                onClick={() => nav('/sheets')}
              >
                Open sheets management
                <Icon name="right" />
              </button>
            </div>
          </div>
          <div className="card flush">
            <div className="hd" style={{ paddingBottom: 10 }}>
              <h3>Recent activity</h3>
              <div className="r">
                <a
                  style={{ color: 'var(--brand)', fontWeight: 600, fontSize: 12.5, cursor: 'pointer' }}
                  onClick={() => nav('/utilities')}
                >
                  All logs
                </a>
              </div>
            </div>
            <div style={{ padding: '0 20px 14px' }}>
              {d.logs.slice(0, 5).map((l) => (
                <div
                  key={l.n + l.time}
                  style={{
                    display: 'flex',
                    gap: 10,
                    alignItems: 'center',
                    padding: '7px 0',
                    borderBottom: '1px solid var(--line-2)',
                    fontSize: 12.5,
                  }}
                >
                  <span className={`lv ${l.level}`}>{l.level}</span>
                  <span style={{ flex: 1 }}>{l.action}</span>
                  <span className="mono" style={{ color: 'var(--muted)', fontSize: 11 }}>
                    {l.time.slice(5, 16)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div
          className="bd"
          style={{
            padding: '14px 22px',
            display: 'flex',
            gap: 28,
            alignItems: 'center',
            fontSize: 13,
            color: 'var(--ink-2)',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--muted)' }}>
            <Icon name="key" />
            License
          </span>
          <span>
            <span style={{ color: 'var(--muted)' }}>User</span>&nbsp; <b>{USER.email}</b>
          </span>
          <span>
            <span style={{ color: 'var(--muted)' }}>Valid until</span>&nbsp; <b>{USER.license}</b>
          </span>
          <span className="pill c-warn">{translate(USER.mode)}</span>
          <span style={{ marginLeft: 'auto' }} className="mono">
            {USER.db} · v{USER.version}
          </span>
        </div>
      </div>
    </>
  )
}
