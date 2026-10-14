import { useState } from 'react'
import { Dialog, DialogFooter } from '../components/Dialog'
import { Btn, Field, Input } from '../components/ui'
import { useApp } from '../store/useApp'

export function SubjectDialog({ arg }: { arg?: string }) {
  const { subjects, saveSubject, close } = useApp()
  const src = subjects.find((s) => s.id === arg)
  const [id, setId] = useState(src?.id ?? '')
  const [name, setName] = useState(src?.name ?? '')
  const save = () => {
    if (saveSubject(src?.id ?? null, { id, name: name || 'New subject' })) close()
  }
  return (
    <Dialog
      width="w1"
      icon="layers"
      title={src ? 'Edit subject' : 'Create subject'}
      footer={
        <DialogFooter>
          <Btn variant="p" icon="save" onClick={save}>
            {src ? 'Save' : 'Create subject'}
          </Btn>
        </DialogFooter>
      }
    >
      <div className="row">
        <div style={{ flex: '0 0 120px' }}>
          <Field label="ID">
            <Input mono value={id} onChange={setId} placeholder="e.g. TJ" />
          </Field>
        </div>
        <Field label="Name">
          <Input value={name} onChange={setName} placeholder="Subject name" />
        </Field>
      </div>
      <div className="hint">The ID is used as the short code across exams, sheets and reports.</div>
    </Dialog>
  )
}

export function TopicDialog({ arg }: { arg?: string }) {
  const { topics, subject, saveTopic, deleteTopic, ask, close } = useApp()
  const src = topics.find((t) => String(t.id) === arg)
  const [name, setName] = useState(src?.name ?? '')
  const [chapter, setChapter] = useState(
    String(src?.chapter ?? topics.filter((t) => t.subject === subject).length + 1),
  )
  const remove = () =>
    src &&
    ask({
      title: 'Delete topic?',
      message: 'Its questions are removed too.',
      ok: 'Delete',
      danger: true,
      done: 'Topic deleted',
      run: () => {
        deleteTopic(src.id)
        close()
      },
    })
  return (
    <Dialog
      width="w1"
      icon="tag"
      title={src ? 'Edit topic' : 'New topic'}
      footer={
        <>
          {src && (
            <Btn variant="d" icon="trash" onClick={remove}>
              Delete
            </Btn>
          )}
          <DialogFooter>
            <Btn
              variant="p"
              icon="save"
              onClick={() => {
                saveTopic(src?.id ?? null, { name: name || 'New topic', chapter: Number(chapter) || 1 })
                close()
              }}
            >
              {src ? 'Save' : 'Add topic'}
            </Btn>
          </DialogFooter>
        </>
      }
    >
      <Field label="Topic name">
        <Input value={name} onChange={setName} placeholder="Topic name" />
      </Field>
      <div className="row">
        <Field label="ID">
          <div className="in mono">{src?.id ?? 'auto'}</div>
        </Field>
        <Field label="Chapter">
          <Input value={chapter} onChange={setChapter} />
        </Field>
      </div>
    </Dialog>
  )
}
