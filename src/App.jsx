// src/App.jsx

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

import { auth, db } from './services/firebase';
import numerologyEngine from './services/numerologyEngine';

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
import NewNoteEditor from './NewNoteEditor';
import InfoModal from './components/ui/InfoModal';
import JournalEntryModal from './components/ui/JournalEntryModal';


let handleSaveUserDetails;

// --- PrivateRoute (sem alterações) ---
const PrivateRoute = ({ user, userData, isLoading, showDetailsModal }) => {
    if (isLoading) {
        return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><Spinner /></div>;
    }
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    if (showDetailsModal) {
        return <div className="min-h-screen bg-gray-900"><UserDetailsModal onSave={handleSaveUserDetails} /></div>;
    }
    if (user && userData) {
        return <Outlet />;
    }
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><Spinner /></div>;
};

// --- AppLayout ---
const AppLayout = ({ user, userData }) => {
    const [numerologyData, setNumerologyData] = useState(null);
    const [activeView, setActiveView] = useState('dashboard');
    const [mobileState, setMobileState] = useState('closed'); 
    const [desktopState, setDesktopState] = useState('expanded'); 
    const [editingEntry, setEditingEntry] = useState(null);
    const [showNewNoteEditor, setShowNewNoteEditor] = useState(false);
    const [newNoteDate, setNewNoteDate] = useState(null);
    const [infoModalData, setInfoModalData] = useState(null);

    useEffect(() => {
        // Usa 'nomeAnalise' para o cálculo, garantindo precisão
        if (userData?.nomeAnalise && userData?.dataNasc) {
            const data = numerologyEngine(userData.nomeAnalise, userData.dataNasc);
            setNumerologyData(data);
        }
    }, [userData]);
    
    const handleLogout = async () => await signOut(auth);
    const handleOpenNewNoteEditor = (date) => { setNewNoteDate(date || new Date()); setShowNewNoteEditor(true); };
    const handleInfoClick = (vibrationNumber) => { const info = numerologyEngine.getInfoForVibration(vibrationNumber); setInfoModalData(info); };
    
    const renderView = () => {
        switch (activeView) {
            case 'dashboard': return <Dashboard user={user} userData={userData} data={numerologyData} setActiveView={setActiveView} />;
            case 'calendar': return <Calendar user={user} userData={userData} openNewNoteEditor={handleOpenNewNoteEditor} setEditingEntry={setEditingEntry} onInfoClick={handleInfoClick}/>;
            case 'journal': return <Journal user={user} userData={userData} openNewNoteEditor={handleOpenNewNoteEditor} setEditingEntry={setEditingEntry} onInfoClick={handleInfoClick} />;
            case 'tasks': return <Tasks user={user} userData={userData} setActiveView={setActiveView} onInfoClick={handleInfoClick} />;
            case 'settings': return <SettingsPage />;
            case 'admin': return userData?.isAdmin ? <AdminPanel /> : <Navigate to="/app" />;
            default: return <Dashboard user={user} userData={userData} data={numerologyData} setActiveView={setActiveView} />;
        }
    };
    
    const contentMarginClass = () => {
        if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
            return desktopState === 'collapsed' ? 'lg:ml-20' : 'lg:ml-64';
        }
        return mobileState === 'pinned' ? 'ml-20' : 'ml-0';
    };

    return (
        <div className="h-screen w-screen flex bg-gray-900 text-gray-200 overflow-hidden">
            <Sidebar 
                activeView={activeView} setActiveView={setActiveView} onLogout={handleLogout}
                userData={userData}
                mobileState={mobileState} setMobileState={setMobileState}
                desktopState={desktopState} setDesktopState={setDesktopState}
            />
            <div className={`flex-1 flex flex-col h-screen transition-[margin] duration-300 ease-in-out ${contentMarginClass()}`}>
                <Header 
                    userData={userData} 
                    onMenuClick={() => setMobileState(s => s === 'drawer' ? 'closed' : 'drawer')} 
                    isMobileMenuPinned={mobileState === 'pinned'}
                />
                <main className="flex-1 overflow-y-auto overflow-x-hidden">
                    {renderView()}
                </main>
            </div>
            {showNewNoteEditor && <NewNoteEditor onClose={() => setShowNewNoteEditor(false)} preselectedDate={newNoteDate} user={user} userData={userData} onInfoClick={handleInfoClick} />}
            {editingEntry && <JournalEntryModal entry={editingEntry} onClose={() => setEditingEntry(null)} onInfoClick={handleInfoClick} />}
            {infoModalData && <InfoModal info={infoModalData} onClose={() => setInfoModalData(null)} />}
        </div>
    );
};

// --- Componente App Raiz ---
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
            } else {
                setUser(null);
                setUserData(null);
            }
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    handleSaveUserDetails = async ({ nomeAnalise, dataNasc }) => {
        if (user) {
            // Pega o nome de cadastro do perfil do Auth
            const displayName = user.displayName || '';
            const nameParts = displayName.split(' ');
            const primeiroNome = nameParts[0] || '';
            const sobrenome = nameParts.slice(1).join(' ') || '';

            const newUserData = { 
                email: user.email,
                primeiroNome: primeiroNome,
                sobrenome: sobrenome,
                nomeAnalise: nomeAnalise, // Nome completo para os cálculos
                dataNasc: dataNasc,
                plano: "gratuito", 
                isAdmin: false 
            };
            await setDoc(doc(db, "users", user.uid), newUserData);
            setUserData(newUserData);
            setShowDetailsModal(false);
        }
    };
    
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={user && !isLoading ? <Navigate to="/app"/> : <LoginPage />} />
                <Route path="/register" element={user && !isLoading ? <Navigate to="/app"/> : <RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                
                <Route path="/app" element={
                    <PrivateRoute user={user} userData={userData} isLoading={isLoading} showDetailsModal={showDetailsModal} />
                }>
                    <Route index element={<AppLayout user={user} userData={userData} />} />
                </Route>
                
                 <Route path="*" element={<Navigate to={user ? "/app" : "/"} replace />} />
            </Routes>
        </Router>
    );
}

export default App;