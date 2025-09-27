// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import AppWrapper from './App'; // Importe o novo componente Wrapper
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppWrapper /> {/* Renderize o Wrapper aqui */}
  </React.StrictMode>,
);