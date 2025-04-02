// public/service-worker.js

self.addEventListener('push', (event) => {
  const options = {
    body: event.data.text(),
    icon: '/logo.webp',
    actions: [
      {
        action: 'open',
        title: 'Open Page',
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
      },
    ],
    data: { url: event.data.url }
  };

  event.waitUntil(
    self.registration.showNotification('Itask', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  if (event.action === 'open') {
    clients.openWindow(event.notification.data.url);
  } else if (event.action === 'dismiss') {
    event.notification.close(); 
  }
});
