import { useState } from 'react'
import { Dialog, DialogFooter } from '../components/Dialog'
import { Btn, Check, Field, Icon, Input, Mini, Pill, Select, TextArea } from '../components/ui'
import { PathField } from '../components/PathField'
import { difficulty, difficultyLabel, levelTone } from '../lib/domain'
import { useSubjectData } from '../lib/hooks'
import type { Letter } from '../data/types'
import { useApp } from '../store/useApp'

const LETTERS: Letter[] = ['a', 'b', 'c']

export function QuestionDialog({ arg }: { arg?: string }) {
  const data = useApp()
  const { questions, saveQuestion, deleteQuestion, ask, open, close, participants } = data
  const { topics } = useSubjectData()
  const isNew = arg === 'new'
  const src = isNew ? undefined : questions.find((q) => String(q.id) === arg)
  const [text, setText] = useState(src?.text ?? '')
  const [opts, setOpts] = useState(src?.opts ?? { a: '', b: '', c: '' })
  const [key, setKey] = useState<Letter>(src?.key ?? 'a')
  const [topic, setTopic] = useState(String(src?.topic ?? topics[0]?.id ?? 0))
  if (!isNew && !src) return <Dialog width="w1" title="Question not found"><p>This question no longer exists.</p></Dialog>

  const save = () => { saveQuestion(isNew ? 'new' : src!.id, { text: text || `Pregunta`, opts, key, topic: Number(topic) }); close() }
  const remove = () => src && ask({
    title: `Delete question ${src.id}?`, message: 'It is removed from the bank and from every sheet.', ok: 'Delete', danger: true,
    done: 'Question deleted', run: () => { deleteQuestion(src.id); close() },
  })
  const sheets = participants.filter((p) => p.subject === data.subject).length
  return (
    <Dialog width="w3" icon="edit" title={isNew ? 'New question' : `Question ${src!.id}`}
      sub={src ? `${src.mods} modification${src.mods === 1 ? '' : 's'} · used in ${src.used} exam${src.used === 1 ? '' : 's'}` : undefined}
      footer={<>{src && <Btn variant="d" icon="trash" onClick={remove}>Delete</Btn>}
        <DialogFooter><Btn variant="p" icon="save" onClick={save}>{isNew ? 'Add question' : 'Save'}</Btn></DialogFooter></>}>
      <div className="grid" style={{ gridTemplateColumns: '1.5fr 1fr', alignItems: 'start' }}>
        <div>
          <Field label="Question text"><TextArea value={text} onChange={setText} placeholder="Write the question…" /></Field>
          <label className="f">Options — click the letter to mark the correct one</label>
          {LETTERS.map((o) => (
            <div key={o} className={`qopt ${key === o ? 'ok' : ''}`}>
              <span className="l" style={{ textTransform: 'uppercase' }} onClick={() => setKey(o)}>{o}</span>
              <input className="in" style={{ border: 0, boxShadow: 'none', height: 30, flex: 1 }} value={opts[o]} placeholder={`Option ${o.toUpperCase()}`} onChange={(e) => setOpts({ ...opts, [o]: e.target.value })} />
            </div>
          ))}
        </div>
        <div>
          <Field label="Topic"><Select value={topic} options={topics.map((t) => [String(t.id), t.name])} onChange={setTopic} /></Field>
          <div style={{ marginBottom: 12 }}><Mini value={src ? `${Math.round(difficulty(data, src) * 100)}%` : '—'} label={`answered correctly across ${sheets} sheets`} /></div>
          {src && <div style={{ display: 'grid', gap: 8 }}>
            <Btn icon="file" style={{ justifyContent: 'flex-start' }} onClick={() => open('question-exams', String(src.id))}>Exam history</Btn>
            <Btn icon="hist" style={{ justifyContent: 'flex-start' }} onClick={() => open('question-history', String(src.id))}>Modification history</Btn>
          </div>}
        </div>
      </div>
    </Dialog>
  )
}

export function SearchQuestionsDialog() {
  const data = useApp()
  const { questions } = useSubjectData()
  const { open, close } = data
  const [q, setQ] = useState('')
  const hits = q ? questions.filter((x) => x.text.toLowerCase().includes(q.toLowerCase())).slice(0, 7) : []
  return (
    <Dialog width="w2" icon="search" title="Search questions">
      <label className="in"><Icon name="search" /><input autoFocus placeholder="Text contains…" value={q} onChange={(e) => setQ(e.target.value)} /></label>
      <div style={{ marginTop: 14 }}>
        {hits.map((x) => (
          <div key={x.id} className="hov" onClick={() => { close(); open('question', String(x.id)) }}
            style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '9px 12px', border: '1px solid var(--line)', borderRadius: 10, marginBottom: 6, cursor: 'pointer' }}>
            <span className="mono" style={{ width: 30 }}>{x.id}</span>{x.text}<span style={{ marginLeft: 'auto' }}><Pill tone={levelTone[difficultyLabel(data, x)]}>{difficultyLabel(data, x)}</Pill></span>
          </div>
        ))}
        {!hits.length && <div className="hint">{q ? 'No results.' : 'Type to search the question bank.'}</div>}
      </div>
    </Dialog>
  )
}

