import { supabase } from './lib/supabase'

// Posts
export async function fetchPosts(status = null) {
  let query = supabase
    .from('posts')
    .select(`
      *,
      profiles:author_id (full_name, employee_id),
      applicants (count)
    `)
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function fetchPost(id) {
  const [{ data, error }, { data: countData }] = await Promise.all([
    supabase
      .from('posts')
      .select(`
        *,
        profiles:author_id (full_name, employee_id),
        applicants (
          id, applicant_id, status, created_at, duty_number,
          profiles:applicant_id (full_name, employee_id)
        )
      `)
      .eq('id', id)
      .single(),
    supabase.rpc('get_post_applicant_count', { p_post_id: id }),
  ])

  if (error) throw error
  return { ...data, applicantCount: countData ?? 0 }
}

export async function withdrawApplication(applicationId) {
  const { error } = await supabase
    .from('applicants')
    .delete()
    .eq('id', applicationId)
  if (error) throw error
}

export async function createPost({ dutyNumber, weekCommencing, weekType, note, authorId }) {
  const { data, error } = await supabase
    .from('posts')
    .insert({
      duty_number: dutyNumber,
      week_commencing: weekCommencing,
      week_type: weekType,
      note: note || null,
      author_id: authorId,
    })
    .select()
    .single()

  if (error) throw error

  // Notify all other users about the new post
  try {
    const [{ data: others }, { data: authorProfile }] = await Promise.all([
      supabase.from('profiles').select('id').neq('id', authorId),
      supabase.from('profiles').select('full_name').eq('id', authorId).single(),
    ])
    if (others?.length) {
      const posterName = authorProfile?.full_name || 'Someone'
      const notifications = others.map(p => ({
        user_id: p.id,
        type: 'new_post',
        message: `${posterName} posted a new swap: ${data.duty_number} (w/c ${data.week_commencing})`,
        post_id: data.id,
      }))
      await supabase.from('notifications').insert(notifications)
      notifications.forEach(record => {
        supabase.functions.invoke('send-push', { body: { record } }).catch(() => {})
      })
    }
  } catch { /* notification failure should not block posting */ }

  return data
}

export async function closePost(postId) {
  const { error } = await supabase
    .from('posts')
    .update({ status: 'closed' })
    .eq('id', postId)

  if (error) throw error
}

// Applicants
export async function applyToPost(postId, applicantId, dutyNumber = '') {
  const { error } = await supabase
    .from('applicants')
    .insert({ post_id: postId, applicant_id: applicantId, duty_number: dutyNumber || null })

  if (error) throw error

  // Notify post owner
  try {
    const [{ data: post }, { data: applicantProfile }] = await Promise.all([
      supabase.from('posts').select('author_id, duty_number').eq('id', postId).single(),
      supabase.from('profiles').select('full_name').eq('id', applicantId).single(),
    ])
    if (post && applicantProfile) {
      const record = {
        user_id: post.author_id,
        type: 'new_applicant',
        message: `${applicantProfile.full_name} applied for your duty swap (${post.duty_number})`,
        post_id: postId,
      }
      await supabase.from('notifications').insert(record)
      supabase.functions.invoke('send-push', { body: { record } }).catch(() => {})
    }
  } catch { /* notification failure should not block apply */ }
}

export async function acceptApplicant(applicantId, postId) {
  // Get post + all applicants before updating
  const [{ data: post }, { data: applicants }] = await Promise.all([
    supabase.from('posts').select('duty_number').eq('id', postId).single(),
    supabase.from('applicants').select('id, applicant_id').eq('post_id', postId),
  ])

  // Accept + reject others + close post — single atomic transaction (DB function)
  const { error: txError } = await supabase.rpc('accept_applicant_tx', {
    p_applicant_id: applicantId,
    p_post_id: postId,
  })
  if (txError) throw txError

  // Notify all applicants
  try {
    if (post && applicants && applicants.length > 0) {
      const notifications = applicants.map(a => ({
        user_id: a.applicant_id,
        type: a.id === applicantId ? 'accepted' : 'rejected',
        message: a.id === applicantId
          ? `Your application for duty swap (${post.duty_number}) was accepted! Proceed to submit the Duty Swap form.`
          : `Your application for duty swap (${post.duty_number}) was not selected this time.`,
        post_id: postId,
      }))
      await supabase.from('notifications').insert(notifications)
      // Send push to each applicant
      notifications.forEach(record => {
        supabase.functions.invoke('send-push', { body: { record } }).catch(() => {})
      })
    }
  } catch { /* notification failure should not block accept */ }
}

// Notifications
export async function fetchNotifications(userId) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw error
  return data || []
}

export async function fetchUnreadCount(userId) {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false)

  if (error) throw error
  return count || 0
}

export async function markAllNotificationsRead(userId) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false)

  if (error) throw error
}
