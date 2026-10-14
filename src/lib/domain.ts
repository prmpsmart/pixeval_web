import type { DataState, Participant, Question } from '../data/types'

export interface Score {
  C: number
  E: number
  B: number
  N: number
  grade: number
}

export const questionsOf = (d: DataState, subject: string) => d.questions.filter((q) => q.subject === subject)
export const participantsOf = (d: DataState, subject: string) =>
  d.participants.filter((p) => p.subject === subject)
export const answerOf = (p: Participant, q: Question) => p.answers[q.id] ?? '-'

/** Grade a sheet with the exam formula. C correct, E errors, P options, V max value, N counted questions, B blanks. */
export function score(d: DataState, p: Participant): Score {
  const qs = questionsOf(d, p.subject).filter((q) => !d.cancelled.includes(q.id))
  let C = 0,
    E = 0,
    B = 0
  qs.forEach((q) => {
    const a = answerOf(p, q)
    if (a === '-') B++
    else if (a === q.key) C++
    else E++
  })
  const N = qs.length || 1
  let g: number
  try {
    g = new Function('C', 'E', 'P', 'V', 'N', 'B', `return ${d.formula}`)(C, E, 3, 10, N, B)
  } catch {
    g = ((C - E / 3) * 10) / N
  }
  return { C, E, B, N, grade: Math.max(0, g) }
}
export const fmt = (n: number) => n.toFixed(2).replace('.', ',')
export const displayName = (p: Participant) =>
  p.assigned ? `${p.surnames}, ${p.name}` : `Apellido anónimo_${p.id}, Nombre anónimo_${p.id}`
export const now = () => new Date().toISOString().slice(0, 19).replace('T', ' ')

export type Level = 'Easy' | 'Medium' | 'Hard'
/** Share of the subject's sheets that answered a question correctly (0–1). */
export function difficulty(d: DataState, q: Question): number {
  const ps = participantsOf(d, q.subject)
  if (!ps.length) return 0
  return ps.filter((p) => answerOf(p, q) === q.key).length / ps.length
}
export function difficultyLabel(d: DataState, q: Question): Level {
  const x = difficulty(d, q)
  return x >= 0.7 ? 'Easy' : x >= 0.5 ? 'Medium' : 'Hard'
}
export const levelTone: Record<Level, string> = { Easy: 'c-ok', Medium: 'c-warn', Hard: 'c-bad' }
export const examName = (e?: { name: string; date: string; id: number }) =>
  e ? `${e.name} | ${e.date} | ${e.id}` : '—'
export const markTone = (g: number) => (g >= 7 ? 'hi' : g >= 5 ? 'mid' : 'lo')
