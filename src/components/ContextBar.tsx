import { Select } from './ui'
import { examName } from '../lib/domain'
import { useApp } from '../store/useApp'

/** The Subject / Year-Group / Exam selectors that sit above most examination screens. */
export function SubjectSelect({ label = 'Subject:' }: { label?: string }) {
  const { subjects, subject, set } = useApp()
  return (
    <Select
      label={label}
      value={subject}
      options={subjects.map((s) => [s.id, `${s.id} – ${s.name}`])}
      onChange={(v) =>
        set({ subject: v, exam: String(useApp.getState().exams.find((e) => e.subject === v)?.id ?? '') })
      }
    />
  )
}
export function ExamSelect({ label = 'Exam:' }: { label?: string }) {
  const { exams, exam, subject, set } = useApp()
  return (
    <Select
      label={label}
      value={exam}
      options={exams.filter((e) => e.subject === subject).map((e) => [String(e.id), examName(e)])}
      onChange={(v) => set({ exam: v })}
    />
  )
}
export function GroupSelect({ label = 'Year / Group:' }: { label?: string }) {
  const { groups, group, set } = useApp()
  return (
    <Select
      label={label}
      value={group}
      options={groups.map((g) => [g, g])}
      onChange={(v) => set({ group: v })}
    />
  )
}
export function ContextBar() {
  return (
    <div className="grid g3" style={{ marginBottom: 16 }}>
      <SubjectSelect />
      <GroupSelect />
      <ExamSelect />
    </div>
  )
}
