import { useState } from 'react'
import { Dialog, DialogFooter } from '../components/Dialog'
import { Btn } from '../components/ui'
import { difficulty } from '../lib/domain'
import type { Letter } from '../data/types'
import { USER } from '../data/seed'
import { useApp } from '../store/useApp'

export function QuestionExamsDialog({ arg }: { arg?: string }) {
  const data = useApp()
  const q = data.questions.find((x) => String(x.id) === arg)
  const exams = data.exams.filter((e) => e.subject === q?.subject)
  return (
    <Dialog icon="file" title={`Question ${arg} · Exam history`}>
      <table>
        <thead><tr><th>Exam</th><th>Date</th><th>Model</th><th className="n">Position</th><th className="n">% correct</th></tr></thead>
        <tbody>
          {exams.map((e) => <tr key={e.id}><td><b>{e.name}</b></td><td className="mono">{e.date}</td><td>1</td><td className="n">{arg}</td><td className="n">{q ? Math.round(difficulty(data, q) * 100) : 0}%</td></tr>)}
          {!exams.length && <tr><td colSpan={5}>Not used in any exam yet.</td></tr>}
        </tbody>
      </table>
    </Dialog>
  )
}

export function QuestionHistoryDialog({ arg }: { arg?: string }) {
  const q = useApp((s) => s.questions.find((x) => String(x.id) === arg))
  return (
    <Dialog icon="hist" title={`Question ${arg} · Modification history`}>
      <table>
        <thead><tr><th>Date</th><th>User</th><th>Change</th></tr></thead>
        <tbody>
          <tr><td className="mono">2026-02-19 11:50</td><td>{USER.email}</td><td>Imported from Word file</td></tr>
          {(q?.mods ?? 0) > 1 && <tr><td className="mono">2026-02-21 09:12</td><td>{USER.email}</td><td>Edited option B</td></tr>}
        </tbody>
      </table>
    </Dialog>
  )
}

export function MultiAnswersDialog({ arg }: { arg?: string }) {
  const { questions, close, toast } = useApp()
  const q = questions.find((x) => String(x.id) === arg)
  const [extra, setExtra] = useState<Letter[]>([])
  if (!q) return <Dialog width="w1" title="Question not found"><p>—</p></Dialog>
  const toggle = (o: Letter) => setExtra((e) => (e.includes(o) ? e.filter((x) => x !== o) : [...e, o]))
  return (
    <Dialog width="w1" icon="bookmark" title={`Question ${arg} · Multiple correct answers`} sub="Allow more than one alternative to score as correct."
      footer={<DialogFooter><Btn variant="p" icon="save" onClick={() => { toast('Correct answers updated'); close() }}>Save</Btn></DialogFooter>}>
      {(['a', 'b', 'c'] as Letter[]).map((o) => (
        <div key={o} className={`qopt ${q.key === o || extra.includes(o) ? 'ok' : ''}`}>
          <span className="l" style={{ textTransform: 'uppercase' }} onClick={() => toggle(o)}>{o}</span>{q.opts[o]}
        </div>
      ))}
    </Dialog>
  )
}
