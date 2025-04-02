// src/components/NotificationComponent.js

import React, { useEffect, useState } from 'react';
import logoImg from '../Assests/logo.webp';

const NotificationComponent = () => {
  const [permission, setPermission] = useState(Notification.permission);

  useEffect(() => {
    if (permission === 'default') {
      Notification.requestPermission().then(setPermission);
    }
  }, [permission]);

  const sendNotification = () => {
    if (permission === 'granted') {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification('Itask', {
          body: 'Click to visit our page 🚀',
          icon: logoImg,
          data: {
            url: window.location.href, // Use current page URL
          },
          actions: [
            { action: 'open', title: 'Open Page' },
            { action: 'dismiss', title: 'Dismiss' },
          ],
        });
      });
    } else {
      alert('Notification permission denied. Please allow it in browser settings.');
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      <h2>React Notification Example</h2>
      <button onClick={sendNotification} disabled={permission !== 'granted'}>
        Send Notification
      </button>
      {permission === 'default' && <p>Click "Allow" in the browser to enable notifications.</p>}
    </div>
  );
};

export default NotificationComponent;
