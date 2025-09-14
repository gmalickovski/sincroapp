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

let app;
let auth;
let firestore;

// Verificação para garantir que as variáveis de ambiente foram carregadas
if (!firebaseConfig.apiKey) {
  console.error("ERRO CRÍTICO: As credenciais do Firebase não foram encontradas. Verifique se o arquivo .env.local está na pasta raiz do projeto e se o servidor de desenvolvimento foi reiniciado.");
} else {
  // Inicializa o Firebase
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  firestore = getFirestore(app);

  // Conecta aos emuladores locais APENAS em ambiente de desenvolvimento
  // A variável import.meta.env.DEV é fornecida pelo Vite e é `true` ao rodar `npm run dev`.
  if (import.meta.env.DEV) {
    try {
      // Conecta ao emulador de Autenticação
      connectAuthEmulator(auth, "http://127.0.0.1:9099");
      
      // Conecta ao emulador do Firestore
      connectFirestoreEmulator(firestore, "127.0.0.1", 8080); 
      
      console.log("✅ Conectado aos emuladores do Firebase: Auth e Firestore");
    } catch (error) {
      console.error("❌ Erro ao conectar aos emuladores:", error);
    }
  }
}

// Exporta as instâncias para serem usadas em outras partes do aplicativo
export { app, auth, firestore };