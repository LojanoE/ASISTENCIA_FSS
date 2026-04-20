import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { Layout } from '@/components/Layout'
import { ProtectedRoute, AdminRoute } from '@/components/ProtectedRoute'
import { HomePage } from '@/pages/HomePage'
import { DashboardPage } from '@/pages/DashboardPage'
import { AdminDashboard } from '@/pages/admin/AdminDashboard'
import { WorkersPage } from '@/pages/admin/WorkersPage'
import { AttendancePage } from '@/pages/admin/AttendancePage'
import { SettingsPage } from '@/pages/admin/SettingsPage'
import { QRPage } from '@/pages/QRPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/workers" element={<AdminRoute><WorkersPage /></AdminRoute>} />
            <Route path="/admin/attendance" element={<AdminRoute><AttendancePage /></AdminRoute>} />
            <Route path="/admin/settings" element={<AdminRoute><SettingsPage /></AdminRoute>} />
            <Route path="/qr" element={<ProtectedRoute><QRPage /></ProtectedRoute>} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}