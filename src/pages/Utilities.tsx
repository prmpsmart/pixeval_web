import { useMemo, useState } from 'react'
import {
  Btn,
  Card,
  Body,
  Check,
  Empty,
  Field,
  Input,
  PageHead,
  Pager,
  Pill,
  Select,
  Seg,
  Stepper,
  Tabs,
  Tag,
} from '../components/ui'
import { GroupSelect, SubjectSelect } from '../components/ContextBar'
import { PathField } from '../components/PathField'
import { useSubjectData } from '../lib/hooks'
import { useApp } from '../store/useApp'
import { Icon } from '../components/ui'

type Tab = 'subjects' | 'parts' | 'backup' | 'translate' | 'logs'
const TABS = [
  { id: 'subjects' as const, label: 'Subjects', icon: 'layers' as const },
  { id: 'parts' as const, label: 'Participants', icon: 'users' as const },
  { id: 'backup' as const, label: 'Backup', icon: 'db' as const },
  { id: 'translate' as const, label: 'Translate', icon: 'lang' as const },
  { id: 'logs' as const, label: 'Logs', icon: 'list' as const },
]

/** A "Delete" button that asks for confirmation and warns about cascading deletion. */
function DeleteButton({ what, cascade, run }: { what: string; cascade?: string; run: () => void }) {
  const ask = useApp((s) => s.ask)
  return (
    <Btn
      variant="sm d"
      icon="trash"
      onClick={() =>
        ask({
          title: `Delete ${what}?`,
          message: `This is a cascading deletion${cascade ? `: ${cascade}` : ''}. It cannot be undone once the database is saved.`,
          ok: 'Delete',
          danger: true,
          done: `${what} deleted`,
          run,
        })
      }
    >
      Delete
    </Btn>
  )
}

