import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyCULBHaBCeRiqJ6pWNE_Kjg2ienHxAAQVE",
  authDomain: "eventorganizer-8c363.firebaseapp.com",
  projectId: "eventorganizer-8c363",
  storageBucket: "eventorganizer-8c363.firebasestorage.app",
  messagingSenderId: "558370152000",
  appId: "1:558370152000:web:2493dbb004164a496509a5",
  measurementId: "G-P2C2W2LGSL"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export { db, auth, app };