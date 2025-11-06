// Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

let messaging;

// Fetch Firebase config from API endpoint and initialize
fetch('/api/firebase-config')
  .then(response => response.json())
  .then(firebaseConfig => {
    if (firebaseConfig.error) {
      console.error('Firebase not configured:', firebaseConfig.message);
      return;
    }

    firebase.initializeApp(firebaseConfig);
    messaging = firebase.messaging();

    console.log('Firebase initialized in service worker');

    // Handle background messages
    messaging.onBackgroundMessage((payload) => {
      console.log('Received background message:', payload);

      const notificationTitle = payload.notification?.title || 'Unity Oracle Alert';
      const notificationOptions = {
        body: payload.notification?.body || 'New market update available',
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: payload.data?.tag || 'unity-oracle-notification',
        data: payload.data,
        requireInteraction: true,
        actions: [
          {
            action: 'view',
            title: 'View Details'
          },
          {
            action: 'dismiss',
            title: 'Dismiss'
          }
        ]
      };

      self.registration.showNotification(notificationTitle, notificationOptions);
    });
  })
  .catch(error => {
    console.error('Failed to fetch Firebase config:', error);
  });

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received:', event);

  event.notification.close();

  if (event.action === 'view') {
    // Open the app and navigate to relevant page
    event.waitUntil(
      clients.openWindow('/tools/oracle-alerts')
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
