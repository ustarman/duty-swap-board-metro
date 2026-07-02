// Format a date as dd/mm/yyyy using LOCAL date components.
// - "2026-06-21" (date-only string) → parsed as local midnight (no UTC shift)
// - ISO timestamp (e.g. created_at) → converted to local date
export function formatDate(value) {
  if (!value) return '—'
  let date
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number)
    date = new Date(year, month - 1, day)
  } else {
    date = new Date(value)
  }
  if (isNaN(date.getTime())) return '—'
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const yyyy = date.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

// A post is "expired" if it's still open but its start date (week_commencing)
// has already passed — no applicant was accepted before the duty started.
export function isExpired(post) {
  if (!post || post.status !== 'open' || !post.week_commencing) return false
  const [year, month, day] = post.week_commencing.split('-').map(Number)
  const weekCommencing = new Date(year, month - 1, day)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return weekCommencing < today
}
