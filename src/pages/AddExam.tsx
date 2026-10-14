import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Btn,
  Card,
  Body,
  Check,
  Empty,
  Field,
  Icon,
  Input,
  PageHead,
  Select,
  Stepper,
} from '../components/ui'
import { ExamSelect, SubjectSelect } from '../components/ContextBar'
import { useSubjectData } from '../lib/hooks'
import { useApp } from '../store/useApp'

export function AddExam() {
  const nav = useNavigate()
  const { createExam, duplicateExam, open, set, selectedQuestions } = useApp()
  const { topics, questions } = useSubjectData()
  const [name, setName] = useState('Arona Examen auxiliares')
  const [date, setDate] = useState('2026-03-07')
  const [count, setCount] = useState(30)
  const [models, setModels] = useState(2)
  const [perTopic, setPerTopic] = useState<Record<number, number>>({})
  const [flags, setFlags] = useState<Record<string, boolean>>({})
  const flag = (k: string, label: string) => (
    <Check on={!!flags[k]} onChange={(v) => setFlags({ ...flags, [k]: v })}>
      {label}
    </Check>
  )

  const used = topics.reduce((a, t) => a + (perTopic[t.id] ?? 0), 0)
  const prefill = () => setPerTopic(Object.fromEntries(topics.map((t, i) => [t.id, i === 0 ? count : 0])))
  const autoSelect = () => {
    prefill()
    set({ selectedQuestions: questions.slice(0, count).map((q) => q.id) })
    useApp.getState().toast('Questions selected', `${count} questions picked automatically`)
  }
  const generate = () => {
    createExam({ name, date, models, qs: Math.min(count, questions.length) || count })
    nav('/sheets')
  }

  return (
    <>
      <PageHead
        title="Add exam"
        sub="Compose an exam from weighted topics, then generate its models."
        actions={
          <Btn icon="copy" onClick={duplicateExam}>
            Duplicate exam
          </Btn>
        }
      />
      <div className="grid" style={{ gridTemplateColumns: '1fr 340px', alignItems: 'start' }}>
        <div className="grid">
          <Card>
            <Body>
              <div className="row">
                <SubjectSelect label="Subject" />
                <ExamSelect label="Exam" />
              </div>
              <div className="row" style={{ marginTop: 14 }}>
                <div style={{ flex: '0 0 190px' }}>
                  <Field label="Exam date">
                    <Input icon="hist" value={date} onChange={setDate} />
                  </Field>
                </div>
                <Field label="Exam name">
                  <Input value={name} onChange={setName} />
                </Field>
              </div>
            </Body>
          </Card>
          <Card title="Configuration">
            <Body>
              <div style={{ display: 'flex', gap: 28, alignItems: 'end', flexWrap: 'wrap' }}>
                <div>
                  <label className="f">No. of questions</label>
                  <Stepper value={count} min={1} max={100} onChange={setCount} />
                </div>
                <div>
                  <label className="f">Models</label>
                  <Stepper value={models} min={1} max={8} onChange={setModels} />
                </div>
                <div style={{ paddingBottom: 9 }}>{flag('shq', 'Shuffle questions')}</div>
                <div style={{ paddingBottom: 9 }}>{flag('sha', 'Shuffle answers')}</div>
              </div>
              <hr className="s" />
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                {flag('omit', 'Omit used questions after')}
                <div style={{ width: 150 }}>
                  <Input value={date} onChange={setDate} />
                </div>
              </div>
            </Body>
          </Card>
          <Card
            flush
            title="Topics"
            right={
              <>
                <span className="sub">Questions</span>
                <b>{`${used} of ${count}`}</b>
                <div className="bar" style={{ width: 120 }}>
                  <i style={{ width: `${Math.min(100, (used / count) * 100)}%` }} />
                </div>
              </>
            }
          >
            <div style={{ padding: '0 20px 12px' }}>
              <Btn variant="sm" onClick={prefill}>
                Prefill
              </Btn>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Topic</th>
                  <th className="n">Bank</th>
                  <th>No. ques.</th>
                  <th>Diff.</th>
                  <th>Shuf. ques.</th>
                  <th>Shuf. ans.</th>
                  <th className="n">%</th>
                </tr>
              </thead>
              <tbody>
                {topics.map((t) => {
                  const c = perTopic[t.id] ?? 0
                  return (
                    <tr key={t.id}>
                      <td>
                        <b>{t.name}</b>
                      </td>
                      <td className="n">{questions.filter((q) => q.topic === t.id).length}</td>
                      <td>
                        <input
                          className="in"
                          style={{ height: 32, width: 80, background: '#FFFBEB', borderColor: '#F5E3A3' }}
                          value={c}
                          onChange={(e) => setPerTopic({ ...perTopic, [t.id]: Number(e.target.value) || 0 })}
                        />
                      </td>
                      <td>
                        <Select
                          value="Any"
                          onChange={() => undefined}
                          options={[
                            ['Any', 'Any'],
                            ['Easy', 'Easy'],
                            ['Medium', 'Medium'],
                            ['Hard', 'Hard'],
                          ]}
                        />
                      </td>
                      <td>{flag(`tq${t.id}`, '')}</td>
                      <td>{flag(`ta${t.id}`, '')}</td>
                      <td className="n">{count ? ((c / count) * 100).toFixed(2) : '0.00'}</td>
                    </tr>
                  )
                })}
                {!topics.length && (
                  <tr>
                    <td colSpan={7}>
                      <Empty icon="layers">No topics for this subject.</Empty>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        </div>
        <div className="grid" style={{ position: 'sticky', top: 80 }}>
          <Card title="Grading formula">
            <Body>
              <span className="formula" style={{ cursor: 'pointer' }} onClick={() => open('formula')}>
                <Icon name="fx" />
                {useApp.getState().formula}
              </span>
              <div className="hint" style={{ marginTop: 10 }}>
                C correct · E errors · P options · V value · N questions
              </div>
            </Body>
          </Card>
          <Card title="Select questions">
            <Body style={{ display: 'grid', gap: 8 }}>
              <Btn icon="shuf" style={{ justifyContent: 'flex-start' }} onClick={autoSelect}>
                Auto select questions
              </Btn>
              <Btn
                icon="hand"
                style={{ justifyContent: 'flex-start' }}
                onClick={() => open('select-questions')}
              >
                {selectedQuestions.length
                  ? `Select questions manually (${selectedQuestions.length})`
                  : 'Select questions manually'}
              </Btn>
              <Btn icon="eye" style={{ justifyContent: 'flex-start' }} onClick={() => open('preview-exam')}>
                Preview questions
              </Btn>
              <Btn icon="bar" style={{ justifyContent: 'flex-start' }} onClick={() => open('difficulty')}>
                Question difficulty
              </Btn>
              <hr className="s" style={{ margin: '8px 0' }} />
              <Btn variant="p lg" style={{ justifyContent: 'center' }} onClick={generate}>
                Generate exam
              </Btn>
            </Body>
          </Card>
        </div>
      </div>
    </>
  )
}
