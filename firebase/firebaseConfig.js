// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDazbJx4fHNcPZgEzolOaQnTWCn80UAHYE",
  authDomain: "chiefcms-741bd.firebaseapp.com",
  projectId: "chiefcms-741bd",
  storageBucket: "chiefcms-741bd.appspot.com",
  messagingSenderId: "553220941917",
  appId: "1:553220941917:web:908c3ae4ff84002ae8c5b4"
};
  

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
