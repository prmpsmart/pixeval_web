import type { IconName } from './iconPaths'

export interface NavItem {
  id: string
  icon: IconName
  label: string
  to?: string
  dialog?: 'config' | 'credits'
  group: 'Library' | 'Examination' | 'foot'
}

export const NAV: NavItem[] = [
  { id: 'dashboard', icon: 'dash', label: 'Dashboard', to: '/dashboard', group: 'Library' },
  { id: 'subjects', icon: 'layers', label: 'Subjects', to: '/subjects', group: 'Library' },
  { id: 'questions', icon: 'help', label: 'Questions', to: '/questions', group: 'Library' },
  {
    id: 'participants',
    icon: 'users',
    label: 'Participants',
    to: '/participants',
    group: 'Library',
  },
  { id: 'exams', icon: 'file', label: 'Exams', to: '/exams', group: 'Examination' },
  { id: 'add-exam', icon: 'plus', label: '+ Exam', to: '/add-exam', group: 'Examination' },
  {
    id: 'sheets',
    icon: 'print',
    label: 'Sheets management',
    to: '/sheets',
    group: 'Examination',
  },
  {
    id: 'corrections',
    icon: 'scan',
    label: 'Corrections',
    to: '/corrections',
    group: 'Examination',
  },
  {
    id: 'assign',
    icon: 'uid',
    label: 'Assign identities',
    to: '/assign',
    group: 'Examination',
  },
  { id: 'grades', icon: 'grade', label: 'Grades', to: '/grades', group: 'Examination' },
  {
    id: 'reserve',
    icon: 'bookmark',
    label: 'Reserve questions',
    to: '/reserve',
    group: 'Examination',
  },
  { id: 'history', icon: 'hist', label: 'History', to: '/history', group: 'Examination' },
  {
    id: 'close',
    icon: 'lock',
    label: 'Close exams',
    to: '/close',
    group: 'Examination',
  },
  { id: 'research', icon: 'book', label: 'Research', to: '/research', group: 'foot' },
  { id: 'utilities', icon: 'wrench', label: 'Utilities', to: '/utilities', group: 'foot' },
  { id: 'config', icon: 'cog', label: 'Configuration', dialog: 'config', group: 'foot' },
  { id: 'credits', icon: 'award', label: 'Credits', dialog: 'credits', group: 'foot' },
  { id: 'logout', icon: 'out', label: 'Logout', to: '/login', group: 'foot' },
]
