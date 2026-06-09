import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../components/Header'
import SectionDivider from '../components/SectionDivider'
import { useAuth } from '../context/AuthContext'
import { fetchPost, applyToPost, acceptApplicant } from '../dataService'
import { AP_RED, CARD, BTN_PRIMARY, FIELD_LABEL } from '../theme'

const WEEK_TYPE_LABEL = {
  'sunday': 'Sunday Only',
  'sun-fri': 'Sun to Fri',
  'mon-fri': 'Mon to Fri',
}

function Avatar({ name = '?' }) {
  return (
    <div style={{
      width: 36, height: 36, borderRadius: '50%',
      background: '#EFF6FF', color: '#1D4ED8',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 14, fontWeight: 700, flexShrink: 0,
    }}>
      {name[0]}
    </div>
  )
}

export default function PostDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { user } = useAuth()

  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [applying, setApplying] = useState(false)

  useEffect(() => { loadPost() }, [id])

  async function loadPost() {
    setLoading(true)
    try {
      const data = await fetchPost(id)
      setPost(data)
    } catch {
      setError('Failed to load post.')
    } finally {
      setLoading(false)
    }
  }

  const isOwner = post?.author_id === user?.id
  const hasApplied = post?.applicants?.some(a => a.applicant_id === user?.id)
  const hasAccepted = post?.applicants?.some(a => a.status === 'accepted')
  const myApplication = post?.applicants?.find(a => a.applicant_id === user?.id)

  const handleApply = async () => {
    if (!confirm('Apply for this swap request?')) return
    setApplying(true)
    try {
      await applyToPost(post.id, user.id)
      await loadPost()
    } catch (err) {
      alert(err.message || 'Failed to apply.')
    } finally {
      setApplying(false)
    }
  }

  const handleAccept = async (applicant) => {
    if (!confirm(`Accept ${applicant.profiles?.full_name} and proceed with the Duty Swap?`)) return
    try {
      await acceptApplicant(applicant.id, post.id)
      await loadPost()
    } catch (err) {
      alert(err.message || 'Failed to accept.')
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100svh', background: 'var(--app-bg)' }}>
      <Header />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--subtext-color)', fontSize: 14 }}>
        Loading...
      </div>
    </div>
  )

  if (error || !post) return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100svh', background: 'var(--app-bg)' }}>
      <Header />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: AP_RED, fontSize: 14 }}>
        {error || 'Post not found.'}
      </div>
    </div>
  )

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
        <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-color)' }}>Swap Request Detail</span>
      </div>

      <div style={{ flex: 1, padding: '1rem', paddingBottom: '2rem' }}>

        {/* Post info */}
        <div style={CARD}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Avatar name={post.profiles?.full_name} />
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-color)' }}>{post.profiles?.full_name}</p>
                <p style={{ fontSize: 11, color: 'var(--subtext-color)' }}>Posted {post.created_at?.slice(0, 10)}</p>
              </div>
            </div>
            <span style={{
              fontSize: 10, fontWeight: 700,
              background: post.status === 'open' ? '#F0FDF4' : 'var(--input-bg)',
              color: post.status === 'open' ? '#15803D' : 'var(--subtext-color)',
              border: `1px solid ${post.status === 'open' ? '#BBF7D0' : 'var(--card-border)'}`,
              padding: '3px 10px', borderRadius: 20,
            }}>
              {post.status === 'open' ? 'OPEN' : 'CLOSED'}
            </span>
          </div>

          <div style={{ marginBottom: 10 }}>
            <span style={{ fontSize: 11, color: 'var(--subtext-color)', fontWeight: 600, display: 'block', marginBottom: 4 }}>DUTY</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: AP_RED, letterSpacing: '0.5px' }}>
                {post.duty_number}
              </span>
              <span style={{
                fontSize: 12, fontWeight: 600,
                background: 'var(--input-bg)', color: 'var(--label-color)',
                padding: '3px 10px', borderRadius: 20,
                border: '1px solid var(--card-border)',
              }}>
                {WEEK_TYPE_LABEL[post.week_type]}
              </span>
            </div>
          </div>

          <div style={{ marginBottom: post.note ? 12 : 0 }}>
            <span style={{ fontSize: 11, color: 'var(--subtext-color)', fontWeight: 600, display: 'block', marginBottom: 2 }}>WEEK COMMENCING</span>
            <span style={{ fontSize: 14, color: 'var(--text-color)', fontWeight: 500 }}>{post.week_commencing}</span>
          </div>

          {post.note && (
            <div style={{
              background: 'var(--input-bg)', border: '1px solid var(--card-border)',
              borderRadius: 8, padding: '10px 12px',
              fontSize: 13, color: 'var(--subtext-color)', lineHeight: 1.5,
            }}>
              {post.note}
            </div>
          )}
        </div>

        {/* Applicants — owner only */}
        {isOwner && (
          <>
            <SectionDivider title={`Applicants (${post.applicants?.length ?? 0})`} />
            <div style={CARD}>
              {post.applicants?.length === 0 && (
                <p style={{ fontSize: 13, color: 'var(--subtext-color)', textAlign: 'center', padding: '1rem 0' }}>
                  No applicants yet
                </p>
              )}
              {post.applicants?.map((a, i) => (
                <div key={a.id}>
                  {i > 0 && <div style={{ height: 1, background: 'var(--divider-color)', margin: '12px 0' }} />}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={a.profiles?.full_name} />
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-color)' }}>{a.profiles?.full_name}</p>
                        <p style={{ fontSize: 11, color: 'var(--subtext-color)' }}>{a.created_at?.slice(0, 10)}</p>
                      </div>
                    </div>
                    <div>
                      {a.status === 'accepted' && (
                        <span style={{ fontSize: 12, fontWeight: 700, background: '#F0FDF4', color: '#15803D', padding: '4px 10px', borderRadius: 20, border: '1px solid #BBF7D0' }}>
                          Accepted
                        </span>
                      )}
                      {a.status === 'rejected' && (
                        <span style={{ fontSize: 12, color: 'var(--subtext-color)', padding: '4px 10px', borderRadius: 20, background: 'var(--input-bg)', border: '1px solid var(--card-border)' }}>
                          Not selected
                        </span>
                      )}
                      {a.status === 'pending' && !hasAccepted && (
                        <button
                          onClick={() => handleAccept(a)}
                          style={{
                            background: AP_RED, color: 'white', border: 'none',
                            borderRadius: 8, padding: '6px 14px',
                            fontSize: 13, fontWeight: 700, cursor: 'pointer',
                          }}
                        >
                          Accept
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Apply — non-owner */}
        {!isOwner && post.status === 'open' && (
          <div style={{ marginTop: '1rem' }}>
            {hasApplied ? (
              <div style={{ ...CARD, textAlign: 'center', padding: '1.25rem', marginBottom: 0 }}>
                {myApplication?.status === 'accepted' ? (
                  <>
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#15803D', marginBottom: 4 }}>✓ Your application was accepted!</p>
                    <p style={{ fontSize: 12, color: 'var(--subtext-color)' }}>Proceed to submit the Duty Swap form.</p>
                  </>
                ) : myApplication?.status === 'rejected' ? (
                  <>
                    <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--subtext-color)', marginBottom: 4 }}>Not selected this time</p>
                    <p style={{ fontSize: 12, color: 'var(--subtext-color)' }}>The poster selected another applicant.</p>
                  </>
                ) : (
                  <>
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#15803D', marginBottom: 4 }}>✓ Application Submitted</p>
                    <p style={{ fontSize: 12, color: 'var(--subtext-color)' }}>You'll be notified when the poster responds.</p>
                  </>
                )}
              </div>
            ) : (
              <button onClick={handleApply} disabled={applying} style={{ ...BTN_PRIMARY, opacity: applying ? 0.6 : 1 }}>
                {applying ? 'Applying...' : 'Apply for This Swap'}
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
