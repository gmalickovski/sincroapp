// src/App.jsx

import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
import AppLayout from './AppLayout';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import CookieBanner from './components/ui/CookieBanner';
import numerologyEngine from './services/numerologyEngine';
import Spinner from './components/ui/Spinner';

const AppController = () => {
    const { userData, logout } = useAuth();
    const navigate = useNavigate();
    const [numerologyData, setNumerologyData] = useState(null);

    useEffect(() => {
        if (userData?.nome && userData?.dataNasc) {
            setNumerologyData(numerologyEngine(userData.nome, userData.dataNasc));
        } else if (userData) {
            // Caso raro: usuário logado mas sem dados de análise.
            // Poderíamos redirecionar para uma página de erro ou de completar perfil.
            // Por enquanto, apenas logamos o erro.
            console.error("Dados de análise ausentes para o usuário:", userData.uid);
        }
    }, [userData]);

    if (!numerologyData) {
        return <div className="h-screen w-screen bg-gray-900 flex items-center justify-center"><Spinner /></div>;
    }

    return <AppLayout userData={userData} numerologyData={numerologyData} onLogout={() => { logout(); navigate('/login'); }} />;
};

function App() {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return <div className="h-screen w-screen bg-gray-900 flex items-center justify-center"><Spinner /></div>;
    }

    return (
        <>
            <Routes>
                <Route path="/*" element={!currentUser ? <PublicRoutes /> : <ProtectedRoutes />} />
            </Routes>
            <CookieBanner />
        </>
    );
}

const PublicRoutes = () => (
    <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/politica-de-privacidade" element={<PrivacyPolicy />} />
        <Route path="/termos-de-servico" element={<TermsOfService />} />
        <Route path="/esqueci-senha" element={<ForgotPasswordPage />} />
        <Route path="*" element={<Navigate to="/" />} />
    </Routes>
);

const ProtectedRoutes = () => (
    <Routes>
        <Route path="/app/*" element={<AppController />} />
        <Route path="*" element={<Navigate to="/app/dashboard" />} />
    </Routes>
);

export default App;