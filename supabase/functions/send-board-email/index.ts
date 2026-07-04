// Edge Function: send-board-email
// Sends Swap Board notification emails via Brevo.
// Recipients are passed as auth user IDs; the function resolves each user's
// personal login email server-side (service role) — the client never sees emails.
// Secrets required: BREVO_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
// NOTE: This file is a backup of the deployed function. If you edit it here,
// you must re-deploy via `supabase functions deploy send-board-email`.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Resolve auth user IDs -> personal login emails via the service role.
async function resolveEmails(userIds: string[]): Promise<string[]> {
  const ids = [...new Set((userIds || []).filter(Boolean))]
  if (ids.length === 0) return []
  const admin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )
  const emails: string[] = []
  await Promise.all(ids.map(async (id) => {
    const { data, error } = await admin.auth.admin.getUserById(id)
    if (!error && data?.user?.email) emails.push(data.user.email)
  }))
  return emails
}

const SENDER = { name: 'Swap Board – Brisbane Transport', email: 'heycomeon@gmail.com' }

const WEEK_TYPE_LABEL: Record<string, string> = {
  'sunday': 'Sunday Only',
  'sun-fri': 'Sunday to Friday',
  'mon-fri': 'Monday to Friday',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { type, post, recipientUserIds, applicantName, applicantDutyNumber, applicantStartTime } = await req.json()
    const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY')

    if (!BREVO_API_KEY) {
      return new Response(JSON.stringify({ error: 'BREVO_API_KEY not set' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const emails = await resolveEmails(recipientUserIds || [])
    if (emails.length === 0) {
      return new Response(JSON.stringify({ success: true, sent: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const boardUrl = post?.id
      ? `https://ustarman.github.io/duty-swap-board-metro/post/${post.id}`
      : 'https://ustarman.github.io/duty-swap-board-metro/'
    const weekType = WEEK_TYPE_LABEL[post?.week_type] || post?.week_type || ''

    let subject = ''
    let html = ''

    if (type === 'new_post') {
      subject = `New Duty Swap Posted: ${post.duty_number} (w/c ${post.week_commencing})`
      html = '<p>Hi Team,</p><p>A new duty swap / Sunday giveaway request has been posted on the Swap Board.</p>'
      html += '<p><strong>Duty:</strong> ' + post.duty_number + '<br/>'
      html += '<strong>Week Commencing:</strong> ' + post.week_commencing + '<br/>'
      if (post.start_time) html += '<strong>Start Time:</strong> ' + post.start_time + '<br/>'
      html += '<strong>Days to Swap:</strong> ' + weekType + '</p>'
      if (post.note) html += '<p><strong>Note:</strong> ' + post.note + '</p>'
      html += '<p><a href="' + boardUrl + '">Click here to view and apply</a></p>'
      html += '<p>Regards,<br/>Swap Board – Brisbane Transport</p>'
    } else if (type === 'new_applicant') {
      subject = `New Applicant for Your Swap: ${post.duty_number}`
      html = '<p>Hi,</p><p><strong>' + (applicantName || 'Someone') + '</strong> has applied for your duty swap request.</p>'
      html += '<p><strong>Your Duty:</strong> ' + post.duty_number + '<br/>'
      if (applicantDutyNumber) html += '<strong>Applicant\'s Duty:</strong> ' + applicantDutyNumber + '<br/>'
      if (applicantStartTime) html += '<strong>Applicant\'s Start Time:</strong> ' + applicantStartTime + '<br/>'
      html += '<strong>Week Commencing:</strong> ' + post.week_commencing + '</p>'
      html += '<p><a href="' + boardUrl + '">Click here to review the applicant</a></p>'
      html += '<p>Regards,<br/>Swap Board – Brisbane Transport</p>'
    } else {
      return new Response(JSON.stringify({ error: 'Unknown email type' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const results = await Promise.allSettled(emails.map(async (email: string) => {
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'api-key': BREVO_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: SENDER,
          to: [{ email }],
          subject,
          htmlContent: html,
        }),
      })
      if (!res.ok) {
        const detail = await res.text()
        throw new Error(`Brevo ${res.status}: ${detail}`)
      }
      return true
    }))

    const sent = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected')
    const errors = failed.map(f => (f as PromiseRejectedResult).reason?.message || 'unknown')
    return new Response(JSON.stringify({ success: failed.length === 0, sent, failed: failed.length, errors }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
