import Header from '../components/Header'
import { AP_RED, CARD, BTN_PRIMARY } from '../theme'

const STAFF_HUB_URL = 'https://leave-application-p66.vercel.app/'

// Shown when Swap Board is opened directly without a session.
// Login now lives in Staff Hub (Leave Application); we send the user there.
export default function StaffHubGate() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100svh', background: 'var(--app-bg)' }}>
      <Header />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
        <div style={{ ...CARD, maxWidth: 340, textAlign: 'center' }}>
          <p style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-color)', marginBottom: 8 }}>
            Sign in through Staff Hub
          </p>
          <p style={{ fontSize: 13, color: 'var(--subtext-color)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
            Swap Board now uses your Staff Hub account. Open the Staff Hub, sign in,
            then tap the <strong style={{ color: AP_RED }}>Swap Board</strong> tile to come back here — no separate login needed.
          </p>
          <button
            onClick={() => { window.location.href = STAFF_HUB_URL }}
            style={{ ...BTN_PRIMARY }}
          >
            Open Staff Hub
          </button>
        </div>
      </div>
    </div>
  )
}
