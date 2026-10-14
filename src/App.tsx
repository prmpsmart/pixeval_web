import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Shell } from './components/Shell'
import { DialogHost } from './components/DialogHost'
import { Toasts } from './components/Toasts'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { ParticipantsList, ParticipantsOverview } from './pages/Participants'
import { Subjects } from './pages/Subjects'
import { Questions } from './pages/Questions'
import { Exams } from './pages/Exams'
import { AddExam } from './pages/AddExam'
import { Sheets } from './pages/Sheets'
import { Corrections } from './pages/Corrections'
import { Assign } from './pages/Assign'
import { Grades } from './pages/Grades'
import { Errors } from './pages/Errors'
import { Reserve } from './pages/Reserve'
import { History } from './pages/History'
import { CloseExams } from './pages/CloseExams'
import { Utilities } from './pages/Utilities'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Shell />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/participants" element={<ParticipantsOverview />} />
          <Route path="/participants/:subject" element={<ParticipantsList />} />
          <Route path="/subjects" element={<Subjects />} />
          <Route path="/questions" element={<Questions />} />
          <Route path="/exams" element={<Exams />} />
          <Route path="/add-exam" element={<AddExam />} />
          <Route path="/sheets" element={<Sheets />} />
          <Route path="/corrections" element={<Corrections />} />
          <Route path="/assign" element={<Assign />} />
          <Route path="/grades" element={<Grades />} />
          <Route path="/errors/:kind" element={<Errors />} />
          <Route path="/reserve" element={<Reserve />} />
          <Route path="/history" element={<History />} />
          <Route path="/close" element={<CloseExams />} />
          <Route path="/utilities" element={<Utilities />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
      <DialogHost />
      <Toasts />
    </HashRouter>
  )
}
