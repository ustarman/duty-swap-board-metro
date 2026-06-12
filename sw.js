self.addEventListener('push', event => {
  if (!event.data) return
  const data = event.data.json()

  const tasks = [
    self.registration.showNotification(data.title || 'Duty Swap Board', {
      body: data.body,
      icon: '/duty-swap-board-metro/icon-192.png',
      badge: '/duty-swap-board-metro/badge-72.png',
      data: { url: data.url || '/duty-swap-board-metro/' },
      tag: 'duty-swap',
      renotify: true,
    }),
  ]

  // App icon badge (iOS 16.4+ home-screen PWA, Android Chrome)
  if (navigator.setAppBadge && data.badge) {
    tasks.push(navigator.setAppBadge(data.badge).catch(() => {}))
  }

  event.waitUntil(Promise.all(tasks))
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  const url = event.notification.data?.url || '/duty-swap-board-metro/'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (const client of windowClients) {
        if ('focus' in client) {
          client.focus()
          client.navigate(url)
          return
        }
      }
      return clients.openWindow(url)
    })
  )
})
