// src/App.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { signOut } from "firebase/auth";

import { AppProvider, useAppContext } from './contexts/AppContext'; // Importe o Provider e o Hook
import { auth } from './services/firebase';
import numerologyEngine from './services/numerologyEngine';
import { textosExplicativos, textosVibracoes } from './data/content'; 

// Importações de páginas e componentes
import Spinner from './components/ui/Spinner';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import UserDetailsModal from './components/ui/UserDetailsModal';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import Journal from './pages/Journal';
import Tasks from './pages/Tasks';
import AdminPanel from './pages/AdminPanel';
import NewNoteEditor from './components/ui/NewNoteEditor';
import InfoModal from './components/ui/InfoModal';
import SettingsModal from './components/ui/SettingsModal'; 

const PrivateRoute = () => {
    // 1. Consome os dados do contexto
    const { user, userData, isLoading, showDetailsModal } = useAppContext();

    if (isLoading) { return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><Spinner /></div>; }
    if (!user) { return <Navigate to="/login" replace />; }
    // O modal agora não precisa de props!
    if (showDetailsModal) { return <div className="min-h-screen bg-gray-900"><UserDetailsModal /></div>; } 
    if (user && userData) { return <Outlet />; }
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><Spinner /></div>;
};

const AppLayout = () => {
    // 2. Consome os dados e funções que precisa do contexto
    const { user, userData, taskUpdater } = useAppContext(); 

    const [numerologyData, setNumerologyData] = useState(null);
    const [activeView, setActiveView] = useState('dashboard');
    const [mobileState, setMobileState] = useState('closed'); 
    const [desktopState, setDesktopState] = useState('expanded'); 
    const [journalEditorData, setJournalEditorData] = useState(null); 
    const [infoModalData, setInfoModalData] = useState(null);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

    useEffect(() => {
        if (userData?.nomeAnalise && userData?.dataNasc) {
            const data = numerologyEngine(userData.nomeAnalise, userData.dataNasc);
            setNumerologyData(data);
        }
    }, [userData]);
    
    const handleLogout = async () => await signOut(auth);
    
    const handleOpenNewNote = (date) => setJournalEditorData({ date: date || new Date() });
    const handleEditNote = (entry) => setJournalEditorData(entry);

    const handleInfoClick = useCallback((identifier) => {
        let info = null;
        if (typeof identifier === 'string') {
            info = textosExplicativos[identifier] || textosExplicativos.default;
        } else if (typeof identifier === 'number') {
            info = textosVibracoes[identifier] || textosVibracoes.default;
        }
        if (info) { setInfoModalData(info); }
    }, []);
    
    const renderView = () => {
        // 3. A prop taskUpdater já vem do contexto, não precisa passar novamente
        const viewProps = { user, userData, data: numerologyData, setActiveView, openNewNoteEditor: handleOpenNewNote, setEditingEntry: handleEditNote, onInfoClick: handleInfoClick, taskUpdater };

        switch (activeView) {
            case 'dashboard': return <Dashboard {...viewProps} />;
            case 'calendar': return <Calendar {...viewProps} />;
            case 'journal': return <Journal {...viewProps} />;
            case 'tasks': return <Tasks {...viewProps} />;
            case 'admin': return userData?.isAdmin ? <AdminPanel /> : <Navigate to="/app" />;
            default: return <Dashboard {...viewProps} />;
        }
    };

    return (
      <div className="h-screen w-screen flex flex-col bg-gray-900 text-gray-200 overflow-hidden">
            <Header 
                userData={userData} 
                onMenuClick={() => setMobileState(s => (s === 'closed') ? 'drawer' : 'closed')} 
                onSettingsClick={() => setIsSettingsModalOpen(true)}
                desktopState={desktopState}
                setDesktopState={setDesktopState}
            />
            
            <div className="flex flex-1 overflow-hidden">
                <Sidebar 
                    activeView={activeView} 
                    setActiveView={setActiveView} 
                    onLogout={handleLogout} 
                    userData={userData} 
                    mobileState={mobileState} 
                    setMobileState={setMobileState} 
                    desktopState={desktopState} 
                    setDesktopState={setDesktopState}
                    onSettingsClick={() => setIsSettingsModalOpen(true)}
                />
                
                <main className={`flex-1 overflow-y-auto overflow-x-hidden transition-all duration-300 ease-in-out ${mobileState === 'pinned' ? 'max-lg:ml-16' : ''}`}>
                    {renderView()}
                </main>
            </div>

            {journalEditorData && <NewNoteEditor onClose={() => setJournalEditorData(null)} entryData={journalEditorData} user={user} userData={userData} onInfoClick={handleInfoClick} />}
            {infoModalData && <InfoModal info={infoModalData} onClose={() => setInfoModalData(null)} />}
            
            {isSettingsModalOpen && (
                <SettingsModal 
                    user={user}
                    userData={userData}
                    onClose={() => setIsSettingsModalOpen(false)}
                />
            )}
        </div>
    );
};

// Componente App Raiz
function App() {
    // 4. Toda a lógica de estado foi movida. O componente agora é super limpo.
    const { user, isLoading } = useAppContext(); // Apenas para as rotas públicas

    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            {/* As rotas públicas usam a informação do contexto para decidir se redirecionam ou não */}
            <Route path="/login" element={user && !isLoading ? <Navigate to="/app"/> : <LoginPage />} />
            <Route path="/register" element={user && !isLoading ? <Navigate to="/app"/> : <RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            
            {/* A PrivateRoute agora busca seus próprios dados no contexto */}
            <Route path="/app" element={<PrivateRoute />}>
                {/* O AppLayout também busca seus próprios dados */}
                <Route index element={<AppLayout />} />
            </Route>
            
            <Route path="*" element={<Navigate to={user ? "/app" : "/"} replace />} />
        </Routes>
    );
}

// 5. A exportação agora envolve o App com o Provider
export default function AppWrapper() {
    return (
        <Router>
            <AppProvider>
                <App />
            </AppProvider>
        </Router>
    );
}