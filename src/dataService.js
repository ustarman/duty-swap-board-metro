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
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      profiles:author_id (full_name, employee_id),
      applicants (
        id, status, created_at,
        profiles:applicant_id (full_name, employee_id)
      )
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
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
export async function applyToPost(postId, applicantId) {
  const { error } = await supabase
    .from('applicants')
    .insert({ post_id: postId, applicant_id: applicantId })

  if (error) throw error
}

export async function acceptApplicant(applicantId, postId) {
  // Accept selected applicant
  const { error: e1 } = await supabase
    .from('applicants')
    .update({ status: 'accepted' })
    .eq('id', applicantId)

  if (e1) throw e1

  // Reject all others on this post
  const { error: e2 } = await supabase
    .from('applicants')
    .update({ status: 'rejected' })
    .eq('post_id', postId)
    .neq('id', applicantId)

  if (e2) throw e2

  // Close the post
  await closePost(postId)
}
