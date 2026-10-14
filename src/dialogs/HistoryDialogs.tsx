import { useState } from 'react'
import { Dialog, DialogFooter } from '../components/Dialog'
import { Btn, Field, Input, Mini, TextArea } from '../components/ui'
import { useApp } from '../store/useApp'
import { tr } from '../i18n/mark'

export function EditExamDialog({ arg }: { arg?: string }) {
  const { exams, saveExam, close } = useApp()
  const e = exams.find((x) => String(x.id) === arg) ?? exams[0]
  const [name, setName] = useState(e?.name ?? '')
  const [date, setDate] = useState(e?.date ?? '')
  if (!e)
    return (
      <Dialog width="w1" title="No exam">
        <p>There is no exam to edit.</p>
      </Dialog>
    )
  return (
    <Dialog
      icon="edit"
      title="Edit exam"
      footer={
        <DialogFooter>
          <Btn
            variant="p"
            icon="save"
            onClick={() => {
              saveExam(e.id, { name, date })
              close()
            }}
          >
            Save
          </Btn>
        </DialogFooter>
      }
    >
      <div className="row">
        <Field label="Exam name">
          <Input value={name} onChange={setName} />
        </Field>
        <Field label="Date">
          <Input value={date} onChange={setDate} />
        </Field>
      </div>
      <div className="row">
        <Mini value={e.models} label="Models" />
        <Mini value={tr(e.status === 'open' ? 'Open' : 'Closed')} label="Status" />
      </div>
      <div className="hint" style={{ marginTop: 12 }}>
        Questions and models are fixed once sheets are generated.
      </div>
    </Dialog>
  )
}

const SECTIONS = [
  { title: 'Section A — Constitutional law', from: '1', to: '50' },
  { title: 'Section B — Administrative law', from: '51', to: '100' },
]
export function SectionDialog({ arg }: { arg?: string }) {
  const { toast, close } = useApp()
  const s = SECTIONS[Number(arg) || 0]
  const [title, setTitle] = useState(s.title)
  return (
    <Dialog
      width="w1"
      icon="edit"
      title="Modify section"
      footer={
        <DialogFooter>
          <Btn
            variant="p"
            icon="save"
            onClick={() => {
              toast('Section saved', title)
              close()
            }}
          >
            Save
          </Btn>
        </DialogFooter>
      }
    >
      <Field label="Section title">
        <Input value={title} onChange={setTitle} />
      </Field>
      <div className="row">
        <Field label="From question">
          <Input value={s.from} onChange={() => undefined} />
        </Field>
        <Field label="To question">
          <Input value={s.to} onChange={() => undefined} />
        </Field>
      </div>
      <Field label="Instructions">
        <TextArea value="" onChange={() => undefined} placeholder="Section instructions" rows={3} />
      </Field>
    </Dialog>
  )
}
