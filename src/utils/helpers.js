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
