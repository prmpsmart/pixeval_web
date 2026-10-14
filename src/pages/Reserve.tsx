import { Btn, Card, Check, Empty, PageHead, Select, Tag } from '../components/ui'
import { ExamSelect, SubjectSelect } from '../components/ContextBar'
import { difficulty } from '../lib/domain'
import { useSubjectData } from '../lib/hooks'
import { useApp } from '../store/useApp'

export function Reserve() {
  const data = useApp()
  const { cancelled, toggleCancelled, open, toast, log, set } = data
  const { questions } = useSubjectData()
  const cancelledHere = questions.filter((q) => cancelled.includes(q.id)).length
  const recalc = () => { set({ corrected: true }); log('Recalculate grades'); toast('Grades recalculated', `${questions.length - cancelledHere} questions counted · ${cancelledHere} cancelled`) }
  return (<>
    <PageHead title="Reserve questions" sub="Cancel questions so they are ignored when grades are recalculated."
      actions={<span className="pill c-warn np" style={{ alignSelf: 'center' }}><b style={{ marginRight: 4 }}>{cancelledHere}</b> cancelled</span>} />
    <div className="grid" style={{ gridTemplateColumns: '1.2fr 1.4fr 120px', marginBottom: 16 }}>
      <SubjectSelect /><ExamSelect /><Select label="Model:" value="1" onChange={() => undefined} options={[['1', '1']]} />
    </div>
    <Card flush>
      <div className="tablewrap">
        <table>
          <thead><tr><th style={{ width: 90 }}>Cancel</th><th className="n" style={{ width: 70 }}>ID</th><th>Question</th><th>Key</th><th className="n">% correct</th></tr></thead>
          <tbody>
            {questions.map((q) => (
              <tr key={q.id}>
                <td><Check on={cancelled.includes(q.id)} onChange={() => toggleCancelled(q.id)} /></td>
                <td className="n mono">{q.id}</td><td>{q.text}</td>
                <td><span style={{ textTransform: 'uppercase', cursor: 'pointer' }} title="Set multiple correct answers" onClick={() => open('multi-answers', String(q.id))}><Tag>{q.key}</Tag></span></td>
                <td className="n">{Math.round(difficulty(data, q) * 100)}%</td>
              </tr>
            ))}
            {!questions.length && <tr><td colSpan={5}><Empty icon="help">No questions.</Empty></td></tr>}
          </tbody>
        </table>
      </div>
      <div style={{ display: 'flex', gap: 8, padding: '14px 16px', borderTop: '1px solid var(--line)', background: 'var(--surface-2)', flexWrap: 'wrap', borderRadius: '0 0 12px 12px' }}>
        <Btn variant="p" icon="save" onClick={() => toast('Reserve questions saved')}>Save</Btn>
        <Btn icon="refresh" onClick={recalc}>Recalculate grades</Btn>
        <Btn icon="fx" onClick={() => open('formula')}>Formula</Btn>
        <Btn icon="eye" onClick={() => open('matrix')}>Correction matrix</Btn>
      </div>
    </Card>
  </>)
}
