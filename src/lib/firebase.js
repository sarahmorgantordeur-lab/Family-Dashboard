// Version WEB — utilisée par Expo web build
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDTgJXKIiniEo8W7gGKDZzxSebegkBL-vc',
  authDomain: 'family-dashboard-9de62.firebaseapp.com',
  projectId: 'family-dashboard-9de62',
  storageBucket: 'family-dashboard-9de62.firebasestorage.app',
  messagingSenderId: '823355625505',
  appId: '1:823355625505:web:91e6c295172f1882e5d360',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
