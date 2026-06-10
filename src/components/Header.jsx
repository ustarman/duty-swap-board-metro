import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { AP_RED } from '../theme'

export default function Header({ badge = 'Board' }) {
  const { signOut } = useAuth()
  const navigate = useNavigate()

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
      {badge && (
        <span
          style={{
            fontSize: 11,
            color: 'white',
            border: '1px solid rgba(255,255,255,0.7)',
            borderRadius: 4,
            padding: '2px 8px',
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {badge}
        </span>
      )}
      <button
        onClick={handleSignOut}
        style={{
          background: 'rgba(255,255,255,0.15)',
          border: '1px solid rgba(255,255,255,0.5)',
          borderRadius: 6,
          color: 'white',
          fontSize: 11,
          fontWeight: 600,
          padding: '4px 10px',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        Sign Out
      </button>
    </header>
  )
}
