import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import InputBox from '../components/InputBox'
import { AP_RED, CARD, BTN_PRIMARY, INPUT_STYLE, INPUT_LABEL, FIELD_LABEL } from '../theme'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [form, setForm] = useState({
    fullName: '',
    employeeId: '',
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const set = field => e => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async () => {
    setError('')
    if (!form.email.trim()) { setError('Email is required'); return }
    if (!form.password) { setError('Password is required'); return }
    if (mode === 'signup') {
      if (!form.fullName.trim()) { setError('Full name is required'); return }
      if (!form.employeeId.trim()) { setError('Employee ID is required'); return }
    }

    setSubmitting(true)
    try {
      if (mode === 'login') {
        await signIn(form.email, form.password)
        navigate('/')
      } else {
        await signUp(form.email, form.password, form.fullName, form.employeeId)
        setSuccess('Account created successfully! Please sign in.')
        setMode('login')
        setForm(prev => ({ ...prev, fullName: '', employeeId: '', password: '' }))
        setSubmitting(false)
      }
    } catch (err) {
      const msg = err.message || ''
      if (msg.includes('Email not confirmed')) {
        setError('Please confirm your email before signing in. Check your inbox.')
      } else if (msg.includes('Invalid login credentials')) {
        setError('Incorrect email or password.')
      } else if (msg.includes('User already registered')) {
        setError('An account with this email already exists.')
      } else {
        setError(msg || 'Something went wrong. Please try again.')
      }
      setSubmitting(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100svh', background: 'var(--app-bg)' }}>

      {/* Header */}
      <div style={{
        background: AP_RED,
        padding: '2rem 1.25rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
      }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
          stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 16V4m0 0L3 8m4-4l4 4" />
          <path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
        </svg>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'white', margin: 0 }}>Duty Swap Board</h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>Brisbane Transport</p>
        </div>
      </div>

      {/* Mode toggle */}
      <div style={{
        display: 'flex',
        background: 'var(--tab-bg)',
        borderBottom: '1px solid var(--tab-border)',
      }}>
        {[
          { key: 'login', label: 'Sign In' },
          { key: 'signup', label: 'Create Account' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => { setMode(tab.key); setError(''); setSuccess('') }}
            style={{
              flex: 1,
              padding: '12px 0',
              fontSize: 13,
              fontWeight: 600,
              border: 'none',
              background: 'transparent',
              color: mode === tab.key ? AP_RED : 'var(--tab-color)',
              borderBottom: `2px solid ${mode === tab.key ? AP_RED : 'transparent'}`,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, padding: '1.25rem', paddingBottom: '2rem' }}>
        <div style={CARD}>

          {/* Sign up only fields */}
          {mode === 'signup' && (
            <>
              <div style={{ marginBottom: '0.75rem' }}>
                <span style={FIELD_LABEL}>Full Name</span>
                <InputBox>
                  <span style={INPUT_LABEL}>NAME</span>
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={set('fullName')}
                    placeholder="e.g. John Smith"
                    style={INPUT_STYLE}
                  />
                </InputBox>
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <span style={FIELD_LABEL}>Employee ID</span>
                <InputBox>
                  <span style={INPUT_LABEL}>ID NO.</span>
                  <input
                    type="text"
                    value={form.employeeId}
                    onChange={set('employeeId')}
                    placeholder="e.g. EMP0042"
                    style={INPUT_STYLE}
                  />
                </InputBox>
              </div>
            </>
          )}

          {/* Common fields */}
          <div style={{ marginBottom: '0.75rem' }}>
            <span style={FIELD_LABEL}>Email</span>
            <InputBox>
              <span style={INPUT_LABEL}>EMAIL</span>
              <input
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="e.g. john@example.com"
                style={INPUT_STYLE}
                autoCapitalize="none"
              />
            </InputBox>
          </div>

          <div>
            <span style={FIELD_LABEL}>Password</span>
            <InputBox>
              <span style={INPUT_LABEL}>PASSWORD</span>
              <input
                type="password"
                value={form.password}
                onChange={set('password')}
                placeholder="••••••••"
                style={INPUT_STYLE}
              />
            </InputBox>
          </div>
        </div>

        {success && (
          <div style={{
            background: '#F0FDF4',
            border: '1px solid #BBF7D0',
            borderRadius: 8,
            padding: '10px 14px',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <span style={{ fontSize: 16 }}>✓</span>
            <p style={{ color: '#15803D', fontSize: 13, fontWeight: 600 }}>{success}</p>
          </div>
        )}

        {error && (
          <p style={{ color: AP_RED, fontSize: 13, fontWeight: 700, textAlign: 'center', marginBottom: '1rem' }}>
            {error}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{ ...BTN_PRIMARY, opacity: submitting ? 0.6 : 1 }}
        >
          {submitting
            ? (mode === 'login' ? 'Signing in...' : 'Creating account...')
            : (mode === 'login' ? 'Sign In' : 'Create Account')}
        </button>
      </div>
    </div>
  )
}
