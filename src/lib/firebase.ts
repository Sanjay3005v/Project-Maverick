import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  projectId: 'maverick-mindset',
  appId: '1:665279059483:web:30c9b43bc43a0a69018abe',
  storageBucket: 'maverick-mindset.firebasestorage.app',
  apiKey: 'AIzaSyAWFXe2Tf5E4q9el9JYfhg3GrAYxS8SLI0',
  authDomain: 'maverick-mindset.firebaseapp.com',
  measurementId: '',
  messagingSenderId: '665279059483',
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
