import { initializeApp, getApps } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey:            "AIzaSyB2nNMXEI9AeOqA1jHFhZMGBTHcY6jniiI",
  authDomain:        "scorebet-app-d7464.firebaseapp.com",
  projectId:         "scorebet-app-d7464",
  storageBucket:     "scorebet-app-d7464.firebasestorage.app",
  messagingSenderId: "58269589910",
  appId:             "1:58269589910:web:49a58737db9e89ceef7db7",
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

export const auth = getAuth(app)
export const db   = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()
