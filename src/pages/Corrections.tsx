import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Btn,
  Card,
  Body,
  Check,
  Empty,
  Field,
  Icon,
  PageHead,
  Pill,
  Select,
  Stepper,
  Tabs,
  TextArea,
} from '../components/ui'
import { ExamSelect, GroupSelect, SubjectSelect } from '../components/ContextBar'
import { PathField } from '../components/PathField'
import { MatrixGrid } from '../dialogs/ExamDialogs'
import { score } from '../lib/domain'
import { useSubjectData } from '../lib/hooks'
import { useApp } from '../store/useApp'

type Tab = 'corr' | 'formula' | 'matrix' | 'ids'
const TABS = [
  { id: 'corr' as const, label: 'Correction' },
  { id: 'formula' as const, label: 'Formula' },
  { id: 'matrix' as const, label: 'Examination from correction matrix' },
  { id: 'ids' as const, label: 'Examination from questions id' },
]
const PRESETS = ['(C - (E/P)) * V / N', 'C * V / N', '(C - E/(P-1)) * V / N']

function CorrectionTab() {
  const nav = useNavigate()
  const { corrected, errorsHR, errorsHI, runCorrection, open, paths } = useApp()
  const { participants, questions } = useSubjectData()
  const [progress, setProgress] = useState(0)
  const [rec, setRec] = useState('Double recovery'),
    [multi, setMulti] = useState('Fail')
  const [qn, setQn] = useState(questions.length || 100),
    [an, setAn] = useState(3)
  const [rename, setRename] = useState(false),
    [del, setDel] = useState(true)
  const timer = useRef<ReturnType<typeof setInterval>>()
  useEffect(() => () => clearInterval(timer.current), [])

  const start = () => {
    if (progress) return
    if (!participants.length) {
      useApp.getState().toast('No sheets to correct', 'Add participants first')
      return
    }
    setProgress(1)
    timer.current = setInterval(
      () =>
        setProgress((p) => {
          const next = p + Math.ceil(Math.random() * 9) + 3
          if (next >= 100) {
            clearInterval(timer.current)
            runCorrection()
            return 0
          }
          return next
        }),
      180,
    )
  }
  const n = participants.length
  const pct = corrected && !progress ? 100 : progress
  return (
    <div className="grid" style={{ gridTemplateColumns: '1fr 360px', alignItems: 'start' }}>
      <div className="grid">
        <Card title="Correction data">
          <Body>
            <div className="row" style={{ marginBottom: 14 }}>
              <SubjectSelect label="Subject" />
              <GroupSelect label="Year / Group" />
            </div>
            <div className="row" style={{ alignItems: 'center' }}>
              <ExamSelect label="Exam" />
              <div style={{ flex: '0 0 auto', display: 'flex', gap: 8, alignItems: 'center' }}>
                <span className="hint" style={{ margin: 0 }}>
                  Formula
                </span>
                <span className="formula" style={{ cursor: 'pointer' }} onClick={() => open('formula')}>
                  <Icon name="fx" />
                  {useApp.getState().formula}
                </span>
              </div>
            </div>
          </Body>
        </Card>
        <Card title="Scan directory">
          <Body>
            <PathField id="scan" placeholder="Select the folder with the scanned JPG files" />
          </Body>
        </Card>
        <Card
          flush
          title="Scan queue"
          right={
            corrected && !progress ? (
              <Pill tone="c-ok">Completed</Pill>
            ) : progress ? (
              <Pill tone="c-blue">Correcting…</Pill>
            ) : (
              <Pill tone="c-warn">Idle</Pill>
            )
          }
        >
          {pct ? (
            <table>
              <thead>
                <tr>
                  <th>Folder</th>
                  <th>JPG files</th>
                  <th>Processed</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="mono">{paths.scan ?? '…/extra/03-02-2026/300ppp2'}</td>
                  <td>{n}</td>
                  <td style={{ width: 260 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <div className="bar" style={{ flex: 1 }}>
                        <i style={{ width: `${pct}%` }} />
                      </div>
                      <b className="mono">
                        {Math.round((n * pct) / 100)}/{n}
                      </b>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          ) : (
            <Empty icon="scan">Nothing processed yet — choose a folder and run a correction.</Empty>
          )}
        </Card>
        {corrected && !progress && (
          <Card style={{ borderColor: '#9ADBC0', background: '#F2FBF7' }}>
            <Body style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <span className="ic-sq c-ok" style={{ width: 40, height: 40 }}>
                <Icon name="check" />
              </span>
              <div>
                <b>{n} sheets corrected</b>
                <div className="hint" style={{ margin: 0 }}>
                  {errorsHR.length + errorsHI.length} error sheets
                </div>
              </div>
              <span style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                <Btn onClick={() => nav('/assign')}>Assign identities</Btn>
                <Btn variant="p" right="right" onClick={() => nav('/grades')}>
                  View grades
                </Btn>
              </span>
            </Body>
          </Card>
        )}
      </div>
      <div className="grid" style={{ position: 'sticky', top: 80 }}>
        <Card title="Answer sheet format">
          <Body>
            <div className="row" style={{ marginBottom: 14 }}>
              <div>
                <label className="f">Questions</label>
                <Stepper value={qn} min={1} max={200} onChange={setQn} />
              </div>
              <div>
                <label className="f">Answers</label>
                <Stepper value={an} min={2} max={6} onChange={setAn} />
              </div>
            </div>
            <Field label="Recognition">
              <Select
                value={rec}
                onChange={setRec}
                options={['Double recovery', 'Standard', 'Strict'].map((x) => [x, x])}
              />
            </Field>
            <Field label="More than one alternative">
              <Select
                value={multi}
                onChange={setMulti}
                options={['Fail', 'Blank', 'Mark as error'].map((x) => [x, x])}
              />
            </Field>
            <div style={{ display: 'grid', gap: 10 }}>
              <Check on={rename} onChange={setRename}>
                Rename scanned files
              </Check>
              <Check on={del} onChange={setDel}>
                Delete previous correction
              </Check>
            </div>
          </Body>
        </Card>
        <Card>
          <Body style={{ display: 'grid', gap: 8 }}>
            <Btn variant="p lg" icon="scan" style={{ justifyContent: 'center' }} onClick={start}>
              Correct exam
            </Btn>
            <Btn variant="lg" icon="lock" style={{ justifyContent: 'center' }} onClick={start}>
              Correct anonymous
            </Btn>
            <Btn icon="eye" style={{ justifyContent: 'center' }} onClick={() => open('matrix')}>
              Correction matrix
            </Btn>
          </Body>
        </Card>
      </div>
    </div>
  )
}

function FormulaTab() {
  const data = useApp()
  const { participants } = useSubjectData()
  const [f, setF] = useState(data.formula)
  let preview: JSX.Element
  try {
    const s = participants[0] ? score({ ...data, formula: f }, participants[0]) : null
    preview = s ? (
      <>
        C={s.C}, E={s.E}, P=3, V=10, N={s.N} → <b>{s.grade.toFixed(2).replace('.', ',')}</b>
      </>
    ) : (
      <>No sheets yet.</>
    )
  } catch {
    preview = <span style={{ color: 'var(--bad)' }}>Invalid formula</span>
  }
  const vars: [string, string][] = [
    ['C', 'Correct answers'],
    ['E', 'Errors'],
    ['P', 'Options per question'],
    ['V', 'Max value (10)'],
    ['N', 'Questions counted'],
    ['B', 'Blank answers'],
  ]
  return (
    <div className="grid" style={{ gridTemplateColumns: '1fr 360px', alignItems: 'start' }}>
      <Card title="Grading formula">
        <Body>
          <label className="f">Formula</label>
          <label
            className="in mono"
            style={{
              fontSize: 15,
              height: 46,
              color: '#5B3DD6',
              background: 'var(--violet-soft)',
              borderColor: '#E1D9FF',
            }}
          >
            <Icon name="fx" />
            <input value={f} onChange={(e) => setF(e.target.value)} />
          </label>
          <div className="hint">Variables you can use. Operators + − * / ( ) and Math.* are accepted.</div>
          <div className="grid g3" style={{ gap: 8, margin: '16px 0' }}>
            {vars.map(([k, l]) => (
              <div key={k} className="mini">
                <b className="mono" style={{ fontSize: 16, color: 'var(--violet)' }}>
                  {k}
                </b>
                <span>{l}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span className="sec-t" style={{ width: '100%', margin: '6px 0 0' }}>
              Presets
            </span>
            {PRESETS.map((p) => (
              <Btn key={p} variant="sm" onClick={() => setF(p)}>
                {p}
              </Btn>
            ))}
          </div>
          <hr className="s" />
          <Btn
            variant="p"
            icon="check"
            onClick={() => {
              data.set({ formula: f })
              data.log('Edit formula')
              data.toast('Formula applied', f)
            }}
          >
            Apply
          </Btn>
        </Body>
      </Card>
      <Card title="Live preview">
        <Body>
          <div className="hint" style={{ margin: '0 0 6px' }}>
            Sample sheet {participants[0]?.id ?? '—'}
          </div>
          <div style={{ fontSize: 14 }}>{preview}</div>
        </Body>
      </Card>
    </div>
  )
}

function MatrixTab() {
  const { setKey, cancelled, toast, open } = useApp()
  const { questions } = useSubjectData()
  return (
    <Card
      title="Examination from correction matrix"
      sub="Click a letter to set the correct answer. Changes recalculate grades."
      right={
        <>
          <Btn variant="sm" icon="down" onClick={() => open('import-questions')}>
            Import matrix
          </Btn>
          <Btn variant="p sm" icon="save" onClick={() => toast('Correction matrix saved')}>
            Save
          </Btn>
        </>
      }
    >
      <Body>
        <MatrixGrid questions={questions} onKey={setKey} cancelled={cancelled} />
      </Body>
    </Card>
  )
}

function IdsTab() {
  const { toast } = useApp()
  const [ids, setIds] = useState('1-30, 45, 52')
  const [models, setModels] = useState(1)
  return (
    <Card title="Examination from questions id" sub="Build the exam by listing question IDs.">
      <Body>
        <div className="row">
          <Select
            label="Model"
            value="1"
            onChange={() => undefined}
            options={[
              ['1', '1'],
              ['2', '2'],
              ['3', '3'],
            ]}
          />
          <Stepper value={models} min={1} max={8} onChange={setModels} />
        </div>
        <Field label="Question IDs (comma-separated or ranges)">
          <TextArea value={ids} onChange={setIds} rows={4} />
        </Field>
        <div className="hint">Questions are read in this order: {ids}</div>
        <hr className="s" />
        <Btn variant="p" icon="plus" onClick={() => toast('Exam created from IDs', ids)}>
          Create exam from IDs
        </Btn>
      </Body>
    </Card>
  )
}

export function Corrections() {
  const [tab, setTab] = useState<Tab>('corr')
  return (
    <>
      <PageHead
        title="Corrections"
        sub="Read scanned answer sheets and compute results against the correction matrix."
      />
      <Tabs tabs={TABS} value={tab} onChange={setTab} />
      {tab === 'corr' && <CorrectionTab />}
      {tab === 'formula' && <FormulaTab />}
      {tab === 'matrix' && <MatrixTab />}
      {tab === 'ids' && <IdsTab />}
    </>
  )
}
