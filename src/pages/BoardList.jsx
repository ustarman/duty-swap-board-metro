import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { AP_RED, CARD } from '../theme'
import { fetchPosts } from '../dataService'
import { formatDate, isExpired } from '../utils/helpers'

const WEEK_TYPE_LABEL = {
  'sunday': 'Sunday Only',
  'sun-fri': 'Sun to Fri',
  'mon-fri': 'Mon to Fri',
}

const TABS = [
  { key: 'open', label: 'Open' },
  { key: 'closed', label: 'Closed' },
  { key: 'all', label: 'All' },
]

export default function BoardList() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('open')
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadPosts()
  }, [filter])

  async function loadPosts() {
    setLoading(true)
    setError('')
    try {
      if (filter === 'open') {
        const data = await fetchPosts('open')
        setPosts(data.filter(p => !isExpired(p)))
      } else if (filter === 'closed') {
        const [closed, open] = await Promise.all([fetchPosts('closed'), fetchPosts('open')])
        const expired = open.filter(isExpired)
        const merged = [...closed, ...expired].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        setPosts(merged)
      } else {
        const data = await fetchPosts(null)
        setPosts(data)
      }
    } catch (err) {
      setError('Failed to load posts.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100svh', background: 'var(--app-bg)' }}>
      <Header />

      {/* Filter tabs — segmented control */}
      <div style={{ padding: '12px 1rem 4px', flexShrink: 0 }}>
        <div style={{
          display: 'flex',
          background: 'var(--input-bg)',
          border: '0.5px solid var(--card-border)',
          borderRadius: 999,
          padding: 4,
          gap: 4,
        }}>
          {TABS.map(tab => {
            const active = filter === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  fontSize: 13,
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: 999,
                  background: active ? AP_RED : 'transparent',
                  color: active ? 'white' : 'var(--tab-color)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '1rem', paddingBottom: '5rem' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--subtext-color)', fontSize: 14 }}>
            Loading...
          </div>
        )}
        {error && (
          <p style={{ textAlign: 'center', padding: '3rem 0', color: AP_RED, fontSize: 13, fontWeight: 700 }}>
            {error}
          </p>
        )}
        {!loading && !error && posts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--subtext-color)', fontSize: 14 }}>
            No posts found
          </div>
        )}

        {posts.map(post => (
          <div
            key={post.id}
            onClick={() => navigate(`/post/${post.id}`)}
            style={{ ...CARD, cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-color)' }}>
                    {post.profiles?.full_name}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--subtext-color)' }}>
                    {formatDate(post.created_at)}
                  </span>
                  {post.status === 'closed' && (
                    <span style={{
                      fontSize: 10, fontWeight: 700,
                      background: 'var(--input-bg)', color: 'var(--subtext-color)',
                      padding: '2px 7px', borderRadius: 20,
                      border: '1px solid var(--card-border)',
                    }}>
                      CLOSED
                    </span>
                  )}
                  {isExpired(post) && (
                    <span style={{
                      fontSize: 10, fontWeight: 700,
                      background: 'var(--input-bg)', color: 'var(--subtext-color)',
                      padding: '2px 7px', borderRadius: 20,
                      border: '1px solid var(--card-border)',
                    }}>
                      EXPIRED
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: AP_RED, letterSpacing: '0.5px' }}>
                    {post.duty_number}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--subtext-color)' }}>·</span>
                  <span style={{ fontSize: 12, color: 'var(--subtext-color)' }}>
                    w/c {formatDate(post.week_commencing)}
                  </span>
                  {post.start_time && (
                    <>
                      <span style={{ fontSize: 11, color: 'var(--subtext-color)' }}>·</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-color)' }}>
                        {post.start_time}
                      </span>
                    </>
                  )}
                </div>

                <span style={{
                  fontSize: 11, fontWeight: 700,
                  background: AP_RED, color: 'white',
                  padding: '2px 8px', borderRadius: 20,
                  display: 'inline-block',
                  marginBottom: post.note ? 6 : 0,
                }}>
                  {WEEK_TYPE_LABEL[post.week_type]}
                </span>

                {post.note && (
                  <p style={{
                    fontSize: 12, color: 'var(--subtext-color)',
                    overflow: 'hidden', whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis', maxWidth: 200, marginTop: 4,
                  }}>
                    {post.note}
                  </p>
                )}
              </div>

              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <span style={{ fontSize: 11, color: 'var(--subtext-color)', display: 'block' }}>Applicants</span>
                <span style={{ fontSize: 22, fontWeight: 700, color: AP_RED }}>
                  {post.applicants?.[0]?.count ?? 0}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FAB */}
      <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem' }}>
        <button
          onClick={() => navigate('/post/new')}
          style={{
            background: AP_RED, color: 'white', border: 'none',
            borderRadius: 28, padding: '14px 20px',
            fontSize: 14, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(225,27,34,0.4)',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Post Request
        </button>
      </div>
    </div>
  )
}
