// src/App.jsx

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Componentes e Páginas
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
import UserDetailsModal from './components/ui/UserDetailsModal';
import AppLayout from './AppLayout';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import SettingsPage from './pages/SettingsPage';
import CookieBanner from './components/ui/CookieBanner';

// Componente para rotas que exigem autenticação
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" replace />;
};

// Componente para rotas que não devem ser acessadas por usuários logados
const PublicOnlyRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return !currentUser ? children : <Navigate to="/app" replace />;
};

function App() {
  const { currentUser, showDetailsModal, saveUserDetails } = useAuth();

  if (currentUser && showDetailsModal) {
    return <UserDetailsModal onSave={saveUserDetails} />;
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
        <Route path="/esqueci-senha" element={<PublicOnlyRoute><ForgotPasswordPage /></PublicOnlyRoute>} />
        
        <Route path="/politica-de-privacidade" element={<PrivacyPolicy />} />
        <Route path="/termos-de-servico" element={<TermsOfService />} />
        
        <Route path="/app/*" element={<ProtectedRoute><AppLayout /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      </Routes>
      <CookieBanner />
    </>
  );
}

export default App;