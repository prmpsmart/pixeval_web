import { useState } from 'react'
import { Btn, Card, Check, Icon, PageHead, Pill } from '../components/ui'
import { SubjectSelect } from '../components/ContextBar'
import { examName } from '../lib/domain'
import { useSubjectData } from '../lib/hooks'
import { useApp } from '../store/useApp'

export function CloseExams() {
  const { set, setExamStatus } = useApp()
  const { exams, exam } = useSubjectData()
  const [recalc, setRecalc] = useState(false)
  return (
    <>
      <PageHead title="Close exams" sub="Closing an exam locks its questions, sheets and grades." />
      <div style={{ marginBottom: 16 }}>
        <SubjectSelect />
      </div>
      <Card flush>
        <table>
          <thead>
            <tr>
              <th>Exam</th>
              <th>Date</th>
              <th>Name</th>
              <th>Status</th>
              <th>Recalcdif</th>
            </tr>
          </thead>
          <tbody>
            {exams.map((e) => (
              <tr
                key={e.id}
                className={e.id === exam?.id ? 'sel-row' : ''}
                style={{ cursor: 'pointer' }}
                onClick={() => set({ exam: String(e.id) })}
              >
                <td className="mono">{e.id}</td>
                <td className="mono">{e.created}</td>
                <td>
                  <b>{e.name}</b>
                </td>
                <td>
                  {e.status === 'open' ? (
                    <Pill tone="c-ok" plain>
                      <Icon name="unlock" />
                      Open
                    </Pill>
                  ) : (
                    <Pill tone="c-bad" plain>
                      <Icon name="lock" />
                      Closed
                    </Pill>
                  )}
                </td>
                <td>{e.recalc}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div
          style={{
            display: 'flex',
            gap: 14,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 18,
            borderTop: '1px solid var(--line)',
            flexWrap: 'wrap',
            background: 'var(--surface-2)',
            borderRadius: '0 0 12px 12px',
          }}
        >
          <Check on={recalc} onChange={setRecalc}>
            Recalculate difficulty
          </Check>
          <Btn variant="p" icon="lock" onClick={() => exam && setExamStatus(exam.id, 'closed', recalc)}>
            Close
          </Btn>
          <Btn variant="p" icon="unlock" onClick={() => exam && setExamStatus(exam.id, 'open', recalc)}>
            Open
          </Btn>
        </div>
      </Card>
      <div className="hint" style={{ marginTop: 12 }}>
        Selected: <b>{examName(exam)}</b> — recalculating difficulty updates each question's easy / medium /
        hard rating from the graded sheets.
      </div>
    </>
  )
}
