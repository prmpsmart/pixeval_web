import { useNavigate } from 'react-router-dom'
import { Btn, Card, Body, Empty, Icon, Mini, PageHead, Pill } from '../components/ui'
import { SubjectSelect } from '../components/ContextBar'
import { examName } from '../lib/domain'
import { useSubjectData } from '../lib/hooks'
import { useApp } from '../store/useApp'

export function Exams() {
  const nav = useNavigate()
  const { subjects, subject, set, open, ask, deleteExam } = useApp()
  const { exams, questions, topics } = useSubjectData()
  const s = subjects.find((x) => x.id === subject)
  const quick: [string, string, 'print' | 'scan' | 'uid' | 'grade'][] = [
    ['Sheets management', '/sheets', 'print'],
    ['Corrections', '/corrections', 'scan'],
    ['Assign identities', '/assign', 'uid'],
    ['Grades', '/grades', 'grade'],
  ]
  return (
    <>
      <PageHead
        title="Exam details"
        sub="View and edit exam details"
        actions={
          <Btn variant="p" icon="plus" onClick={() => nav('/add-exam')}>
            New
          </Btn>
        }
      />
      <div style={{ maxWidth: 420, marginBottom: 18 }}>
        <SubjectSelect />
      </div>
      <div className="grid" style={{ gridTemplateColumns: '340px 1fr', alignItems: 'start' }}>
        <Card>
          <Body>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
              <span className="ic-sq c-blue" style={{ width: 44, height: 44, borderRadius: 12 }}>
                <Icon name="book" />
              </span>
              <div>
                <div className="mono" style={{ color: 'var(--brand)', fontWeight: 700 }}>
                  {s?.id}
                </div>
                <b style={{ fontSize: 16 }}>{s?.name ?? '—'}</b>
              </div>
            </div>
            <div className="grid g3" style={{ gap: 8 }}>
              <Mini value={topics.length} label="Topics" />
              <Mini value={questions.length} label="Questions" />
              <Mini value={exams.length} label="Exams" />
            </div>
            <hr className="s" />
            <div className="sec-t">Quick actions</div>
            <div style={{ display: 'grid', gap: 6 }}>
              {quick.map(([l, to, i]) => (
                <Btn key={to} icon={i} style={{ justifyContent: 'flex-start' }} onClick={() => nav(to)}>
                  {l}
                </Btn>
              ))}
            </div>
          </Body>
        </Card>
        <Card title="Exams" sub={`${exams.length} exam${exams.length === 1 ? '' : 's'}`}>
          <Body style={{ paddingTop: 0, display: 'grid', gap: 10 }}>
            {exams.map((e) => (
              <div
                key={e.id}
                className="hov"
                style={{
                  border: '1px solid var(--line)',
                  borderRadius: 12,
                  padding: 18,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  boxShadow: 'var(--shadow)',
                  borderLeft: `4px solid ${e.status === 'open' ? 'var(--brand)' : 'var(--faint)'}`,
                }}
              >
                <span className="ic-sq c-vio" style={{ width: 44, height: 44, borderRadius: 12 }}>
                  <Icon name="print" />
                </span>
                <div>
                  <b style={{ fontSize: 15 }}>{examName(e)}</b>
                  <div
                    style={{ display: 'flex', gap: 16, color: 'var(--muted)', fontSize: 12.5, marginTop: 4 }}
                  >
                    <span>
                      Models: <b style={{ color: 'var(--ink)' }}>{e.models}</b>
                    </span>
                    <span>
                      Questions: <b style={{ color: 'var(--ink)' }}>{e.qs ?? questions.length}</b>
                    </span>
                    <span>
                      Created: <b style={{ color: 'var(--ink)' }}>{e.created.slice(0, 10)}</b>
                    </span>
                  </div>
                </div>
                <Pill tone={e.status === 'open' ? 'c-ok' : 'c-warn'}>
                  {e.status === 'open' ? 'Open' : 'Closed'}
                </Pill>
                <span style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                  <Btn variant="sm" icon="edit" onClick={() => open('edit-exam', String(e.id))}>
                    Edit
                  </Btn>
                  <Btn
                    variant="sm d"
                    icon="trash"
                    onClick={() =>
                      ask({
                        title: 'Delete exam?',
                        message: `${examName(e)} and its grades are deleted.`,
                        ok: 'Delete',
                        danger: true,
                        done: 'Exam deleted',
                        run: () => deleteExam(e.id),
                      })
                    }
                  />
                  <Btn
                    variant="sm"
                    right="right"
                    onClick={() => {
                      set({ exam: String(e.id) })
                      nav('/history')
                    }}
                  >
                    Open
                  </Btn>
                </span>
              </div>
            ))}
            {!exams.length && (
              <Empty icon="file">
                No exams for this subject yet.{' '}
                <a
                  style={{ color: 'var(--brand)', fontWeight: 600, cursor: 'pointer' }}
                  onClick={() => nav('/add-exam')}
                >
                  Create one
                </a>
              </Empty>
            )}
          </Body>
        </Card>
      </div>
    </>
  )
}
