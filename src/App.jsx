// src/App.jsx

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

// Corrigindo importações para o padrão do seu projeto (sem extensão)
import { auth, db } from './services/firebase';
import numerologyEngine from './services/numerologyEngine';

// Páginas e Componentes
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

// --- PrivateRoute ATUALIZADO ---
// Agora ele garante que userData não seja nulo antes de renderizar o AppLayout
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
    // CONDIÇÃO CRÍTICA ADICIONADA AQUI:
    // Só renderiza o Outlet (que contém o AppLayout) se userData já estiver carregado.
    // Isso previne que o AppLayout tente calcular com dados nulos.
    if (user && userData) {
        return <Outlet />;
    }
    // Se chegou aqui, o usuário está logado mas os dados ainda não vieram do Firestore.
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><Spinner /></div>;
};

// --- AppLayout (sem alterações na lógica de cálculo) ---
const AppLayout = ({ user, userData }) => {
    const [numerologyData, setNumerologyData] = useState(null);
    const [activeView, setActiveView] = useState('dashboard');
    const [mobileState, setMobileState] = useState('closed'); 
    const [desktopState, setDesktopState] = useState('expanded'); 
    const [editingEntry, setEditingEntry] = useState(null);
    const [showNewNoteEditor, setShowNewNoteEditor] = useState(false);
    const [newNoteDate, setNewNoteDate] = useState(null);
    const [infoModalData, setInfoModalData] = useState(null);

    // Este useEffect agora só vai rodar quando tiver certeza que userData é válido,
    // graças à proteção que adicionamos no PrivateRoute.
    useEffect(() => {
        if (userData?.nome && userData?.dataNasc) {
            const data = numerologyEngine(userData.nome, userData.dataNasc);
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

    handleSaveUserDetails = async ({ nome, dataNasc }) => {
        if (user) {
            const newUserData = { email: user.email, nome, dataNasc, plano: "gratuito", isAdmin: false };
            await setDoc(doc(db, "users", user.uid), newUserData);
            // Esta linha é essencial para o recálculo
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