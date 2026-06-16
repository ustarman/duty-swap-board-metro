import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { useAuth } from '../context/AuthContext'
import { fetchNotifications, markAllNotificationsRead } from '../dataService'
import { AP_RED, CARD } from '../theme'

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

const TYPE_CONFIG = {
  new_post: { icon: '📢', bg: '#FFF7ED' },
  new_applicant: { icon: '👤', bg: '#EFF6FF' },
  accepted: { icon: '✅', bg: '#F0FDF4' },
  rejected: { icon: '❌', bg: '#FEF2F2' },
}

export default function Notifications() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNotifications()
  }, [])

  async function loadNotifications() {
    try {
      const data = await fetchNotifications(user.id)
      setNotifications(data)
      await markAllNotificationsRead(user.id)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100svh', background: 'var(--app-bg)' }}>
      <Header />

      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '12px 1rem',
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--text-color)', padding: 0, lineHeight: 1 }}
        >
          ←
        </button>
        <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-color)' }}>Notifications</span>
      </div>

      <div style={{ flex: 1, padding: '1rem', paddingBottom: '2rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--subtext-color)', padding: '3rem', fontSize: 14 }}>
            Loading...
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🔔</div>
            <p style={{ fontSize: 14, color: 'var(--subtext-color)' }}>No notifications yet</p>
          </div>
        ) : (
          <div style={CARD}>
            {notifications.map((n, i) => {
              const config = TYPE_CONFIG[n.type] || { icon: '🔔', bg: '#F5F5F5' }
              return (
                <div key={n.id}>
                  {i > 0 && <div style={{ height: 1, background: 'var(--divider-color)', margin: '12px 0' }} />}
                  <div
                    onClick={() => n.post_id && navigate(`/post/${n.post_id}`)}
                    style={{
                      display: 'flex', gap: 12, alignItems: 'flex-start',
                      cursor: n.post_id ? 'pointer' : 'default',
                    }}
                  >
                    <div style={{
                      width: 38, height: 38, borderRadius: '50%',
                      background: config.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 17, flexShrink: 0,
                    }}>
                      {config.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: 13, color: 'var(--text-color)',
                        lineHeight: 1.45, marginBottom: 4,
                        fontWeight: n.is_read ? 400 : 600,
                      }}>
                        {n.message}
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--subtext-color)' }}>{timeAgo(n.created_at)}</p>
                    </div>
                    {!n.is_read && (
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: AP_RED, flexShrink: 0, marginTop: 6,
                      }} />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
