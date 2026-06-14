import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import Header from '../components/Header'
import InputBox from '../components/InputBox'
import SectionDivider from '../components/SectionDivider'
import { useAuth } from '../context/AuthContext'
import { createPost } from '../dataService'
import { AP_RED, CARD, BTN_PRIMARY, INPUT_STYLE, INPUT_LABEL, FIELD_LABEL } from '../theme'

const WEEK_TYPES = [
  { label: 'Sunday Only', value: 'sunday' },
  { label: 'Sun to Fri', value: 'sun-fri' },
  { label: 'Mon to Fri', value: 'mon-fri' },
]

// Normalize a duty number: trim, uppercase, add "BT" prefix to bare numbers.
// "100" -> "BT100", "bt100" -> "BT100", "rdo" -> "RDO"
function normalizeDuty(value) {
  const v = (value || '').trim().toUpperCase()
  if (/^\d+$/.test(v)) return 'BT' + v
  return v
}

export default function PostNew() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [form, setForm] = useState({
    weekCommencing: null,
    dutyNumber: '',
    weekType: null,
    note: '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    setError('')
    if (!form.weekCommencing) { setError('Week Commencing date is required'); return }
    if (!form.dutyNumber.trim()) { setError('Duty number is required'); return }
    if (!form.weekType) { setError('Please select the days you want to swap'); return }

    setSubmitting(true)
    try {
      await createPost({
        dutyNumber: normalizeDuty(form.dutyNumber),
        weekCommencing: `${form.weekCommencing.getFullYear()}-${String(form.weekCommencing.getMonth() + 1).padStart(2, '0')}-${String(form.weekCommencing.getDate()).padStart(2, '0')}`,
        weekType: form.weekType,
        note: form.note.trim(),
        authorId: user.id,
      })
      navigate('/')
    } catch (err) {
      setError(err.message || 'Failed to post. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100svh', background: 'var(--app-bg)' }}>
      <Header />

      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '12px 1rem',
        borderBottom: '1px solid var(--divider-color)',
        background: 'var(--card-bg)',
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--text-color)', padding: 0, lineHeight: 1 }}
        >
          ←
        </button>
        <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-color)' }}>Post Swap Request</span>
      </div>

      <div style={{ flex: 1, padding: '1rem', paddingBottom: '2rem' }}>

        <div style={CARD}>
          <div style={{ marginBottom: '0.75rem' }}>
            <span style={FIELD_LABEL}>Week Commencing</span>
            <InputBox>
              <span style={INPUT_LABEL}>DATE</span>
              <DatePicker
                selected={form.weekCommencing}
                onChange={date => setForm(prev => ({ ...prev, weekCommencing: date }))}
                calendarStartDay={0}
                dateFormat="dd/MM/yyyy"
                placeholderText="dd/mm/yyyy"
                customInput={
                  <input
                    readOnly
                    inputMode="none"
                    style={{ ...INPUT_STYLE, width: '100%', cursor: 'pointer' }}
                  />
                }
                withPortal
              />
            </InputBox>
          </div>

          <div>
            <span style={FIELD_LABEL}>My Duty Number</span>
            <InputBox>
              <span style={INPUT_LABEL}>DUTY NO.</span>
              <input
                type="text"
                value={form.dutyNumber}
                onChange={e => setForm({ ...form, dutyNumber: e.target.value.toUpperCase() })}
                placeholder="e.g. BT135"
                style={INPUT_STYLE}
              />
            </InputBox>
          </div>
        </div>

        <SectionDivider title="Days to Swap" />
        <div style={CARD}>
          <span style={{ fontSize: 12, color: 'var(--subtext-color)', display: 'block', marginBottom: 10 }}>
            Select which days of that duty week you want to swap
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {WEEK_TYPES.map(wt => {
              const active = form.weekType === wt.value
              return (
                <button
                  key={wt.value}
                  type="button"
                  onClick={() => setForm({ ...form, weekType: wt.value })}
                  style={{
                    padding: '10px 4px',
                    border: `1.5px solid ${active ? AP_RED : 'var(--tab-border)'}`,
                    borderRadius: 8,
                    background: active ? AP_RED : 'var(--tab-bg)',
                    color: active ? 'white' : 'var(--tab-color)',
                    fontSize: 12, fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.15s', lineHeight: 1.3,
                  }}
                >
                  {wt.label}
                </button>
              )
            })}
          </div>
        </div>

        <SectionDivider title="Additional Info" />
        <div style={CARD}>
          <span style={FIELD_LABEL}>
            Note <span style={{ fontWeight: 400, color: 'var(--subtext-color)' }}>(optional)</span>
          </span>
          <InputBox>
            <span style={INPUT_LABEL}>MESSAGE</span>
            <textarea
              value={form.note}
              onChange={e => setForm({ ...form, note: e.target.value })}
              placeholder="e.g. Available for any swap, prefer similar duty..."
              rows={3}
              style={{ ...INPUT_STYLE, resize: 'none', lineHeight: 1.5 }}
            />
          </InputBox>
        </div>

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
          {submitting ? 'Posting...' : 'Post Request'}
        </button>
      </div>
    </div>
  )
}
