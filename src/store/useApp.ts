import { create } from 'zustand'
import { buildSeed, noAccent, USER } from '../data/seed'
import type {
  DataState,
  Exam,
  ErrorSheet,
  Letter,
  Participant,
  Question,
  Subject,
  Topic,
} from '../data/types'
import { now } from '../lib/domain'

const STORE = 'pixeval-react-v3'
const SAVING = `${STORE}:saving`

export type DialogName =
  | 'confirm'
  | 'picker'
  | 'cmd'
  | 'config'
  | 'credits'
  | 'participant'
  | 'import-participants'
  | 'year-group'
  | 'search-participants'
  | 'subject'
  | 'topic'
  | 'question'
  | 'search-questions'
  | 'import-questions'
  | 'export-questions'
  | 'update-questions'
  | 'question-exams'
  | 'question-history'
  | 'multi-answers'
  | 'select-questions'
  | 'preview-exam'
  | 'difficulty'
  | 'formula'
  | 'matrix'
  | 'instructions'
  | 'barcodes'
  | 'report'
  | 'output-folder'
  | 'statistics'
  | 'edit-exam'
  | 'section'

export interface DialogEntry {
  name: DialogName
  arg?: string
}
export interface Confirm {
  title: string
  message: string
  ok: string
  danger?: boolean
  done?: string
  run: () => void
}
export interface Toast {
  id: number
  msg: string
  sub?: string
}

/** UI state that is not domain data. `subject`, `exam`, `group` and `paths` are persisted with the data. */
interface UI {
  saving: boolean
  subject: string
  exam: string
  group: string
  paths: Record<string, string>
  stack: DialogEntry[]
  confirm?: Confirm
  toasts: Toast[]
  selectedQuestions: number[]
}

interface Actions {
  toast: (msg: string, sub?: string) => void
  open: (name: DialogName, arg?: string) => void
  close: () => void
  closeAll: () => void
  ask: (c: Confirm) => void
  set: (p: Partial<UI & DataState>) => void
  setSaving: (on: boolean) => void
  log: (action: string, level?: 'INFO' | 'WARN' | 'ERROR') => void
  reset: () => void
  fastForward: () => void

  saveSubject: (id: string | null, f: Subject) => boolean
  deleteSubject: (id: string) => void
  saveTopic: (id: number | null, f: Pick<Topic, 'name' | 'chapter'>) => void
  deleteTopic: (id: number) => void

  saveQuestion: (id: number | 'new', f: Partial<Question>) => void
  deleteQuestion: (id: number) => void
  importQuestions: (count: number, label: string) => void
  setKey: (id: number, key: Letter) => void
  toggleCancelled: (id: number) => void

  createExam: (f: Pick<Exam, 'name' | 'date' | 'models' | 'qs'>) => void
  duplicateExam: () => void
  saveExam: (id: number, f: Partial<Exam>) => void
  deleteExam: (id: number) => void
  setExamStatus: (id: number, status: Exam['status'], recalc: boolean) => void

  savePart: (sn: number | 'new', f: Partial<Participant>) => void
  deletePart: (sn: number) => void
  importParts: (group: string) => void
  addGroup: (g: string) => void
  deleteGroup: (g: string) => void
  deleteGroupParts: () => void
  assignOne: (sheetSn: number, whoSn: number) => void
  assignAll: () => void
  markAll: (on: boolean) => void

  runCorrection: () => void
  loadErrors: (kind: 'HR' | 'HI') => void
  deleteError: (kind: 'HR' | 'HI', id: number) => void
  clearErrors: (kind?: 'HR' | 'HI') => void
  addBackup: (name: string, folder: string) => void
}
export type AppState = DataState & UI & Actions

const DATA_KEYS = [
  'subjects',
  'topics',
  'groups',
  'exams',
  'questions',
  'participants',
  'logs',
  'backups',
  'cancelled',
  'formula',
  'corrected',
  'translated',
  'errorsHR',
  'errorsHI',
  'subject',
  'exam',
  'group',
  'paths',
] as const

