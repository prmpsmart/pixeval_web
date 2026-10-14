import type { DataState, Exam, Letter, Participant, Question } from './types'

/** Deterministic sample data mirroring the piXeval v7.6.0 sample database. */
let seed = 20260102
const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296
const pick = <T>(a: T[]): T => a[Math.floor(rnd() * a.length)]

const names = [
  'Lucía',
  'Carlos',
  'María',
  'Javier',
  'Carmen',
  'David',
  'Laura',
  'Sergio',
  'Elena',
  'Pablo',
  'Marta',
  'Álvaro',
  'Sofía',
  'Daniel',
  'Paula',
  'Adrián',
  'Irene',
  'Rubén',
  'Claudia',
  'Hugo',
  'Andrea',
  'Iván',
  'Nuria',
  'Diego',
  'Raquel',
  'Mario',
  'Silvia',
  'Óscar',
  'Beatriz',
  'Jorge',
]
const surnames = [
  'García',
  'Fernández',
  'González',
  'Rodríguez',
  'López',
  'Martínez',
  'Sánchez',
  'Pérez',
  'Gómez',
  'Martín',
  'Jiménez',
  'Ruiz',
  'Hernández',
  'Díaz',
  'Moreno',
  'Álvarez',
  'Muñoz',
  'Romero',
  'Alonso',
  'Gutiérrez',
  'Navarro',
  'Torres',
  'Domínguez',
  'Vázquez',
  'Ramos',
  'Gil',
  'Serrano',
  'Blanco',
  'Molina',
  'Castro',
]
export const noAccent = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
const letters: Letter[] = ['a', 'b', 'c']

