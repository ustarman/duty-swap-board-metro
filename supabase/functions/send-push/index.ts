import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import webpush from 'https://esm.sh/web-push@3.6.6'

serve(async (req: Request) => {
  try {
    const body = await req.json()
    const record = body.record

    if (!record) {
      return new Response('No record', { status: 400 })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user's push subscription
    const { data: subData } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', record.user_id)
      .single()

    if (!subData?.subscription) {
      return new Response('No subscription', { status: 200 })
    }

    webpush.setVapidDetails(
      'mailto:admin@brisbanetransport.com.au',
      Deno.env.get('VAPID_PUBLIC_KEY') ?? '',
      Deno.env.get('VAPID_PRIVATE_KEY') ?? ''
    )

    const type = record.type
    const title =
      type === 'new_post'      ? '📢 New Swap Posted'
      : type === 'new_applicant' ? '👤 New Applicant'
      : type === 'accepted'    ? '✅ Application Accepted'
      :                          '📋 Application Update'

    const url = record.post_id
      ? `https://ustarman.github.io/duty-swap-board-metro/post/${record.post_id}`
      : 'https://ustarman.github.io/duty-swap-board-metro/'

    // Unread count for app icon badge
    let badge = 0
    try {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', record.user_id)
        .eq('is_read', false)
      badge = count ?? 0
    } catch (_) { /* badge is optional */ }

    await webpush.sendNotification(
      subData.subscription,
      JSON.stringify({ title, body: record.message, url, badge })
    )

    return new Response('Push sent', { status: 200 })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
