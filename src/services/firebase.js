// src/services/firebase.js (VERSÃO FINAL SIMPLIFICADA)

import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { initializeAppCheck, ReCaptchaV3Provider, CustomProvider } from "firebase/app-check";

// O Firebase agora é inicializado pelo /__/firebase/init.js no index.html
// Usamos o 'firebase' global que ele cria
const app = window.firebase.app();

const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);

if (import.meta.env.DEV) {
  console.log("Executando em ambiente de DESENVOLVIMENTO.");
  // @ts-ignore
  self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;

  initializeAppCheck(app, {
    provider: new CustomProvider(() => ({
      // @ts-ignore
      token: window.FIREBASE_APPCHECK_DEBUG_TOKEN,
      expireTimeMillis: Date.now() + 3600000,
    })),
    isTokenAutoRefreshEnabled: false,
  });

  try {
    connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
    connectFirestoreEmulator(db, "localhost", 8080);
    connectFunctionsEmulator(functions, "localhost", 5001);
    console.log("✅ Conexão com emuladores estabelecida!");
  } catch (error) {
    console.error("❌ Erro ao conectar aos emuladores:", error);
  }

} else {
  console.log("Executando em ambiente de PRODUÇÃO.");
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider('6LcIrd8rAAAAAHWugzhwZ3TY1PEKjCQ4G5cWiEtA'),
    isTokenAutoRefreshEnabled: true
  });
}

export { app, auth, db, functions };