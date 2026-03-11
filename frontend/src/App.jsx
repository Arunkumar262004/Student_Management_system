import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector }             from 'react-redux'

import { selectIsAuthenticated, selectCurrentUser } from './store/authSlice'

import Layout            from './components/layout/Layout'
import LoginPage         from './pages/LoginPage'
import RegisterPage      from './pages/RegisterPage'
import DashboardPage     from './pages/DashboardPage'
import StudentsPage      from './pages/StudentsPage'
import StudentFormPage   from './pages/StudentFormPage'
import StudentDetailPage from './pages/StudentDetailPage'
import AuditLogsPage     from './pages/AuditLogsPage'

// Redirect to login if not logged in
const PrivateRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

// Redirect if not admin
const AdminRoute = ({ children }) => {
  const user = useSelector(selectCurrentUser)
  if (!user)                 return <Navigate to="/login"    replace />
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  const isAuthenticated = useSelector(selectIsAuthenticated)

  return (
    <Routes>
      {/* Public */}
      <Route path="/login"    element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />}    />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterPage />} />

      {/* Protected inside Layout */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index                    element={<Navigate to="/dashboard" />} />
        <Route path="dashboard"         element={<DashboardPage />}            />
        <Route path="students"          element={<StudentsPage />}             />
        <Route path="students/new"      element={<AdminRoute><StudentFormPage /></AdminRoute>}   />
        <Route path="students/:id"      element={<StudentDetailPage />}        />
        <Route path="students/:id/edit" element={<AdminRoute><StudentFormPage /></AdminRoute>}   />
        <Route path="audit-logs"        element={<AdminRoute><AuditLogsPage /></AdminRoute>}     />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  )
}