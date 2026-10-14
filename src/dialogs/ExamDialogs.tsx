import { useState } from 'react'
import { Dialog, DialogFooter } from '../components/Dialog'
import { Btn, Mini, Pill } from '../components/ui'
import { difficultyLabel, levelTone, type Level } from '../lib/domain'
import { useSubjectData } from '../lib/hooks'
import type { Letter } from '../data/types'
import { useApp } from '../store/useApp'
import { tr } from '../i18n/mark'
import { translate } from '../i18n/runtime'

export function SelectQuestionsDialog() {
  const data = useApp()
  const { questions } = useSubjectData()
  const { selectedQuestions, set, close, toast } = data
  const toggle = (id: number) =>
    set({
      selectedQuestions: selectedQuestions.includes(id)
        ? selectedQuestions.filter((x) => x !== id)
        : [...selectedQuestions, id],
    })
  return (
    <Dialog
      width="w3"
      icon="hand"
      title="Select questions"
      sub={`${selectedQuestions.length} selected`}
      footer={
        <>
          <Btn variant="g" onClick={() => set({ selectedQuestions: [] })}>
            Clear
          </Btn>
          <DialogFooter>
            <Btn
              variant="p"
              icon="check"
              onClick={() => {
                toast('Questions selected', `${selectedQuestions.length} questions`)
                close()
              }}
            >
              {`Use ${selectedQuestions.length} questions`}
            </Btn>
          </DialogFooter>
        </>
      }
    >
      <div className="tablewrap" style={{ maxHeight: 420 }}>
        <table>
          <thead>
            <tr>
              <th style={{ width: 50 }} />
              <th>ID</th>
              <th>Question</th>
              <th>Difficulty</th>
              <th>Used</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q) => {
              const on = selectedQuestions.includes(q.id)
              const level = difficultyLabel(data, q)
              return (
                <tr
                  key={q.id}
                  className={on ? 'sel-row' : ''}
                  style={{ cursor: 'pointer' }}
                  onClick={() => toggle(q.id)}
                >
                  <td>
                    <div className={`chk ${on ? 'on' : ''}`}>
                      <span className="b">
                        {on && (
                          <svg className="i" viewBox="0 0 24 24">
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        )}
                      </span>
                    </div>
                  </td>
                  <td className="mono">{q.id}</td>
                  <td>{q.text}</td>
                  <td>
                    <Pill tone={levelTone[level]}>{translate(level)}</Pill>
                  </td>
                  <td>{q.used}×</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Dialog>
  )
}

export function PreviewExamDialog() {
  const { questions } = useSubjectData()
  const { toast, close } = useApp()
  return (
    <Dialog
      width="w3"
      icon="eye"
      title="Preview exam"
      sub="Model 1"
      footer={
        <DialogFooter>
          <Btn
            variant="p"
            icon="file"
            onClick={() => {
              toast('Preview exported', 'preview_model1.pdf')
              close()
            }}
          >
            Export PDF
          </Btn>
        </DialogFooter>
      }
    >
      <div className="sheetprev" style={{ maxWidth: 640, margin: 'auto', padding: 28 }}>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <b style={{ fontSize: 16 }}>Exam</b>
        </div>
        {questions.slice(0, 6).map((q) => (
          <div key={q.id} style={{ marginBottom: 14 }}>
            <b>{q.id}.</b> {q.text}
            {(['a', 'b', 'c'] as Letter[]).map((o) => (
              <div key={o} style={{ paddingLeft: 20, color: 'var(--ink-2)' }}>
                {o}) {q.opts[o]}
              </div>
            ))}
          </div>
        ))}
        <div className="hint" style={{ textAlign: 'center' }}>
          {`… ${Math.max(0, questions.length - 6)} more questions`}
        </div>
      </div>
    </Dialog>
  )
}

