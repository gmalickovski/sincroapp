import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // Mantendo o nome original 'db'

// ** ADIÇÃO CRÍTICA PARA CONECTAR AO EMULADOR **
// Este bloco só será executado em ambiente de desenvolvimento (`npm run dev`)
if (import.meta.env.DEV) {
  try {
    connectAuthEmulator(auth, "http://127.0.0.1:9099");
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
    console.log("✅ Conectado aos emuladores do Firebase: Auth e Firestore");
  } catch (error) {
    console.error("❌ Erro ao conectar aos emuladores:", error);
  }
}

// Exporta 'auth' e 'db', como era no seu código original
export { auth, db };