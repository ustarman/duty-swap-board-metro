import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import BoardList from './pages/BoardList'
import PostNew from './pages/PostNew'
import PostDetail from './pages/PostDetail'
import Notifications from './pages/Notifications'
import Login from './pages/Login'
import { registerPushNotifications } from './hooks/usePushNotifications'
import { AP_RED } from './theme'
import './index.css'

// Temporary stop: flip to false (and redeploy) to bring Swap Board back.
// While true, the app renders only this notice — no routes, no auth, no
// Supabase calls happen at all.
const MAINTENANCE_MODE = true

function MaintenanceNotice() {
  return (
    <div
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '100svh', textAlign: 'center', padding: '2rem',
      }}
    >
      <div
        style={{
          width: 56, height: 56, borderRadius: 16, background: AP_RED,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26, marginBottom: '1.25rem',
        }}
      >
        🛠️
      </div>
      <p style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-color)', marginBottom: 8 }}>
        Currently Under Maintenance
      </p>
      <p style={{ fontSize: 14, color: 'var(--subtext-color)', lineHeight: 1.6, maxWidth: 320 }}>
        Swap Board is temporarily unavailable while we make some changes.
        Please check back later.
      </p>
    </div>
  )
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100svh' }}>
      <div style={{ color: 'var(--subtext-color)', fontSize: 14 }}>Loading...</div>
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  const { user, loading } = useAuth()

  useEffect(() => {
    if (user) registerPushNotifications(user.id)
  }, [user])

  if (loading) return null

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={<ProtectedRoute><BoardList /></ProtectedRoute>} />
      <Route path="/post/new" element={<ProtectedRoute><PostNew /></ProtectedRoute>} />
      <Route path="/post/:id" element={<ProtectedRoute><PostDetail /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
    </Routes>
  )
}

export default function App() {
  if (MAINTENANCE_MODE) {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100svh', position: 'relative' }}>
        <MaintenanceNotice />
      </div>
    )
  }

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100svh', position: 'relative' }}>
          <AppRoutes />
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}
