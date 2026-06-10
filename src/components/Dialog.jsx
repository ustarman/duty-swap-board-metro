import { AP_RED } from '../theme'

export default function Dialog({ dialog, onConfirm, onCancel }) {
  if (!dialog) return null

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: '1.5rem',
    }}>
      <div style={{
        background: 'var(--card-bg)',
        borderRadius: 18,
        padding: '1.5rem',
        width: '100%',
        maxWidth: 300,
        boxShadow: '0 24px 60px rgba(0,0,0,0.25)',
      }}>
        {dialog.title && (
          <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-color)', marginBottom: 8, textAlign: 'center' }}>
            {dialog.title}
          </p>
        )}
        <p style={{
          fontSize: 14, color: 'var(--text-color)',
          lineHeight: 1.55, marginBottom: '1.5rem', textAlign: 'center',
        }}>
          {dialog.message}
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          {dialog.type === 'confirm' && (
            <button
              onClick={onCancel}
              style={{
                flex: 1, padding: '12px',
                border: '1.5px solid var(--card-border)',
                borderRadius: 10, background: 'transparent',
                color: 'var(--text-color)', fontSize: 14, fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          )}
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: '12px',
              border: 'none', borderRadius: 10,
              background: AP_RED,
              color: 'white', fontSize: 14, fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {dialog.confirmLabel || 'OK'}
          </button>
        </div>
      </div>
    </div>
  )
}
