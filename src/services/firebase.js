// src/services/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

// Configuração do Firebase a partir das variáveis de ambiente
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Inicializa o app
const app = initializeApp(firebaseConfig);

// Pega as instâncias dos serviços
const auth = getAuth(app);
const db = getFirestore(app);

// Conecta aos emuladores APENAS em ambiente de desenvolvimento
if (import.meta.env.DEV) {
  try {
    // Para o Auth Emulator, é uma boa prática não usar a chave de produção.
    // Qualquer string não-vazia funciona aqui.
    firebaseConfig.apiKey = "firebase-emulator-api-key";

    connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
    connectFirestoreEmulator(db, "localhost", 8080);
    console.log("✅ Conexão com emuladores estabelecida com sucesso em firebase.js!");
  } catch (error) {
    console.error("❌ Erro ao conectar aos emuladores em firebase.js:", error);
  }
}

// Exporta os serviços já configurados
export { auth, db };