// src/App.jsx

import React, { useState, useEffect } from 'react';
import { auth, db } from './services/firebase';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, addDoc, collection, Timestamp } from "firebase/firestore";
import { textosDescritivos } from './data/content';
import { runMigration } from './migration.js'; 

// Componentes e Páginas
import Spinner from './components/ui/Spinner';
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
import UserDetailsModal from './components/ui/UserDetailsModal';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import Journal from './pages/Journal';
import Tasks from './pages/Tasks';
import AdminPanel from './pages/AdminPanel';
import JournalEntryModal from './components/ui/JournalEntryModal';
import InfoModal from './components/ui/InfoModal';
import VibrationPill from './components/ui/VibrationPill';
import numerologyEngine from './services/numerologyEngine';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import CookieBanner from './components/ui/CookieBanner';
import SettingsPage from './pages/SettingsPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

const NewNoteEditor = ({ onClose, preselectedDate, user, userData, onInfoClick }) => {
    const [content, setContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const handleSave = async () => {
        if (content.trim() === '' || !user?.uid || !userData?.dataNasc) return;
        setIsSaving(true);
        try {
            const dateForNote = preselectedDate || new Date();
            const personalDayForNote = numerologyEngine.calculatePersonalDayForDate(dateForNote, userData.dataNasc);
            await addDoc(collection(db, 'users', user.uid, 'journalEntries'), { content: content, createdAt: Timestamp.fromDate(dateForNote), personalDay: personalDayForNote });
            onClose();
        } catch (error) { console.error("Erro:", error); } finally { setIsSaving(false); }
    };
    const date = preselectedDate || new Date();
    const personalDay = numerologyEngine.calculatePersonalDayForDate(date, userData.dataNasc);
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center z-50 animate-fade-in p-4" onClick={onClose}>
            <div className="w-full max-w-3xl relative" onClick={e => e.stopPropagation()}>
                <div className="journal-paper shadow-2xl h-[70vh] flex flex-col">
                    <div className="flex justify-between items-start text-gray-600 border-b border-gray-300 pb-3 mb-3">
                        <h3 className="text-lg font-bold capitalize">{date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}</h3>
                        <VibrationPill vibrationNumber={personalDay} onClick={onInfoClick} />
                    </div>
                    <textarea value={content} onChange={(e) => setContent(e.target.value)} className="w-full h-full bg-transparent focus:outline-none text-base resize-none" autoFocus />
                </div>
                <div className="flex justify-center mt-4"><button onClick={handleSave} disabled={isSaving || content.trim() === ''} className="text-white font-bold py-2 px-8 rounded-lg transition-colors hover:bg-white/10 disabled:text-gray-500">{isSaving ? <Spinner /> : 'Salvar Anotação'}</button></div>
            </div>
        </div>
    );
};

const AppLayout = ({ user, userData, onLogout, setEditingEntry, openNewNoteEditor, onInfoClick, activeView, setActiveView, onNavigateToSettings }) => {
    const [numerologyData, setNumerologyData] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    useEffect(() => { if (userData?.nome && userData?.dataNasc) { setNumerologyData(numerologyEngine(userData.nome, userData.dataNasc)); } }, [userData]);
    
    const renderView = () => {
        switch (activeView) {
            case 'dashboard': return <Dashboard user={user} userData={userData} data={numerologyData} setActiveView={setActiveView} onInfoClick={onInfoClick} />;
            case 'calendar':  return <Calendar user={user} userData={userData} setEditingEntry={setEditingEntry} openNewNoteEditor={openNewNoteEditor} onInfoClick={onInfoClick} />;
            case 'journal': return <Journal user={user} userData={userData} setEditingEntry={setEditingEntry} openNewNoteEditor={openNewNoteEditor} onInfoClick={onInfoClick} />;
            case 'tasks': return <Tasks user={user} userData={userData} setActiveView={setActiveView} onInfoClick={onInfoClick} />;
            case 'admin': return <AdminPanel />;
            default: return <Dashboard user={user} userData={userData} data={numerologyData} setActiveView={setActiveView} onInfoClick={onInfoClick} />;
        }
    };
    
    return (
        <div className="h-screen w-screen flex bg-gray-900 text-gray-200 font-sans antialiased">
            <Sidebar activeView={activeView} setActiveView={setActiveView} isAdmin={userData?.isAdmin} isMobileOpen={isMobileMenuOpen} closeMobileMenu={() => setIsMobileMenuOpen(false)} onLogout={onLogout} onNavigateToSettings={onNavigateToSettings}/>
            <div className="flex-1 flex flex-col h-screen md:ml-20 lg:ml-64 transition-all duration-300">
                <Header user={user} userData={userData} onMenuClick={() => setIsMobileMenuOpen(true)} />
                <main className="flex-1 overflow-y-auto overflow-x-hidden">
                    {renderView()}
                </main>
            </div>
        </div>
    );
};

