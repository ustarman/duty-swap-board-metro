import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { fetchUnreadCount } from '../dataService'
import { AP_RED } from '../theme'

export default function Header({ badge = 'Board' }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    if (!user) return

    loadUnreadCount()

    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, () => loadUnreadCount())
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [user])

  async function loadUnreadCount() {
    if (!user) return
    try {
      const count = await fetchUnreadCount(user.id)
      setUnread(count)
    } catch { /* silent */ }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <header
      style={{
        background: AP_RED,
        padding: '1rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        flexShrink: 0,
      }}
    >
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7 16V4m0 0L3 8m4-4l4 4" />
        <path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
      </svg>
      <div style={{ flex: 1 }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: 'white', lineHeight: 1.2 }}>
          Duty Swap
        </h1>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>Brisbane Transport</p>
      </div>

      {/* Bell icon */}
      {user && (
        <button
          onClick={() => navigate('/notifications')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            position: 'relative', padding: '4px', flexShrink: 0,
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {unread > 0 && (
            <span style={{
              position: 'absolute', top: 0, right: 0,
              background: 'white', color: AP_RED,
              fontSize: 9, fontWeight: 800,
              width: 16, height: 16, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              lineHeight: 1,
            }}>
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
      )}

      {badge && (
        <span style={{
          fontSize: 11, color: 'white',
          border: '1px solid rgba(255,255,255,0.7)',
          borderRadius: 4, padding: '2px 8px',
          fontWeight: 700, flexShrink: 0,
        }}>
          {badge}
        </span>
      )}

      {user && (
        <button
          onClick={handleSignOut}
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.5)',
            borderRadius: 6, color: 'white',
            fontSize: 11, fontWeight: 600,
            padding: '4px 10px', cursor: 'pointer', flexShrink: 0,
          }}
        >
          Sign Out
        </button>
      )}
    </header>
  )
}
