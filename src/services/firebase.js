import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app;
let auth;
let db;

// Verificação crucial sem travar o app
if (!firebaseConfig.apiKey) {
  console.error("ERRO CRÍTICO: As credenciais do Firebase não foram encontradas em import.meta.env. O arquivo .env.local pode não estar sendo lido. Verifique se ele está na pasta raiz e se o servidor foi reiniciado.");
} else {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  console.log("Firebase inicializado com sucesso!");
}

// Exporta as variáveis, mesmo que estejam vazias, para evitar erros de importação
export { app, auth, db };

