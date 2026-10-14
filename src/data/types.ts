export type Letter = 'a' | 'b' | 'c'
export interface Subject {
  id: string
  name: string
}
export interface Topic {
  id: number
  subject: string
  name: string
  chapter: number
}
export interface Question {
  id: number
  subject: string
  topic: number
  type: 'MC'
  key: Letter
  text: string
  opts: Record<Letter, string>
  used: number
  mods: number
}
export interface Participant {
  sn: number
  subject: string
  id: string
  barcode: string
  dni: string
  name: string
  surnames: string
  email: string
  phone: string
  group: string
  answers: Record<number, Letter | '-'>
  assigned: boolean
  marked: boolean
}
export interface Exam {
  id: number
  subject: string
  name: string
  date: string
  model: number
  models: number
  qs?: number
  created: string
  status: 'open' | 'closed'
  recalc: 'Yes' | 'No'
}
export interface LogEntry {
  n: number
  time: string
  level: 'INFO' | 'WARN' | 'ERROR'
  action: string
  user: string
}
export interface ErrorSheet {
  id: number
  model: number
  sheet: string
  idr: string
  ex: number
  marks: string
  pid: number
}
export interface Backup {
  date: string
  path: string
}

/** Everything persisted to the browser (and, later, to a backend). */
export interface DataState {
  subjects: Subject[]
  topics: Topic[]
  groups: string[]
  exams: Exam[]
  questions: Question[]
  participants: Participant[]
  logs: LogEntry[]
  backups: Backup[]
  cancelled: number[]
  formula: string
  corrected: boolean
  translated: boolean
  errorsHR: ErrorSheet[]
  errorsHI: ErrorSheet[]
}
