// src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/global.css';

// Importa os serviços e as funções do emulador
import { auth, db } from './services/firebase.js';
import { connectAuthEmulator } from "firebase/auth";
import { connectFirestoreEmulator } from "firebase/firestore";

// Conecta aos emuladores APENAS em ambiente de desenvolvimento
if (import.meta.env.DEV) {
  try {
    connectAuthEmulator(auth, "http://127.0.0.1:9099");
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
    console.log("✅ Conexão com emuladores estabelecida com sucesso em main.jsx!");
  } catch (error) {
    console.error("❌ Erro ao conectar aos emuladores em main.jsx:", error);
  }
}

// Renderiza o aplicativo APÓS a configuração do emulador
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