export function DifficultyDialog() {
  const data = useApp()
  const { questions } = useSubjectData()
  const counts: Record<Level, number> = { Easy: 0, Medium: 0, Hard: 0 }
  questions.forEach((q) => counts[difficultyLabel(data, q)]++)
  const tone = { Easy: 'ok', Medium: 'warn', Hard: 'bad' }
  return (
    <Dialog icon="bar" title="Question difficulty" sub="Computed from graded answer sheets">
      <div className="grid g3" style={{ gap: 10, marginBottom: 16 }}>
        {(Object.keys(counts) as Level[]).map((k) => (
          <Mini key={k} value={counts[k]} label={k} tone={tone[k]} />
        ))}
      </div>
      <div className="hint">
        Easy: ≥ 70% correct · Medium: 50–70% · Hard: &lt; 50%. Use "Recalculate difficulty" when closing an
        exam to refresh these values.
      </div>
    </Dialog>
  )
}

export function FormulaDialog() {
  const { formula, set, close, toast, log } = useApp()
  const [f, setF] = useState(formula)
  const vars: [string, string][] = [
    ['C', tr('Correct')],
    ['E', tr('Errors')],
    ['P', tr('Options')],
    ['V', tr('Max value')],
    ['N', tr('Questions')],
    ['B', tr('Blank')],
  ]
  const apply = () => {
    set({ formula: f })
    log('Edit formula')
    toast('Formula applied', f)
    close()
  }
  return (
    <Dialog
      icon="fx"
      title="Grading formula"
      footer={
        <DialogFooter>
          <Btn variant="p" icon="check" onClick={apply}>
            Apply
          </Btn>
        </DialogFooter>
      }
    >
      <label
        className="in mono"
        style={{
          height: 46,
          fontSize: 15,
          color: '#5B3DD6',
          background: 'var(--violet-soft)',
          borderColor: '#E1D9FF',
        }}
      >
        <input value={f} onChange={(e) => setF(e.target.value)} />
      </label>
      <div className="grid g3" style={{ gap: 8, marginTop: 16 }}>
        {vars.map(([k, l]) => (
          <div key={k} className="mini">
            <b className="mono" style={{ fontSize: 15, color: 'var(--violet)' }}>
              {k}
            </b>
            <span>{l}</span>
          </div>
        ))}
      </div>
    </Dialog>
  )
}

/** Correction matrix: click a letter to change a question's correct answer. */
export function MatrixDialog() {
  const { setKey, cancelled, close, toast } = useApp()
  const { questions } = useSubjectData()
  return (
    <Dialog
      width="w4"
      icon="eye"
      title="Correction matrix"
      sub={`${cancelled.length} cancelled questions · click a letter to change the key`}
      footer={
        <DialogFooter>
          <Btn
            variant="p"
            icon="save"
            onClick={() => {
              toast('Matrix saved')
              close()
            }}
          >
            Save
          </Btn>
        </DialogFooter>
      }
    >
      <div style={{ maxHeight: '62vh', overflow: 'auto' }}>
        <MatrixGrid questions={questions} onKey={setKey} cancelled={cancelled} />
      </div>
    </Dialog>
  )
}

export function MatrixGrid({
  questions,
  onKey,
  cancelled,
}: {
  questions: { id: number; key: Letter }[]
  onKey: (id: number, k: Letter) => void
  cancelled: number[]
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 8 }}>
      {questions.map((q) => (
        <div key={q.id} className="qopt" style={{ margin: 0, padding: '6px 8px' }}>
          <b className="mono" style={{ width: 26, fontSize: 12 }}>
            {q.id}
          </b>
          {(['a', 'b', 'c'] as Letter[]).map((o) => (
            <span
              key={o}
              className="l"
              style={{
                textTransform: 'uppercase',
                ...(q.key === o ? { background: 'var(--brand)', color: '#fff' } : {}),
              }}
              onClick={() => onKey(q.id, o)}
            >
              {o}
            </span>
          ))}
          {cancelled.includes(q.id) && <span className="pill c-bad np">C</span>}
        </div>
      ))}
      {!questions.length && <div className="hint">No questions in this subject yet.</div>}
    </div>
  )
}