export function buildSeed(): DataState {
  const questions: Question[] = []
  for (let i = 1; i <= 100; i++) {
    const key = pick(letters)
    questions.push({
      id: i,
      subject: 'TJ',
      topic: 1,
      type: 'MC',
      key,
      text: `Pregunta ${i}, respuesta correcta ${key}, De MC`,
      opts: {
        a: `Opción A de la pregunta ${i}`,
        b: `Opción B de la pregunta ${i}`,
        c: `Opción C de la pregunta ${i}`,
      },
      used: 1,
      mods: i % 7 === 0 ? 2 : 1,
    })
  }
  const participants: Participant[] = []
  for (let i = 0; i < 128; i++) {
    const name = pick(names),
      s1 = pick(surnames),
      s2 = pick(surnames)
    const ability = 0.35 + rnd() * 0.55
    const answers: Participant['answers'] = {}
    questions.forEach((q) => {
      const r = rnd()
      answers[q.id] =
        r < ability ? q.key : r < ability + 0.07 ? '-' : pick(letters.filter((x) => x !== q.key))
    })
    participants.push({
      sn: i + 1,
      subject: 'TJ',
      id: String(24053000 + ((i * 37) % 128) + 1),
      barcode: String(190000000 + i * 131),
      dni: String(10000000 + Math.floor(rnd() * 89999999)) + pick('TRWAGMYFPDXBNJZSQVHLCKE'.split('')),
      name,
      surnames: `${s1} ${s2}`,
      email: `${noAccent(name)}.${noAccent(s1)}@example.org`,
      phone: '6' + String(10000000 + Math.floor(rnd() * 89999999)),
      group: '2025 | 1',
      answers,
      assigned: false,
      marked: false,
    })
  }
  /** Two smaller subjects so the library, filters and subject switching have something to show. */
  const extras = [
    {
      id: 'AA',
      name: 'Auxiliar Administrativo',
      group: '2025 | 2',
      exam: 'Examen AA',
      date: '2026-01-15',
      topics: ['Organización del Estado', 'Procedimiento administrativo'],
      qs: 30,
      people: 24,
    },
    {
      id: 'GP',
      name: 'Gestión Procesal',
      group: '2025 | 1',
      exam: 'Examen GP',
      date: '2026-01-22',
      topics: ['Actos procesales', 'Plazos y notificaciones', 'Recursos'],
      qs: 24,
      people: 18,
    },
  ]
  let nextQ = 101,
    nextTopic = 2,
    nextId = 24054000
  const topics = [{ id: 1, subject: 'TJ', name: 'Tema de la Matriz de Corrección', chapter: 1 }]
  const exams: Exam[] = [
    {
      id: 1,
      subject: 'TJ',
      name: 'Examen TJ',
      date: '2026-01-02',
      model: 1,
      models: 1,
      created: '2026-02-19 11:57:38',
      status: 'open',
      recalc: 'No',
    },
  ]
  extras.forEach((x, xi) => {
    const topicIds = x.topics.map((name, ti) => {
      topics.push({ id: nextTopic, subject: x.id, name, chapter: ti + 1 })
      return nextTopic++
    })
    const qs: Question[] = []
    for (let i = 1; i <= x.qs; i++) {
      const key = pick(letters)
      qs.push({
        id: nextQ++,
        subject: x.id,
        topic: topicIds[i % topicIds.length],
        type: 'MC',
        key,
        text: `Pregunta ${i} de ${x.name}, respuesta correcta ${key}`,
        opts: {
          a: `Opción A de la pregunta ${i}`,
          b: `Opción B de la pregunta ${i}`,
          c: `Opción C de la pregunta ${i}`,
        },
        used: 1,
        mods: 1,
      })
    }
    questions.push(...qs)
    for (let i = 0; i < x.people; i++) {
      const name = pick(names),
        s1 = pick(surnames),
        s2 = pick(surnames)
      const ability = 0.4 + rnd() * 0.5
      const answers: Participant['answers'] = {}
      qs.forEach((q) => {
        const r = rnd()
        answers[q.id] =
          r < ability ? q.key : r < ability + 0.07 ? '-' : pick(letters.filter((l) => l !== q.key))
      })
      participants.push({
        sn: i + 1,
        subject: x.id,
        id: String(nextId++),
        barcode: String(191000000 + (xi * 100 + i) * 131),
        dni: String(10000000 + Math.floor(rnd() * 89999999)) + pick('TRWAGMYFPDXBNJZSQVHLCKE'.split('')),
        name,
        surnames: `${s1} ${s2}`,
        email: `${noAccent(name)}.${noAccent(s1)}@example.org`,
        phone: '6' + String(10000000 + Math.floor(rnd() * 89999999)),
        group: x.group,
        answers,
        assigned: false,
        marked: false,
      })
    }
    exams.push({
      id: exams.length + 1,
      subject: x.id,
      name: x.exam,
      date: x.date,
      model: 1,
      models: 1,
      created: `${x.date} 10:00:00`,
      status: 'open',
      recalc: 'No',
    })
  })
  /** Earlier and follow-up exams, so closing, recalculation and the exam pickers have variety. */
  const more: [string, string, string, number, 'open' | 'closed', 'Yes' | 'No'][] = [
    ['TJ', 'Simulacro TJ', '2025-11-20', 2, 'closed', 'Yes'],
    ['TJ', 'Examen TJ (recuperación)', '2026-02-12', 1, 'open', 'No'],
    ['AA', 'Simulacro AA', '2025-12-10', 1, 'closed', 'No'],
    ['AA', 'Examen AA (segunda convocatoria)', '2026-02-05', 2, 'open', 'No'],
    ['GP', 'Simulacro GP', '2025-12-18', 1, 'closed', 'Yes'],
  ]
  more.forEach(([subject, name, date, models, status, recalc]) =>
    exams.push({
      id: exams.length + 1,
      subject,
      name,
      date,
      model: 1,
      models,
      created: `${date} 09:30:00`,
      status,
      recalc,
    }),
  )

  const acts = [
    'Login',
    'Open database',
    'Create exam',
    'Generate answer sheets',
    'Correct exam',
    'Assign identity',
    'Export grades',
    'Edit question',
    'Import participants',
    'Backup database',
    'Recalculate grades',
    'Close exam',
    'Open exam',
    'Print exam',
  ]
  const lv = ['INFO', 'INFO', 'INFO', 'INFO', 'WARN', 'INFO', 'ERROR', 'INFO'] as const
  const logs = Array.from({ length: 954 }, (_, i) => ({
    n: 954 - i,
    time: new Date(2026, 0, 2 + Math.floor(i / 22), 8 + (i % 12), (i * 7) % 60, (i * 13) % 60)
      .toISOString()
      .slice(0, 19)
      .replace('T', ' '),
    level: lv[i % lv.length],
    action: acts[(i * 5) % acts.length],
    user: 'prmpsmart@gmail.com',
  })).sort((a, b) => b.time.localeCompare(a.time))

  return {
    subjects: [{ id: 'TJ', name: 'Técnico Jurídico' }, ...extras.map((x) => ({ id: x.id, name: x.name }))],
    topics,
    groups: ['2025 | 1', '2025 | 2'],
    exams,
    questions,
    participants,
    logs,
    backups: [{ date: '2026-01-28', path: 'C:/Users/aesco/Desktop/backup_BDFuenlabradaTJ1_2026-01-28.zip' }],
    cancelled: [],
    formula: '(C - (E/P)) * V / N',
    corrected: false,
    translated: false,
    errorsHR: [],
    errorsHI: [],
  }
}
export const USER = {
  email: 'prmpsmart@gmail.com',
  name: 'Miracle Apata',
  initials: 'MA',
  license: '31/07/2025',
  mode: 'Evaluation mode',
  db: 'sheet_omr.db',
  version: '7.6.0',
}
