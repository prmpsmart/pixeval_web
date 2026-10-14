import { useMemo } from 'react'
import { examName, participantsOf, questionsOf } from './domain'
import { useApp } from '../store/useApp'

/** Data of the active subject, recomputed only when the underlying lists change. */
export function useSubjectData() {
  const questions = useApp((s) => s.questions)
  const participants = useApp((s) => s.participants)
  const exams = useApp((s) => s.exams)
  const topics = useApp((s) => s.topics)
  const subject = useApp((s) => s.subject)
  const examId = useApp((s) => s.exam)
  return useMemo(
    () => ({
      subject,
      questions: questions.filter((q) => q.subject === subject),
      participants: participants.filter((p) => p.subject === subject),
      exams: exams.filter((e) => e.subject === subject),
      topics: topics.filter((t) => t.subject === subject),
      exam:
        exams.find((e) => String(e.id) === examId && e.subject === subject) ??
        exams.find((e) => e.subject === subject),
    }),
    [questions, participants, exams, topics, subject, examId],
  )
}

export { examName, participantsOf, questionsOf }
