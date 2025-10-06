// src/services/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

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
const functions = getFunctions(app);

// Lógica de ambiente
if (import.meta.env.DEV) {
  console.log("Executando em ambiente de DESENVOLVIMENTO.");

  // Define o token de debug do App Check a partir da variável de ambiente
  const debugToken = import.meta.env.VITE_APPCHECK_DEBUG_TOKEN;
  
  if (debugToken) {
    // @ts-ignore
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = debugToken;
    console.log("✅ App Check Debug Token configurado");
  } else {
    console.warn("⚠️ VITE_APPCHECK_DEBUG_TOKEN não encontrado no .env");
  }

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
}

// Inicializa o App Check para todos os ambientes
initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('6LcIrd8rAAAAAHWugzhwZ3TY1PEKjCQ4G5cWiEtA'),
  isTokenAutoRefreshEnabled: true
});

// Exporta tudo que o app precisa
export { app, auth, db, functions };