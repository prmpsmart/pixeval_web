import type { ReactElement } from 'react'
import { useApp, type DialogName } from '../store/useApp'
import { ConfirmDialog } from '../dialogs/ConfirmDialog'
import { PickerDialog } from '../dialogs/PickerDialog'
import { CommandPalette } from '../dialogs/CommandPalette'
import { ConfigDialog } from '../dialogs/ConfigDialog'
import { CreditsDialog } from '../dialogs/CreditsDialog'
import { ParticipantDialog } from '../dialogs/ParticipantDialog'
import { ImportParticipantsDialog, YearGroupDialog, SearchParticipantsDialog } from '../dialogs/GroupDialogs'
import { SubjectDialog, TopicDialog } from '../dialogs/SubjectDialogs'
import { QuestionDialog, SearchQuestionsDialog, ImportQuestionsDialog, ExportQuestionsDialog, UpdateQuestionsDialog } from '../dialogs/QuestionDialogs'
import { QuestionExamsDialog, QuestionHistoryDialog, MultiAnswersDialog } from '../dialogs/QuestionInfoDialogs'
import { SelectQuestionsDialog, PreviewExamDialog, DifficultyDialog, FormulaDialog, MatrixDialog } from '../dialogs/ExamDialogs'
import { InstructionsDialog, BarcodesDialog } from '../dialogs/SheetDialogs'
import { ReportDialog, OutputFolderDialog, StatisticsDialog } from '../dialogs/GradeDialogs'
import { EditExamDialog, SectionDialog } from '../dialogs/HistoryDialogs'

/** The single place that maps a dialog name to its component. Add new dialogs here. */
const REGISTRY: Record<DialogName, (arg?: string) => ReactElement> = {
  confirm: () => <ConfirmDialog />,
  picker: (a) => <PickerDialog arg={a} />,
  cmd: () => <CommandPalette />,
  config: () => <ConfigDialog />,
  credits: () => <CreditsDialog />,
  participant: (a) => <ParticipantDialog arg={a} />,
  'import-participants': () => <ImportParticipantsDialog />,
  'year-group': () => <YearGroupDialog />,
  'search-participants': () => <SearchParticipantsDialog />,
  subject: (a) => <SubjectDialog arg={a} />,
  topic: (a) => <TopicDialog arg={a} />,
  question: (a) => <QuestionDialog arg={a} />,
  'search-questions': () => <SearchQuestionsDialog />,
  'import-questions': () => <ImportQuestionsDialog />,
  'export-questions': () => <ExportQuestionsDialog />,
  'update-questions': () => <UpdateQuestionsDialog />,
  'question-exams': (a) => <QuestionExamsDialog arg={a} />,
  'question-history': (a) => <QuestionHistoryDialog arg={a} />,
  'multi-answers': (a) => <MultiAnswersDialog arg={a} />,
  'select-questions': () => <SelectQuestionsDialog />,
  'preview-exam': () => <PreviewExamDialog />,
  difficulty: () => <DifficultyDialog />,
  formula: () => <FormulaDialog />,
  matrix: () => <MatrixDialog />,
  instructions: () => <InstructionsDialog />,
  barcodes: () => <BarcodesDialog />,
  report: (a) => <ReportDialog arg={a} />,
  'output-folder': () => <OutputFolderDialog />,
  statistics: () => <StatisticsDialog />,
  'edit-exam': (a) => <EditExamDialog arg={a} />,
  section: (a) => <SectionDialog arg={a} />,
}

export function DialogHost() {
  const top = useApp((s) => s.stack[s.stack.length - 1])
  return top ? REGISTRY[top.name](top.arg) : null
}