const readSaved = (): Partial<AppState> => {
  try {
    return JSON.parse(localStorage.getItem(STORE) || '{}')
  } catch {
    return {}
  }
}
const readSaving = (): boolean => {
  try {
    const v = localStorage.getItem(SAVING)
    return v === null ? true : JSON.parse(v)
  } catch {
    return true
  }
}
const nextId = (xs: { id: number }[]) => xs.reduce((m, x) => Math.max(m, x.id), 0) + 1
const nextSn = (xs: Participant[]) => xs.reduce((m, x) => Math.max(m, x.sn), 0) + 1
const LETTERS: Letter[] = ['a', 'b', 'c']
const FIRST = ['Lucía', 'Carlos', 'María', 'Javier', 'Carmen', 'David', 'Laura', 'Sergio', 'Elena', 'Pablo']
const LAST = [
  'García',
  'Fernández',
  'López',
  'Martínez',
  'Pérez',
  'Gómez',
  'Ruiz',
  'Díaz',
  'Moreno',
  'Navarro',
]

function newParticipant(s: AppState, n: number, f: Partial<Participant> = {}): Participant {
  const name = FIRST[n % 10],
    a = LAST[(n * 3) % 10],
    b = LAST[(n * 7) % 10]
  return {
    sn: n,
    subject: s.subject,
    id: String(24053000 + n),
    barcode: String(190000000 + n * 131),
    dni: `${30000000 + n * 977}KE`,
    name,
    surnames: `${a} ${b}`,
    email: `${noAccent(name)}.${noAccent(a)}@example.org`,
    phone: `6${10000000 + n * 313}`,
    group: s.group,
    answers: {},
    assigned: false,
    marked: false,
    ...f,
  }
}

let timer: ReturnType<typeof setTimeout>

