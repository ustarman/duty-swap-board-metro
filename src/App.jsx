import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import BoardList from './pages/BoardList'
import PostNew from './pages/PostNew'
import PostDetail from './pages/PostDetail'
import Notifications from './pages/Notifications'
import Login from './pages/Login'
import { registerPushNotifications } from './hooks/usePushNotifications'
import './index.css'

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
