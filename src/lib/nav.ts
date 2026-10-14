import type { IconName } from './iconPaths'

export interface NavItem {
  id: string
  icon: IconName
  label: string
  es: string
  to?: string
  dialog?: 'config' | 'credits'
  group: 'Library' | 'Examination' | 'foot'
}

export const NAV: NavItem[] = [
  { id: 'dashboard', icon: 'dash', label: 'Dashboard', es: 'Panel', to: '/dashboard', group: 'Library' },
  { id: 'subjects', icon: 'layers', label: 'Subjects', es: 'Asignaturas', to: '/subjects', group: 'Library' },
  { id: 'questions', icon: 'help', label: 'Questions', es: 'Preguntas', to: '/questions', group: 'Library' },
  {
    id: 'participants',
    icon: 'users',
    label: 'Participants',
    es: 'Participantes',
    to: '/participants',
    group: 'Library',
  },
  { id: 'exams', icon: 'file', label: 'Exams', es: 'Exámenes', to: '/exams', group: 'Examination' },
  { id: 'add-exam', icon: 'plus', label: '+ Exam', es: '+ Examen', to: '/add-exam', group: 'Examination' },
  {
    id: 'sheets',
    icon: 'print',
    label: 'Sheets management',
    es: 'Gestión de hojas',
    to: '/sheets',
    group: 'Examination',
  },
  {
    id: 'corrections',
    icon: 'scan',
    label: 'Corrections',
    es: 'Correcciones',
    to: '/corrections',
    group: 'Examination',
  },
  {
    id: 'assign',
    icon: 'uid',
    label: 'Assign identities',
    es: 'Asignar identidades',
    to: '/assign',
    group: 'Examination',
  },
  { id: 'grades', icon: 'grade', label: 'Grades', es: 'Notas', to: '/grades', group: 'Examination' },
  {
    id: 'reserve',
    icon: 'bookmark',
    label: 'Reserve questions',
    es: 'Preguntas de reserva',
    to: '/reserve',
    group: 'Examination',
  },
  { id: 'history', icon: 'hist', label: 'History', es: 'Historial', to: '/history', group: 'Examination' },
  {
    id: 'close',
    icon: 'lock',
    label: 'Close exams',
    es: 'Cerrar exámenes',
    to: '/close',
    group: 'Examination',
  },
  { id: 'research', icon: 'book', label: 'Research', es: 'Investigación', to: '/research', group: 'foot' },
  { id: 'utilities', icon: 'wrench', label: 'Utilities', es: 'Utilidades', to: '/utilities', group: 'foot' },
  { id: 'config', icon: 'cog', label: 'Configuration', es: 'Configuración', dialog: 'config', group: 'foot' },
  { id: 'credits', icon: 'award', label: 'Credits', es: 'Créditos', dialog: 'credits', group: 'foot' },
  { id: 'logout', icon: 'out', label: 'Logout', es: 'Salir', to: '/login', group: 'foot' },
]
