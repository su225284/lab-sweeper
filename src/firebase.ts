import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyB12cEztizKXz1X4-xmCptdop_giE21Yo8",
  authDomain: "lab-sweeper-e4e49.firebaseapp.com",
  projectId: "lab-sweeper-e4e49",
  storageBucket: "lab-sweeper-e4e49.firebasestorage.app",
  messagingSenderId: "456989530017",
  appId: "1:456989530017:web:d8ae8b9adc1bdd0f861de0",
}

const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)