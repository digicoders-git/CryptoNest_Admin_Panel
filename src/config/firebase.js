import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// FCM Token generate karo aur backend pe save karo
export const generateAndSaveFCMToken = async (authToken) => {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('⚠️ Notification permission denied');
      return null;
    }

    const fcmToken = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    });

    if (!fcmToken) {
      console.warn('⚠️ FCM token generate nahi hua');
      return null;
    }

    console.log('✅ FCM Token generated:', fcmToken);

    // Backend pe save karo
    const API_URL = import.meta.env.VITE_API_URL;
    await fetch(`${API_URL}api/SuperAdmin/fcm-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ fcmToken }),
    });

    localStorage.setItem('fcmToken', fcmToken);
    console.log('✅ FCM Token backend pe save ho gaya');
    return fcmToken;
  } catch (error) {
    console.error('❌ FCM Token error:', error.message);
    return null;
  }
};

// Foreground notifications handle karo
export const onForegroundMessage = (callback) => {
  return onMessage(messaging, (payload) => {
    console.log('🔔 Foreground notification:', payload);
    callback(payload);
  });
};

export default app;