function SubjectsTab() {
  const data = useApp()
  const {
    subjects,
    topics,
    groups,
    exams,
    deleteSubject,
    deleteTopic,
    deleteGroup,
    deleteExam,
    set,
    log,
    clearErrors,
  } = data
  const [mode, setMode] = useState<'all' | 'single'>('all')
  const [sub, setSub] = useState<'topics' | 'groups' | 'exams'>('topics')
  const mine = useSubjectData()
  const e = mine.exam
  return (
    <>
      <Seg
        tabs={[
          ['all', 'All subjects'],
          ['single', 'Single subject'],
        ]}
        value={mode}
        onChange={setMode}
      />
      <div style={{ height: 16 }} />
      {mode === 'all' ? (
        <Card flush>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Subject</th>
                <th className="n">Topics</th>
                <th className="n">Questions</th>
                <th className="n">Exams</th>
                <th className="n">Participants</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {subjects.map((s) => (
                <tr key={s.id}>
                  <td>
                    <Tag>{s.id}</Tag>
                  </td>
                  <td>
                    <b>{s.name}</b>
                  </td>
                  <td className="n">{topics.filter((t) => t.subject === s.id).length}</td>
                  <td className="n">{data.questions.filter((q) => q.subject === s.id).length}</td>
                  <td className="n">{exams.filter((x) => x.subject === s.id).length}</td>
                  <td className="n">{data.participants.filter((p) => p.subject === s.id).length}</td>
                  <td className="n">
                    <DeleteButton
                      what={`subject ${s.id}`}
                      cascade="topics, questions, exams, groups and grades go with it"
                      run={() => deleteSubject(s.id)}
                    />
                  </td>
                </tr>
              ))}
              {!subjects.length && (
                <tr>
                  <td colSpan={7}>
                    <Empty icon="layers">No subjects.</Empty>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      ) : (
        <>
          <div style={{ maxWidth: 420, marginBottom: 16 }}>
            <SubjectSelect />
          </div>
          <Tabs
            pill
            tabs={[
              { id: 'topics', label: 'Topics' },
              { id: 'groups', label: 'Year / groups' },
              { id: 'exams', label: 'Exams' },
            ]}
            value={sub}
            onChange={setSub}
          />
          {sub === 'topics' && (
            <Card flush>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Topic</th>
                    <th className="n">Chapter</th>
                    <th className="n">Questions</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {mine.topics.map((t) => (
                    <tr key={t.id}>
                      <td className="mono">{t.id}</td>
                      <td>
                        <b>{t.name}</b>
                      </td>
                      <td className="n">{t.chapter}</td>
                      <td className="n">{mine.questions.filter((q) => q.topic === t.id).length}</td>
                      <td className="n">
                        <DeleteButton
                          what={`topic ${t.id}`}
                          cascade="its questions are removed"
                          run={() => deleteTopic(t.id)}
                        />
                      </td>
                    </tr>
                  ))}
                  {!mine.topics.length && (
                    <tr>
                      <td colSpan={5}>
                        <Empty icon="layers">No topics.</Empty>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Card>
          )}
          {sub === 'groups' && (
            <Card flush>
              <table>
                <thead>
                  <tr>
                    <th>Year / group</th>
                    <th className="n">Participants</th>
                    <th className="n">Exams</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {groups.map((g) => (
                    <tr key={g}>
                      <td>
                        <b>{g}</b>
                      </td>
                      <td className="n">{data.participants.filter((p) => p.group === g).length}</td>
                      <td className="n">{mine.exams.length}</td>
                      <td className="n">
                        <DeleteButton
                          what={`group ${g}`}
                          cascade="participants and their grades are removed"
                          run={() => deleteGroup(g)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
          {sub === 'exams' && (
            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', alignItems: 'start' }}>
              <Card flush>
                <table>
                  <thead>
                    <tr>
                      <th>Exam</th>
                      <th>Date</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {mine.exams.map((x) => (
                      <tr
                        key={x.id}
                        className={e && x.id === e.id ? 'sel-row' : ''}
                        style={{ cursor: 'pointer' }}
                        onClick={() => set({ exam: String(x.id) })}
                      >
                        <td>
                          <b>{x.name}</b> <span className="mono">#{x.id}</span>
                        </td>
                        <td className="mono">{x.date}</td>
                        <td className="n">
                          <DeleteButton
                            what={`exam ${x.id}`}
                            cascade="sheets and grades go with it"
                            run={() => deleteExam(x.id)}
                          />
                        </td>
                      </tr>
                    ))}
                    {!mine.exams.length && (
                      <tr>
                        <td colSpan={3}>
                          <Empty icon="file">No exams.</Empty>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </Card>
              {e && (
                <Card
                  title={
                    <>
                      {e.name}{' '}
                      <span className="mono" style={{ color: 'var(--muted)' }}>
                        #{e.id}
                      </span>
                    </>
                  }
                >
                  <Body style={{ display: 'grid', gap: 10 }}>
                    {(
                      [
                        [
                          'Error sheets',
                          `${data.errorsHR.length + data.errorsHI.length} sheets`,
                          'alert',
                          () => clearErrors(),
                        ],
                        [
                          'Exam questions',
                          `${e.qs ?? mine.questions.length} questions`,
                          'help',
                          () => data.saveExam(e.id, { qs: 0 }),
                        ],
                        [
                          'Grades',
                          `${data.corrected ? mine.participants.length : 0} grades`,
                          'grade',
                          () => {
                            set({ corrected: false })
                            log('Delete grades')
                          },
                        ],
                      ] as const
                    ).map(([label, count, icon, run]) => (
                      <div
                        key={label}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          border: '1px solid var(--line)',
                          borderRadius: 10,
                          padding: '10px 14px',
                        }}
                      >
                        <span className="ic-sq c-blue" style={{ width: 32, height: 32 }}>
                          <Icon name={icon} />
                        </span>
                        <div style={{ flex: 1 }}>
                          <b>{label}</b>
                          <div className="hint" style={{ margin: 0 }}>
                            {count}
                          </div>
                        </div>
                        <DeleteButton what={label.toLowerCase()} run={run} />
                      </div>
                    ))}
                  </Body>
                </Card>
              )}
            </div>
          )}
        </>
      )}
    </>
  )
}

function ParticipantsTab() {
  const { group, deletePart, deleteGroupParts } = useApp()
  const { participants } = useSubjectData()
  const rows = participants.filter((p) => p.group === group)
  return (
    <>
      <div style={{ maxWidth: 420, marginBottom: 16 }}>
        <GroupSelect />
      </div>
      <Card
        flush
        title={`Participants in ${group}`}
        sub={rows.length}
        right={
          <DeleteButton
            what="all participants of the group"
            cascade="their grades are removed"
            run={deleteGroupParts}
          />
        }
      >
        <div className="tablewrap" style={{ maxHeight: 420 }}>
          <table>
            <thead>
              <tr>
                <th>S/N</th>
                <th>DNI</th>
                <th>Name</th>
                <th>Email</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 30).map((p) => (
                <tr key={p.sn}>
                  <td className="mono">{p.sn}</td>
                  <td className="mono">{p.dni}</td>
                  <td>
                    {p.surnames}, {p.name}
                  </td>
                  <td style={{ color: 'var(--muted)' }}>{p.email}</td>
                  <td className="n">
                    <DeleteButton
                      what="participant"
                      cascade="their grades are removed"
                      run={() => deletePart(p.sn)}
                    />
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td colSpan={5}>
                    <Empty icon="users">No participants in this group.</Empty>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}

function BackupTab() {
  const { backups, addBackup, ask, paths } = useApp()
  const [name, setName] = useState('backup_sheet_omr_2026-07-03')
  const [days, setDays] = useState(30)
  return (
    <>
      <Card title="Backup">
        <Body>
          <div className="row" style={{ alignItems: 'end' }}>
            <div style={{ flex: 2 }}>
              <label className="f">Backup folder</label>
              <PathField id="backup" placeholder="Select backup folder" />
            </div>
            <div style={{ flex: '0 0 190px' }}>
              <label className="f">Days to backup</label>
              <Stepper value={days} min={1} max={365} onChange={setDays} />
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <Field label="File name">
              <Input mono value={name} onChange={setName} />
            </Field>
          </div>
          <hr className="s" />
          <Btn
            variant="p"
            icon="db"
            onClick={() => addBackup(name, paths.backup ?? 'C:/Users/aesco/Desktop')}
          >
            Backup
          </Btn>
        </Body>
      </Card>
      <Card flush title="Previous backups" sub={backups.length} style={{ marginTop: 16 }}>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Path</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {backups.map((b, i) => (
              <tr key={i}>
                <td className="mono">{b.date}</td>
                <td className="mono" style={{ color: 'var(--ink-2)' }}>
                  {b.path}
                </td>
                <td className="n">
                  <Btn
                    variant="sm"
                    icon="refresh"
                    onClick={() =>
                      ask({
                        title: 'Restore backup?',
                        message: 'The current database will be replaced by this backup.',
                        ok: 'Restore',
                        done: 'Backup restored',
                        run: () => useApp.getState().log('Restore backup'),
                      })
                    }
                  >
                    Restore
                  </Btn>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  )
}

function TranslateTab() {
  const { translated, set, log, toast } = useApp()
  const { questions, topics } = useSubjectData()
  const run = () => {
    set({ translated: true })
    log('Translate questions')
    toast('Questions translated', `${questions.length} questions · es → en`)
  }
  const swap = (s: string) =>
    s
      .replace('Pregunta', 'Question')
      .replace('respuesta correcta', 'correct answer')
      .replace('De MC', 'From MC')
  return (
    <div className="grid" style={{ gridTemplateColumns: '420px 1fr', alignItems: 'start' }}>
      <Card title="Translate questions">
        <Body>
          <Field label="Subject">
            <SubjectSelect />
          </Field>
          <Field label="Topic">
            <Select
              value={String(topics[0]?.id ?? '')}
              onChange={() => undefined}
              options={topics.map((t) => [String(t.id), t.name])}
            />
          </Field>
          <div className="row">
            <Field label="From">
              <Select
                value="es"
                onChange={() => undefined}
                options={[
                  ['es', 'es Español'],
                  ['en', 'en English'],
                  ['ca', 'ca Català'],
                ]}
              />
            </Field>
            <Field label="To">
              <Select
                value="en"
                onChange={() => undefined}
                options={[
                  ['en', 'en English'],
                  ['es', 'es Español'],
                  ['ca', 'ca Català'],
                ]}
              />
            </Field>
          </div>
          <div style={{ margin: '4px 0 14px' }}>
            <Check on={false} onChange={() => undefined}>
              Overwrite existing translations
            </Check>
          </div>
          <Btn variant="p" icon="lang" style={{ width: '100%', justifyContent: 'center' }} onClick={run}>
            Translate questions
          </Btn>
        </Body>
      </Card>
      <Card
        flush
        title="Preview"
        right={
          translated ? (
            <Pill tone="c-ok">{questions.length} translated</Pill>
          ) : (
            <Pill tone="c-warn" plain>
              Not run
            </Pill>
          )
        }
      >
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Original</th>
              <th>Translation</th>
            </tr>
          </thead>
          <tbody>
            {questions.slice(0, 6).map((q) => (
              <tr key={q.id}>
                <td className="mono">{q.id}</td>
                <td>{q.text}</td>
                <td>{translated ? swap(q.text) : <span style={{ color: 'var(--faint)' }}>—</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

const PER = 15
function LogsTab() {
  const { logs, set, toast, ask } = useApp()
  const [q, setQ] = useState(''),
    [level, setLevel] = useState('All'),
    [page, setPage] = useState(0)
  const list = useMemo(
    () =>
      logs.filter(
        (l) =>
          (level === 'All' || l.level === level) &&
          (!q || `${l.action}${l.time}${l.level}`.toLowerCase().includes(q.toLowerCase())),
      ),
    [logs, q, level],
  )
  const pg = Math.min(page, Math.max(0, Math.ceil(list.length / PER) - 1))
  return (
    <>
      <div
        className="grid"
        style={{ gridTemplateColumns: '1fr 200px auto auto', marginBottom: 16, alignItems: 'center' }}
      >
        <label className="in">
          <Icon name="search" />
          <input
            placeholder="Filter logs…"
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              setPage(0)
            }}
          />
        </label>
        <Select
          label="Level:"
          value={level}
          onChange={(v) => {
            setLevel(v)
            setPage(0)
          }}
          options={['All', 'INFO', 'WARN', 'ERROR'].map((x) => [x, x])}
        />
        <Btn icon="up" onClick={() => toast('Logs exported', 'logs.csv')}>
          Export
        </Btn>
        <Btn
          variant="d"
          icon="trash"
          onClick={() =>
            ask({
              title: 'Clear logs?',
              message: `All ${logs.length} log entries will be removed.`,
              ok: 'Clear logs',
              danger: true,
              done: 'Logs cleared',
              run: () => set({ logs: [] }),
            })
          }
        >
          Clear logs
        </Btn>
      </div>
      <Card flush>
        <table>
          <thead>
            <tr>
              <th className="n">#</th>
              <th>Time</th>
              <th>Level</th>
              <th>Action</th>
              <th>User</th>
            </tr>
          </thead>
          <tbody>
            {list.slice(pg * PER, pg * PER + PER).map((l) => (
              <tr key={`${l.n}-${l.time}`}>
                <td className="n mono">{l.n}</td>
                <td className="mono">{l.time}</td>
                <td>
                  <span className={`lv ${l.level}`}>{l.level}</span>
                </td>
                <td>{l.action}</td>
                <td style={{ color: 'var(--muted)' }}>{l.user}</td>
              </tr>
            ))}
            {!list.length && (
              <tr>
                <td colSpan={5}>
                  <Empty icon="list">No log entries.</Empty>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <Pager page={pg} total={list.length} per={PER} onPage={setPage} />
      </Card>
    </>
  )
}

export function Utilities() {
  const [tab, setTab] = useState<Tab>('subjects')
  return (
    <>
      <PageHead
        title="Utilities"
        sub="Maintain the database: cascading deletions, backups, translation and logs."
      />
      <Tabs tabs={TABS} value={tab} onChange={setTab} />
      {tab === 'subjects' && <SubjectsTab />}
      {tab === 'parts' && <ParticipantsTab />}
      {tab === 'backup' && <BackupTab />}
      {tab === 'translate' && <TranslateTab />}
      {tab === 'logs' && <LogsTab />}
    </>
  )
}