function App() {
    const [appState, setAppState] = useState('loading');
    const [activeView, setActiveView] = useState('dashboard');
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [editingEntry, setEditingEntry] = useState(null);
    const [isNewNoteEditorOpen, setIsNewNoteEditorOpen] = useState(false);
    const [preselectedDateForEditor, setPreselectedDateForEditor] = useState(null);
    const [infoModalData, setInfoModalData] = useState(null);

    const handleInfoClick = (vibrationNumber) => {
        const info = textosDescritivos.diaPessoal[vibrationNumber];
        if (info) {
            setInfoModalData({ ...info, numero: vibrationNumber });
        }
    };
    const closeInfoModal = () => setInfoModalData(null);
    const openNewNoteEditor = (date = null) => { setPreselectedDateForEditor(date); setIsNewNoteEditorOpen(true); };
    const closeNewNoteEditor = () => { setIsNewNoteEditorOpen(false); setPreselectedDateForEditor(null); };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                if (userDoc.exists()) { 
                    setUserData(userDoc.data()); 
                    setShowDetailsModal(false);
                    if (appState !== 'settings') {
                       setAppState('app'); 
                    }
                } else { 
                    setShowDetailsModal(true); 
                    setAppState('app'); 
                }
            } else { 
                setUser(null); 
                setUserData(null);
                // CORREÇÃO APLICADA AQUI:
                // Adicionamos a verificação para não interferir na navegação para a página de login.
                if (appState !== 'login' && appState !== 'privacy' && appState !== 'terms' && appState !== 'forgotPassword') {
                    setAppState('landing');
                }
            }
        });
        return () => unsubscribe();
    }, [appState]); // Adicionamos appState à dependência para a lógica refletir o estado atual

    const handleSaveUserDetails = async ({ nome, dataNasc }) => {
        if (user) {
            const newUserData = { email: user.email, nome, dataNasc, plano: "gratuito", isAdmin: false };
            await setDoc(doc(db, "users", user.uid), newUserData);
            setUserData(newUserData);
            setShowDetailsModal(false);
        }
    };
    const handleLogout = async () => { try { await signOut(auth); setAppState('landing'); } catch (error) { console.error("Erro:", error); }};
    const handleCloseEntryModal = () => setEditingEntry(null);
    
    const handleNavigate = (page) => {
        if (page === 'privacy') setAppState('privacy');
        if (page === 'terms') setAppState('terms');
    };

    const renderAppState = () => {
        switch (appState) {
            case 'loading': return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><Spinner /></div>;
            case 'landing': return <LandingPage onEnterClick={() => setAppState('login')} onNavigate={handleNavigate} />;
            case 'login': return <LoginPage onBackToHomeClick={() => setAppState('landing')} onNavigateToForgotPassword={() => setAppState('forgotPassword')} />;
            case 'forgotPassword': return <ForgotPasswordPage onBackToLogin={() => setAppState('login')} />;
            case 'privacy': return <PrivacyPolicy onBackToHomeClick={() => setAppState('landing')} />;
            case 'terms': return <TermsOfService onBackToHomeClick={() => setAppState('landing')} />;
            case 'settings':
                if (user && userData) {
                    return <SettingsPage user={user} userData={userData} onBackToApp={() => setAppState('app')} />;
                }
                if (!user) setAppState('landing');
                return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><Spinner /></div>;
            case 'app':
                if (showDetailsModal) { return <UserDetailsModal onSave={handleSaveUserDetails} />; }
                if (user && userData) { return <AppLayout user={user} userData={userData} onLogout={handleLogout} setEditingEntry={setEditingEntry} openNewNoteEditor={openNewNoteEditor} onInfoClick={handleInfoClick} activeView={activeView} setActiveView={setActiveView} onNavigateToSettings={() => setAppState('settings')} />; }
                if (!user) setAppState('landing');
                return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><Spinner /></div>;
            default: return <LandingPage onEnterClick={() => setAppState('login')} onNavigate={handleNavigate} />;
        }
    };

    return (
        <>
            {renderAppState()}
            
            {userData?.isAdmin && appState === 'app' && (
                <button 
                    onClick={runMigration} 
                    className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:bg-red-700 animate-pulse"
                >
                    MIGRAR TEXTOS PARA O FIREBASE (VERSÃO FINAL)
                </button>
            )}

            <JournalEntryModal entry={editingEntry} onClose={handleCloseEntryModal} onInfoClick={handleInfoClick} />
            {isNewNoteEditorOpen && <NewNoteEditor onClose={closeNewNoteEditor} preselectedDate={preselectedDateForEditor} user={user} userData={userData} onInfoClick={handleInfoClick} />}
            <InfoModal info={infoModalData} onClose={closeInfoModal} />
            <CookieBanner />
        </>
    );
}

export default App;