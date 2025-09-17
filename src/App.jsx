import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AppLayout from './AppLayout';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import Journal from './pages/Journal';
import Tasks from './pages/Tasks';
import SettingsPage from './pages/SettingsPage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import AdminPanel from './pages/AdminPanel';
import Spinner from './components/ui/Spinner';

// O componente PrivateRoute permanece o mesmo, ele depende do useAuth() que virá do contexto provido em main.jsx
const PrivateRoute = ({ children }) => {
    const { currentUser, loading } = useAuth();
    if (loading) return <div className="flex justify-center items-center h-screen bg-gray-900"><Spinner /></div>;
    return currentUser ? children : <Navigate to="/login" />;
};

// O componente AdminRoute permanece o mesmo
const AdminRoute = ({ children }) => {
    const { currentUser, userData, loading } = useAuth();
    if (loading) return <div className="flex justify-center items-center h-screen bg-gray-900"><Spinner /></div>;
    return currentUser && userData?.isAdmin ? children : <Navigate to="/dashboard" />;
};

function App() {
    // CORREÇÃO: Removidos os wrappers <AuthProvider> e <Router> que estavam duplicados.
    // O App agora retorna diretamente o componente <Routes>.
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            
            <Route 
                path="/dashboard" 
                element={<PrivateRoute><AppLayout /></PrivateRoute>}
            >
                <Route index element={<Dashboard />} />
                <Route path="calendar" element={<Calendar />} />
                <Route path="journal" element={<Journal />} />
                <Route path="tasks" element={<Tasks />} />
                <Route path="settings" element={<SettingsPage />} />
            </Route>

            <Route 
                path="/admin"
                element={<AdminRoute><AdminPanel /></AdminRoute>}
            />
        </Routes>
    );
}

export default App;