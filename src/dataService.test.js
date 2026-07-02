import { describe, it, expect, beforeEach, vi } from 'vitest'

// Replace the real Supabase client with the in-memory mock
vi.mock('./lib/supabase', async () => {
  const mod = await import('./test/mockSupabase.js')
  return { supabase: mod.supabase }
})

import { _db, _reset } from './test/mockSupabase.js'
import * as Board from './dataService.js'

// Always a future date, so tests stay valid regardless of when they run
// (applyToPost now rejects posts whose week_commencing has already passed).
function futureWeekCommencing() {
  const d = new Date()
  d.setDate(d.getDate() + 14)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function seedProfiles() {
  _db.profiles.push(
    { id: 'u-paul', full_name: 'Paul Kwon', employee_id: '101' },
    { id: 'u-john', full_name: 'John Smith', employee_id: '102' },
    { id: 'u-mike', full_name: 'Mike Lee', employee_id: '103' },
  )
}

beforeEach(() => { _reset(); seedProfiles() })

describe('createPost', () => {
  it('creates an open post and notifies everyone except the author', async () => {
    const post = await Board.createPost({ dutyNumber: 'BT100', weekCommencing: futureWeekCommencing(), weekType: 'mon-fri', note: '', authorId: 'u-paul' })
    expect(post.status).toBe('open')
    const newPost = _db.notifications.filter(n => n.type === 'new_post')
    expect(newPost.length).toBe(2)
    expect(newPost.some(n => n.user_id === 'u-paul')).toBe(false)
  })
})

describe('applyToPost', () => {
  let post
  beforeEach(async () => { post = await Board.createPost({ dutyNumber: 'BT100', weekCommencing: futureWeekCommencing(), weekType: 'mon-fri', note: '', authorId: 'u-paul' }) })

  it('records an application and notifies the owner', async () => {
    await Board.applyToPost(post.id, 'u-john', 'BT149')
    expect(_db.applicants.length).toBe(1)
    expect(_db.notifications.some(n => n.type === 'new_applicant' && n.user_id === 'u-paul')).toBe(true)
  })

  it('blocks a duplicate application from the same user', async () => {
    await Board.applyToPost(post.id, 'u-john', 'BT149')
    let blocked = false
    try { await Board.applyToPost(post.id, 'u-john', 'BT149') } catch { blocked = true }
    expect(blocked).toBe(true)
    expect(_db.applicants.length).toBe(1)
  })

  it('allows re-applying after withdrawal', async () => {
    await Board.applyToPost(post.id, 'u-john', 'BT149')
    const app = _db.applicants.find(a => a.applicant_id === 'u-john')
    await Board.withdrawApplication(app.id)
    expect(_db.applicants.length).toBe(0)
    await Board.applyToPost(post.id, 'u-john', 'BT149')
    expect(_db.applicants.length).toBe(1)
  })

  it('rejects applying to a closed post even if the UI is stale', async () => {
    await Board.closePost(post.id)
    let blocked = false
    try { await Board.applyToPost(post.id, 'u-john', 'BT149') } catch { blocked = true }
    expect(blocked).toBe(true)
    expect(_db.applicants.length).toBe(0)
  })
})

describe('acceptApplicant (atomic)', () => {
  it('accepts one, rejects others, closes the post, and notifies all', async () => {
    const post = await Board.createPost({ dutyNumber: 'BT100', weekCommencing: futureWeekCommencing(), weekType: 'mon-fri', note: '', authorId: 'u-paul' })
    await Board.applyToPost(post.id, 'u-john', 'BT149')
    await Board.applyToPost(post.id, 'u-mike', 'Spare')
    const mike = _db.applicants.find(a => a.applicant_id === 'u-mike')
    await Board.acceptApplicant(mike.id, post.id)

    expect(_db.applicants.find(a => a.applicant_id === 'u-mike').status).toBe('accepted')
    expect(_db.applicants.find(a => a.applicant_id === 'u-john').status).toBe('rejected')
    expect(_db.posts.find(p => p.id === post.id).status).toBe('closed')
    expect(_db.notifications.some(n => n.type === 'accepted' && n.user_id === 'u-mike')).toBe(true)
    expect(_db.notifications.some(n => n.type === 'rejected' && n.user_id === 'u-john')).toBe(true)
  })
})

describe('fetchPosts filter & notifications', () => {
  it('filters open vs closed', async () => {
    const p = await Board.createPost({ dutyNumber: 'BT100', weekCommencing: futureWeekCommencing(), weekType: 'mon-fri', note: '', authorId: 'u-paul' })
    await Board.closePost(p.id)
    expect((await Board.fetchPosts('open')).length).toBe(0)
    expect((await Board.fetchPosts('closed')).length).toBe(1)
  })

  it('tracks unread count and clears on mark-read', async () => {
    const post = await Board.createPost({ dutyNumber: 'BT100', weekCommencing: futureWeekCommencing(), weekType: 'mon-fri', note: '', authorId: 'u-paul' })
    await Board.applyToPost(post.id, 'u-john', 'BT149')
    expect(await Board.fetchUnreadCount('u-paul')).toBeGreaterThan(0)
    await Board.markAllNotificationsRead('u-paul')
    expect(await Board.fetchUnreadCount('u-paul')).toBe(0)
  })
})
