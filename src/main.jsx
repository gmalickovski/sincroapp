import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';

// TESTE DEFINITIVO:
// Esta linha vai nos mostrar o que o Vite está lendo ANTES de carregar o React.
console.log("DEBUG INICIAL (main.jsx): ", import.meta.env);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)