export function ImportQuestionsDialog() {
  const { importQuestions, log, toast, close } = useApp()
  const { topics } = useSubjectData()
  const [fmt, setFmt] = useState('Auto-detect')
  const [shuffle, setShuffle] = useState(true)
  const [dupes, setDupes] = useState(true)
  const run = () => { importQuestions(5, 'importada'); log('Import questions'); toast('Questions imported', '5 questions added to the bank'); close() }
  return (
    <Dialog width="w2" icon="down" title="Import questions" sub="Word, GIFT, Aiken, Moodle XML or XLSX (demo: adds 5 sample questions)"
      footer={<DialogFooter><Btn variant="p" icon="down" onClick={run}>Import</Btn></DialogFooter>}>
      <Field label="File"><PathField id="importQuestions" placeholder="Select questions file" mode="file" /></Field>
      <div className="row">
        <Field label="Format"><Select value={fmt} onChange={setFmt} options={['Auto-detect', 'Word (.docx)', 'GIFT', 'Aiken', 'Moodle XML', 'XLSX'].map((x) => [x, x])} /></Field>
        <Field label="Topic"><Select value={String(topics[0]?.id ?? '')} onChange={() => undefined} options={topics.map((t) => [String(t.id), t.name])} /></Field>
      </div>
      <div style={{ display: 'grid', gap: 10 }}>
        <Check on={shuffle} onChange={setShuffle}>Detect words to shuffle</Check>
        <Check on={dupes} onChange={setDupes}>Skip duplicates</Check>
      </div>
    </Dialog>
  )
}

export function ExportQuestionsDialog() {
  const { toast, log, close } = useApp()
  const { questions } = useSubjectData()
  const [fmt, setFmt] = useState('Word (.docx)')
  const [answers, setAnswers] = useState(true)
  const [diff, setDiff] = useState(false)
  const run = () => { log('Export questions'); toast('Questions exported', `${questions.length} questions · questions.docx`); close() }
  return (
    <Dialog width="w2" icon="up" title="Export questions"
      footer={<DialogFooter><Btn variant="p" icon="up" onClick={run}>Export</Btn></DialogFooter>}>
      <div className="row">
        <Field label="Topic"><Select value="all" onChange={() => undefined} options={[['all', 'All topics']]} /></Field>
        <Field label="Format"><Select value={fmt} onChange={setFmt} options={['Word (.docx)', 'GIFT', 'Aiken', 'Moodle XML', 'XLSX'].map((x) => [x, x])} /></Field>
      </div>
      <Field label="Output folder"><PathField id="exportQuestions" placeholder="Select output folder" /></Field>
      <div style={{ display: 'grid', gap: 10 }}>
        <Check on={answers} onChange={setAnswers}>Include correct answers</Check>
        <Check on={diff} onChange={setDiff}>Include difficulty</Check>
      </div>
    </Dialog>
  )
}

export function UpdateQuestionsDialog() {
  const { importQuestions, log, toast, close } = useApp()
  const { questions } = useSubjectData()
  const [add, setAdd] = useState(true)
  const [update, setUpdate] = useState(true)
  const [remove, setRemove] = useState(false)
  const run = () => { importQuestions(8, 'nueva'); log('Update questions DB'); toast('Questions database updated', '+8 new · 0 changed'); close() }
  return (
    <Dialog width="w2" icon="refresh" title="Update questions DB" sub="Synchronise the bank with an external database file."
      footer={<DialogFooter><Btn variant="p" icon="refresh" onClick={run}>Update</Btn></DialogFooter>}>
      <Field label="Source database"><PathField id="updateDb" placeholder="Select .db file" mode="file" /></Field>
      <div className="grid g3" style={{ gap: 10, marginBottom: 12 }}>
        <Mini value={questions.length} label="In this DB" /><Mini value={questions.length + 8} label="In source" /><Mini value="+8" label="New" tone="brand" />
      </div>
      <div style={{ display: 'grid', gap: 10 }}>
        <Check on={add} onChange={setAdd}>Add new questions</Check>
        <Check on={update} onChange={setUpdate}>Update changed questions</Check>
        <Check on={remove} onChange={setRemove}>Delete removed questions</Check>
      </div>
    </Dialog>
  )
}
