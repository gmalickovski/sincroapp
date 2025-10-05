// src/services/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

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

// Declara a variável 'functions' que será configurada abaixo
let functions;

// Lógica de ambiente para diferenciar desenvolvimento de produção
if (import.meta.env.DEV) {
  // --- AMBIENTE DE DESENVOLVIMENTO (npm run dev) ---
  
  // Inicializa sem região para poder conectar ao emulador local
  functions = getFunctions(app);

  try {
    // Usa uma chave de API genérica para o emulador
    firebaseConfig.apiKey = "firebase-emulator-api-key";
    
    // Conecta aos emuladores locais
    connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
    connectFirestoreEmulator(db, "localhost", 8080);
    connectFunctionsEmulator(functions, "localhost", 5001);
    
    console.log("✅ Conexão com emuladores (Auth, Firestore, Functions) estabelecida com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao conectar aos emuladores em firebase.js:", error);
  }

} else {
  // --- AMBIENTE DE PRODUÇÃO (npm run build) ---
  
  // Inicializa especificando a região onde a função foi publicada ('us-central1')
  functions = getFunctions(app, 'us-central1');
  console.log("✅ Conectado aos serviços de produção do Firebase.");
}


// Exporta os serviços já configurados para serem usados no resto do app
export { auth, db, functions };