export const useApp = create<AppState>((set, get) => {
  const saved = readSaved()
  const base = { ...buildSeed(), ...saved }
  let toastId = 0

  /** Tiny helper: change data, log it, and show a toast in one call. */
  const done = (log: string, toast: string, sub?: string) => {
    get().log(log)
    get().toast(toast, sub)
  }

  return {
    ...base,
    saving: readSaving(),
    subject: base.subject ?? base.subjects[0]?.id ?? '',
    exam: base.exam ?? String(base.exams[0]?.id ?? ''),
    group: base.group ?? base.groups[0] ?? '',
    paths: base.paths ?? {},
    stack: [],
    toasts: [],
    selectedQuestions: [],

    /* ----- ui ----- */
    toast: (msg, sub) => {
      const id = ++toastId
      const hint = get().saving ? undefined : 'Not saving to DB — changes last until reload'
      set((s) => ({ toasts: [...s.toasts, { id, msg, sub: sub ?? hint }] }))
      setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3200)
    },
    open: (name, arg) => set((s) => ({ stack: [...s.stack, { name, arg }] })),
    close: () => set((s) => ({ stack: s.stack.slice(0, -1) })),
    closeAll: () => set({ stack: [], confirm: undefined }),
    ask: (confirm) => set((s) => ({ confirm, stack: [...s.stack, { name: 'confirm' }] })),
    set: (p) => set(p as Partial<AppState>),
    setSaving: (saving) => {
      set({ saving })
      get().toast(
        saving ? 'Saving to DB enabled' : 'Saving to DB disabled',
        saving ? 'Changes now stay in this browser' : 'Changes last until you reload',
      )
    },
    log: (action, level = 'INFO') =>
      set((s) => ({
        logs: [{ n: (s.logs[0]?.n ?? 0) + 1, time: now(), level, action, user: USER.email }, ...s.logs],
      })),
    reset: () => {
      try {
        localStorage.removeItem(STORE)
      } catch {
        /* ignore */
      }
      location.hash = '#/login'
      location.reload()
    },
    fastForward: () => {
      set((s) => ({ corrected: true, participants: s.participants.map((p) => ({ ...p, assigned: true })) }))
      get().toast('Demo fast-forwarded', 'Sheets corrected and identities assigned')
    },

    /* ----- subjects & topics ----- */
    saveSubject: (id, f) => {
      const s = get()
      const sid = f.id.toUpperCase() || 'NEW'
      if (id) {
        set({ subjects: s.subjects.map((x) => (x.id === id ? { ...x, name: f.name } : x)) })
        done(`Edit subject ${id}`, 'Subject saved', `${id} – ${f.name}`)
      } else {
        if (s.subjects.some((x) => x.id === sid)) {
          s.toast(`Subject ${sid} already exists`, 'Pick a different ID')
          return false
        }
        set({ subjects: [...s.subjects, { id: sid, name: f.name }], subject: sid })
        done(`Create subject ${sid}`, 'Subject created', `${sid} – ${f.name}`)
      }
      return true
    },
    deleteSubject: (id) => {
      const s = get()
      const subjects = s.subjects.filter((x) => x.id !== id)
      const subject = subjects[0]?.id ?? ''
      set({
        subjects,
        subject,
        topics: s.topics.filter((x) => x.subject !== id),
        questions: s.questions.filter((x) => x.subject !== id),
        participants: s.participants.filter((x) => x.subject !== id),
        exams: s.exams.filter((x) => x.subject !== id),
        exam: String(s.exams.find((e) => e.subject === subject)?.id ?? ''),
      })
      s.log(`Delete subject ${id}`)
    },
    saveTopic: (id, f) => {
      const s = get()
      if (id) {
        set({ topics: s.topics.map((t) => (t.id === id ? { ...t, ...f } : t)) })
        done(`Edit topic ${id}`, 'Topic saved', f.name)
      } else {
        set({ topics: [...s.topics, { id: nextId(s.topics), subject: s.subject, ...f }] })
        done(`Add topic ${f.name}`, 'Topic added', f.name)
      }
    },
    deleteTopic: (id) => {
      const s = get()
      set({
        topics: s.topics.filter((t) => t.id !== id),
        questions: s.questions.filter((q) => q.topic !== id),
      })
      s.log(`Delete topic ${id}`)
    },

    /* ----- questions ----- */
    saveQuestion: (id, f) => {
      const s = get()
      if (id === 'new') {
        const q: Question = {
          id: nextId(s.questions),
          subject: s.subject,
          topic: s.topics.find((t) => t.subject === s.subject)?.id ?? 0,
          type: 'MC',
          key: 'a',
          text: '',
          opts: { a: '', b: '', c: '' },
          used: 0,
          mods: 1,
          ...f,
        }
        set({ questions: [...s.questions, q] })
        done(`Add question ${q.id}`, 'Question added', `#${q.id}`)
      } else {
        set({ questions: s.questions.map((q) => (q.id === id ? { ...q, ...f, mods: q.mods + 1 } : q)) })
        done(`Edit question ${id}`, 'Question saved', `#${id}`)
      }
    },
    deleteQuestion: (id) => {
      const s = get()
      set({
        questions: s.questions.filter((q) => q.id !== id),
        cancelled: s.cancelled.filter((c) => c !== id),
      })
      s.log(`Delete question ${id}`)
    },
    importQuestions: (count, label) => {
      const s = get()
      const topic = s.topics.find((t) => t.subject === s.subject)?.id ?? 0
      let id = nextId(s.questions)
      const added: Question[] = []
      for (let i = 0; i < count; i++, id++) {
        const key = LETTERS[id % 3]
        added.push({
          id,
          subject: s.subject,
          topic,
          type: 'MC',
          key,
          text: `Pregunta ${id}, respuesta correcta ${key}, De MC (${label})`,
          opts: { a: 'Opción A', b: 'Opción B', c: 'Opción C' },
          used: 0,
          mods: 1,
        })
      }
      set({ questions: [...s.questions, ...added] })
    },
    setKey: (id, key) =>
      set((s) => ({ questions: s.questions.map((q) => (q.id === id ? { ...q, key } : q)) })),
    toggleCancelled: (id) => {
      const s = get()
      const on = !s.cancelled.includes(id)
      set({ cancelled: on ? [...s.cancelled, id] : s.cancelled.filter((c) => c !== id) })
      s.toast(
        on ? `Question ${id} cancelled` : `Question ${id} restored`,
        'Click Recalculate grades to apply',
      )
    },

    /* ----- exams ----- */
    createExam: (f) => {
      const s = get()
      const id = nextId(s.exams)
      const exam: Exam = {
        id,
        subject: s.subject,
        model: 1,
        created: now(),
        status: 'open',
        recalc: 'No',
        ...f,
      }
      set({ exams: [...s.exams, exam], exam: String(id) })
      done(`Create exam ${f.name}`, 'Exam created', `${f.name} | ${f.date} | ${id}`)
    },
    duplicateExam: () => {
      const s = get()
      const e = s.exams.find((x) => String(x.id) === s.exam)
      if (!e) {
        s.toast('Pick an exam to duplicate')
        return
      }
      const copy = {
        ...e,
        id: nextId(s.exams),
        name: `${e.name} (copy)`,
        created: now(),
        status: 'open' as const,
      }
      set({ exams: [...s.exams, copy], exam: String(copy.id) })
      done(`Duplicate exam ${e.name}`, 'Exam duplicated', copy.name)
    },
    saveExam: (id, f) => {
      set((s) => ({ exams: s.exams.map((e) => (e.id === id ? { ...e, ...f } : e)) }))
      done(`Edit exam ${id}`, 'Exam saved', f.name)
    },
    deleteExam: (id) => {
      const s = get()
      const exams = s.exams.filter((e) => e.id !== id)
      set({ exams, exam: String(exams.find((e) => e.subject === s.subject)?.id ?? '') })
      s.log(`Delete exam ${id}`)
    },
    setExamStatus: (id, status, recalc) => {
      set((s) => ({
        exams: s.exams.map((e) => (e.id === id ? { ...e, status, recalc: recalc ? 'Yes' : e.recalc } : e)),
      }))
      done(
        `${status === 'closed' ? 'Close' : 'Open'} exam ${id}`,
        status === 'closed' ? 'Exam closed' : 'Exam opened',
      )
    },

    /* ----- participants ----- */
    savePart: (sn, f) => {
      const s = get()
      if (sn === 'new') {
        const p = newParticipant(s, nextSn(s.participants), { name: 'New', surnames: 'Participant', ...f })
        set({ participants: [...s.participants, p] })
        done(`Add participant ${p.dni}`, 'Participant added', `${p.surnames}, ${p.name}`)
      } else {
        set({ participants: s.participants.map((p) => (p.sn === sn ? { ...p, ...f } : p)) })
        done(`Edit participant ${sn}`, 'Participant saved', `${f.surnames ?? ''}, ${f.name ?? ''}`)
      }
    },
    deletePart: (sn) => {
      const s = get()
      const p = s.participants.find((x) => x.sn === sn)
      set({ participants: s.participants.filter((x) => x.sn !== sn) })
      s.log(`Delete participant ${p?.dni ?? sn}`)
    },
    importParts: (group) => {
      const s = get()
      let n = nextSn(s.participants)
      const added = Array.from({ length: 10 }, () => newParticipant(s, n++, { group }))
      set({ participants: [...s.participants, ...added] })
      done('Import participants', 'Participants imported', `${added.length} added to ${group}`)
    },
    addGroup: (g) => {
      const s = get()
      set({ groups: s.groups.includes(g) ? s.groups : [...s.groups, g], group: g })
      done(`Add group ${g}`, 'Year / group added', g)
    },
    deleteGroup: (g) => {
      const s = get()
      const groups = s.groups.filter((x) => x !== g)
      set({ groups, participants: s.participants.filter((p) => p.group !== g), group: groups[0] ?? '' })
      s.log(`Delete group ${g}`)
    },
    deleteGroupParts: () => {
      const s = get()
      set({ participants: s.participants.filter((p) => !(p.subject === s.subject && p.group === s.group)) })
      s.log(`Delete participants of ${s.group}`)
    },
    assignOne: (sheetSn, whoSn) => {
      const s = get()
      const sheet = s.participants.find((p) => p.sn === sheetSn)
      const who = s.participants.find((p) => p.sn === whoSn)
      if (!sheet || !who) return
      set({
        participants: s.participants.map((p) => {
          if (p.sn === sheetSn) return { ...p, assigned: true, name: who.name, surnames: who.surnames }
          if (p.sn === whoSn && whoSn !== sheetSn) return { ...p, name: sheet.name, surnames: sheet.surnames }
          return p
        }),
      })
      done(`Assign identity ${sheet.id}`, 'Identity assigned', `${who.surnames}, ${who.name}`)
    },
    assignAll: () => {
      const s = get()
      const mine = s.participants.filter((p) => p.subject === s.subject).length
      set({
        participants: s.participants.map((p) => (p.subject === s.subject ? { ...p, assigned: true } : p)),
      })
      done('Assign all identities', 'All identities assigned', `${mine} sheets matched to participants`)
    },
    markAll: (on) =>
      set((s) => ({
        participants: s.participants.map((p) => (p.subject === s.subject ? { ...p, marked: on } : p)),
      })),

    /* ----- correction & errors ----- */
    runCorrection: () => {
      const s = get()
      const n = s.participants.filter((p) => p.subject === s.subject).length
      set({ corrected: true })
      done(
        'Correct exam',
        'Correction finished',
        `${n} sheets read · ${s.errorsHR.length + s.errorsHI.length} errors`,
      )
    },
    loadErrors: (kind) => {
      const s = get()
      const mine = s.participants.filter((p) => p.subject === s.subject)
      if (mine.length < 3) {
        s.toast('Need at least 3 participants')
        return
      }
      const rows: ErrorSheet[] = [0, 1, 2].map((i) => ({
        id: i + 1,
        model: 1,
        sheet: mine[i].id,
        idr: i === 1 ? '—' : mine[i].id,
        ex: 1,
        marks: '',
        pid: mine[i].sn,
      }))
      set(kind === 'HR' ? { errorsHR: rows } : { errorsHI: rows })
      s.toast('Sample error sheets loaded', `${rows.length} sheets`)
    },
    deleteError: (kind, id) => {
      const key = kind === 'HR' ? 'errorsHR' : 'errorsHI'
      set((s) => ({ [key]: s[key].filter((e) => e.id !== id) }) as Partial<AppState>)
    },
    clearErrors: (kind) =>
      set(
        kind === 'HR' ? { errorsHR: [] } : kind === 'HI' ? { errorsHI: [] } : { errorsHR: [], errorsHI: [] },
      ),
    addBackup: (name, folder) => {
      set((s) => ({ backups: [{ date: now().slice(0, 10), path: `${folder}/${name}.zip` }, ...s.backups] }))
      done('Backup database', 'Backup created', `${name}.zip`)
    },
  }
})

/** Persist data to localStorage whenever it changes — only while "Saving to DB" is on. */
useApp.subscribe((s) => {
  clearTimeout(timer)
  timer = setTimeout(() => {
    try {
      localStorage.setItem(SAVING, JSON.stringify(s.saving))
      if (!s.saving) return
      const out: Record<string, unknown> = {}
      DATA_KEYS.forEach((k) => {
        out[k] = s[k]
      })
      localStorage.setItem(STORE, JSON.stringify(out))
    } catch {
      /* storage unavailable */
    }
  }, 150)
})
