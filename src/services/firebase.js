// src/services/firebase.js (VERSÃO DEFINITIVA)

import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { initializeAppCheck, ReCaptchaV3Provider, CustomProvider } from "firebase/app-check"; // Adicionado CustomProvider

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);

if (import.meta.env.DEV) {
  console.log("Executando em ambiente de DESENVOLVIMENTO.");

  // Ativa o token de depuração do App Check para testes locais
  // @ts-ignore
  self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;

  // Inicializa o App Check para o ambiente de desenvolvimento
  initializeAppCheck(app, {
    provider: new CustomProvider(() => {
      return {
        // @ts-ignore
        token: window.FIREBASE_APPCHECK_DEBUG_TOKEN,
        expireTimeMillis: Date.now() + 60 * 60 * 1000, // Expira em 1 hora
      };
    }),
    isTokenAutoRefreshEnabled: false,
  });

  // Conecta aos emuladores
  try {
    connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
    connectFirestoreEmulator(db, "localhost", 8080);
    connectFunctionsEmulator(functions, "localhost", 5001);
    console.log("✅ Conexão com emuladores (Auth, Firestore, Functions) estabelecida!");
  } catch (error) {
    console.error("❌ Erro ao conectar aos emuladores:", error);
  }

} else {
  console.log("Executando em ambiente de PRODUÇÃO.");
  
  // Inicializa o App Check para o ambiente de produção
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider('6LcIrd8rAAAAAHWugzhwZ3TY1PEKjCQ4G5cWiEtA'),
    isTokenAutoRefreshEnabled: true
  });
}

// Exporta tudo que o app precisa
export { app, auth, db, functions };