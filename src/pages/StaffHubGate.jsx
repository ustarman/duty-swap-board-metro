import { useEffect } from 'react'
import Header from '../components/Header'
import { AP_RED } from '../theme'

const STAFF_HUB_URL = 'https://leave-application-p66.vercel.app/'

// Swap Board is only reachable through Staff Hub. Any direct visit without a
// session (e.g. an old QR code) is sent straight to the Staff Hub login.
export default function StaffHubGate() {
  useEffect(() => {
    window.location.replace(STAFF_HUB_URL)
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100svh', background: 'var(--app-bg)' }}>
      <Header />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: 'var(--subtext-color)' }}>Redirecting to Staff Hub…</p>
          <a href={STAFF_HUB_URL} style={{ fontSize: 13, color: AP_RED, fontWeight: 700 }}>
            Tap here if you are not redirected
          </a>
        </div>
      </div>
    </div>
  )
}
