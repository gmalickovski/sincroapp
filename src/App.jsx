// src/App.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, collection, addDoc, updateDoc, deleteDoc, Timestamp } from "firebase/firestore";

import { auth, db } from './services/firebase';
import numerologyEngine from './services/numerologyEngine';
// ATUALIZADO: Importando os dois objetos de texto para o modal
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
import SettingsPage from './pages/SettingsPage';
import AdminPanel from './pages/AdminPanel';
import NewNoteEditor from './components/ui/NewNoteEditor';
import InfoModal from './components/ui/InfoModal';

let handleSaveUserDetails;

const PrivateRoute = ({ user, userData, isLoading, showDetailsModal }) => {
    if (isLoading) { return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><Spinner /></div>; }
    if (!user) { return <Navigate to="/login" replace />; }
    if (showDetailsModal) { return <div className="min-h-screen bg-gray-900"><UserDetailsModal onSave={handleSaveUserDetails} /></div>; }
    if (user && userData) { return <Outlet />; }
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><Spinner /></div>;
};

const AppLayout = ({ user, userData, taskUpdater }) => {
    const [numerologyData, setNumerologyData] = useState(null);
    const [activeView, setActiveView] = useState('dashboard');
    const [mobileState, setMobileState] = useState('closed'); 
    const [desktopState, setDesktopState] = useState('expanded'); 
    const [journalEditorData, setJournalEditorData] = useState(null); 
    const [infoModalData, setInfoModalData] = useState(null);

    useEffect(() => {
        if (userData?.nomeAnalise && userData?.dataNasc) {
            const data = numerologyEngine(userData.nomeAnalise, userData.dataNasc);
            setNumerologyData(data);
        }
    }, [userData]);
    
    const handleLogout = async () => await signOut(auth);
    
    const handleOpenNewNote = (date) => setJournalEditorData({ date: date || new Date() });
    const handleEditNote = (entry) => setJournalEditorData(entry);

    // ### LÓGICA ATUALIZADA E UNIFICADA ###
    // Esta função agora lida com cliques de cards (string) e pílulas (número).
    const handleInfoClick = useCallback((identifier) => {
        let info = null;
        if (typeof identifier === 'string') {
            // Se for string, busca nos textos explicativos dos cards
            info = textosExplicativos[identifier] || textosExplicativos.default;
        } else if (typeof identifier === 'number') {
            // Se for número, busca nos textos das vibrações
            info = textosVibracoes[identifier] || textosVibracoes.default;
        }
        
        if (info) {
            setInfoModalData(info);
        }
    }, []); // As dependências (textos) são estáticas, então o array pode ficar vazio.
    
    const renderView = () => {
        // Passamos a função unificada 'handleInfoClick' para todos os componentes filhos
        const viewProps = {
            user,
            userData,
            data: numerologyData,
            setActiveView,
            openNewNoteEditor: handleOpenNewNote,
            setEditingEntry: handleEditNote,
            onInfoClick: handleInfoClick, // <-- Usando a nova função inteligente!
            taskUpdater
        };

        switch (activeView) {
            case 'dashboard': return <Dashboard {...viewProps} />;
            case 'calendar': return <Calendar {...viewProps} />;
            case 'journal': return <Journal {...viewProps} />;
            case 'tasks': return <Tasks {...viewProps} />;
            case 'settings': return <SettingsPage />;
            case 'admin': return userData?.isAdmin ? <AdminPanel /> : <Navigate to="/app" />;
            default: return <Dashboard {...viewProps} />;
        }
    };
    
    const contentMarginClass = () => {
        if (typeof window !== 'undefined' && window.innerWidth >= 1024) { return desktopState === 'collapsed' ? 'lg:ml-20' : 'lg:ml-64'; }
        return mobileState === 'pinned' ? 'ml-20' : 'ml-0';
    };

    return (
        <div className="h-screen w-screen flex bg-gray-900 text-gray-200 overflow-hidden">
            <Sidebar activeView={activeView} setActiveView={setActiveView} onLogout={handleLogout} userData={userData} mobileState={mobileState} setMobileState={setMobileState} desktopState={desktopState} setDesktopState={setDesktopState} />
            <div className={`flex-1 flex flex-col h-screen transition-[margin] duration-300 ease-in-out ${contentMarginClass()}`}>
                <Header userData={userData} onMenuClick={() => setMobileState(s => s === 'drawer' ? 'closed' : 'drawer')} isMobileMenuPinned={mobileState === 'pinned'} />
                <main className="flex-1 overflow-y-auto overflow-x-hidden"> {renderView()} </main>
            </div>

            {journalEditorData && <NewNoteEditor 
                onClose={() => setJournalEditorData(null)} 
                entryData={journalEditorData} 
                user={user} 
                userData={userData} 
                onInfoClick={handleInfoClick} 
            />}
            
            {infoModalData && <InfoModal info={infoModalData} onClose={() => setInfoModalData(null)} />}
        </div>
    );
};

// Componente App Raiz
function App() {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const userDocRef = doc(db, "users", currentUser.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    setUserData(userDoc.data());
                    setShowDetailsModal(false);
                } else {
                    setUserData(null); 
                    setShowDetailsModal(true);
                }
            } else { setUser(null); setUserData(null); }
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    handleSaveUserDetails = async ({ nomeAnalise, dataNasc }) => {
        if (user) {
            const displayName = user.displayName || '';
            const nameParts = displayName.split(' ');
            const primeiroNome = nameParts[0] || '';
            const sobrenome = nameParts.slice(1).join(' ') || '';
            const newUserData = { email: user.email, primeiroNome, sobrenome, nomeAnalise, dataNasc, plano: "gratuito", isAdmin: false };
            await setDoc(doc(db, "users", user.uid), newUserData);
            setUserData(newUserData);
            setShowDetailsModal(false);
        }
    };
    
    const taskUpdater = useCallback(async (action) => {
        if (!user) return;
        const { type, payload } = action;
        const tasksRef = collection(db, 'users', user.uid, 'tasks');
        if (type === 'ADD') {
            await addDoc(tasksRef, { text: payload.text, completed: false, createdAt: Timestamp.fromDate(payload.date) });
        } else if (type === 'UPDATE') {
            const { id, ...updates } = payload;
            await updateDoc(doc(tasksRef, id), updates);
        } else if (type === 'DELETE') {
            await deleteDoc(doc(tasksRef, payload.id));
        }
    }, [user]);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={user && !isLoading ? <Navigate to="/app"/> : <LoginPage />} />
                <Route path="/register" element={user && !isLoading ? <Navigate to="/app"/> : <RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/app" element={<PrivateRoute user={user} userData={userData} isLoading={isLoading} showDetailsModal={showDetailsModal} />}>
                    <Route index element={<AppLayout user={user} userData={userData} taskUpdater={taskUpdater} />} />
                </Route>
                 <Route path="*" element={<Navigate to={user ? "/app" : "/"} replace />} />
            </Routes>
        </Router>
    );
}

export default App;