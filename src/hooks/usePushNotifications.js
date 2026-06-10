import { supabase } from '../lib/supabase'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export async function registerPushNotifications(userId) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('Push not supported')
    return
  }
  if (!VAPID_PUBLIC_KEY) {
    console.log('VAPID key missing')
    return
  }

  try {
    // Register service worker
    const reg = await navigator.serviceWorker.register(
      '/duty-swap-board-metro/sw.js',
      { scope: '/duty-swap-board-metro/' }
    )
    await navigator.serviceWorker.ready

    // Request permission
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return

    // Subscribe to push
    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    })

    // Save to Supabase
    await supabase.from('push_subscriptions').upsert(
      { user_id: userId, subscription: subscription.toJSON() },
      { onConflict: 'user_id' }
    )

    console.log('Push notifications registered')
  } catch (err) {
    console.error('Push registration failed:', err)
  }
}
