import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Shell from './components/Shell'

import LoginPage     from './pages/LoginPage'
import AdminOverview from './pages/admin/AdminOverview'
import StudentsPage  from './pages/admin/StudentsPage'
import RecordsPage   from './pages/admin/RecordsPage'
import QRPage        from './pages/admin/QRPage'
import DashboardPage from './pages/DashboardPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/"      element={<Navigate to="/login" replace />} />

          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Shell role="admin" />
            </ProtectedRoute>
          }>
            <Route index           element={<AdminOverview />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="records"  element={<RecordsPage />} />
            <Route path="qr"       element={<QRPage />} />
          </Route>

          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['dashboard', 'admin']}>
              <DashboardPage />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#161b24',
            color: '#e8edf5',
            border: '1px solid #232b38',
            borderRadius: '12px',
            fontSize: '13px',
            fontFamily: 'DM Sans, sans-serif',
          },
          success: { iconTheme: { primary: '#3ab78e', secondary: '#0f1117' } },
          error:   { iconTheme: { primary: '#e05555', secondary: '#0f1117' } },
        }}
      />
    </AuthProvider>
  )
}