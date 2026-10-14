import type { DataState, Letter, Participant, Question } from './types'

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
    subjects: [{ id: 'TJ', name: 'Técnico Jurídico' }],
    topics: [{ id: 1, subject: 'TJ', name: 'Tema de la Matriz de Corrección', chapter: 1 }],
    groups: ['2025 | 1'],
    exams: [
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
    ],
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
