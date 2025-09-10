import React, { useState, useEffect } from 'react';
import { auth, db } from './services/firebase';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

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
import JournalEntryModal from './components/ui/JournalEntryModal'; // Importado aqui
import numerologyEngine from './services/numerologyEngine';

const AppLayout = ({ user, userData, onLogout, setEditingEntry }) => {
    const [activeView, setActiveView] = useState('dashboard');
    const [numerologyData, setNumerologyData] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (userData?.nome && userData?.dataNasc) {
            const data = numerologyEngine(userData.nome, userData.dataNasc);
            setNumerologyData(data);
        }
    }, [userData]);
    
    const renderView = () => {
        switch (activeView) {
            case 'dashboard': return <Dashboard user={user} userData={userData} data={numerologyData} setActiveView={setActiveView} />;
            // Passando a função 'setEditingEntry' para o Calendário
            case 'calendar': return <Calendar user={user} userData={userData} setEditingEntry={setEditingEntry} />;
            // Passando a função 'setEditingEntry' para o Diário
            case 'journal': return <Journal user={user} userData={userData} setEditingEntry={setEditingEntry} />;
            case 'tasks': return <Tasks user={user} userData={userData} />;
            case 'admin': return <AdminPanel />;
            default: return <Dashboard user={user} userData={userData} data={numerologyData} setActiveView={setActiveView} />;
        }
    };
    
    return (
        <div className="h-screen w-screen flex bg-gray-900 text-gray-200 font-sans antialiased">
            <Sidebar 
                activeView={activeView} 
                setActiveView={setActiveView} 
                isAdmin={userData?.isAdmin} 
                isMobileOpen={isMobileMenuOpen}
                closeMobileMenu={() => setIsMobileMenuOpen(false)}
            />
            
            <div className="flex-1 flex flex-col h-screen md:ml-20 lg:ml-64 transition-all duration-300">
                <Header user={user} onLogout={onLogout} onMenuClick={() => setIsMobileMenuOpen(true)} />
                <main className="flex-1 overflow-y-auto overflow-x-hidden">
                    {renderView()}
                </main>
            </div>
        </div>
    );
};

function App() {
    const [appState, setAppState] = useState('loading');
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    // Novo estado para controlar a anotação em edição/visualização
    const [editingEntry, setEditingEntry] = useState(null);
    
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const userDocRef = doc(db, "users", currentUser.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) { setUserData(userDoc.data()); setShowDetailsModal(false); setAppState('app'); } 
                else { setShowDetailsModal(true); setAppState('app'); }
            } else { setUser(null); setUserData(null); setAppState('landing'); }
        });
        return () => unsubscribe();
    }, []);

    const handleSaveUserDetails = async ({ nome, dataNasc }) => {
        if (user) {
            const userDocRef = doc(db, "users", user.uid);
            const newUserData = { email: user.email, nome, dataNasc, plano: "gratuito", isAdmin: false };
            await setDoc(userDocRef, newUserData);
            setUserData(newUserData);
            setShowDetailsModal(false);
        }
    };

    const handleLogout = async () => {
        try { await signOut(auth); } 
        catch (error) { console.error("Erro ao fazer logout:", error); }
    };
    
    // Função para fechar o modal de edição
    const handleCloseEntryModal = () => {
        setEditingEntry(null);
    };

    // Renderização principal do App
    const renderAppState = () => {
        switch (appState) {
            case 'loading': return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><Spinner /></div>;
            case 'landing': return <LandingPage onEnterClick={() => setAppState('login')} />;
            case 'login': return <LoginPage onBackToHomeClick={() => setAppState('landing')} />;
            case 'app':
                if (showDetailsModal) { return <UserDetailsModal onSave={handleSaveUserDetails} />; }
                if (user && userData) { return <AppLayout user={user} userData={userData} onLogout={handleLogout} setEditingEntry={setEditingEntry} />; }
                return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><Spinner /></div>;
            default: return <LandingPage onEnterClick={() => setAppState('login')} />;
        }
    };

    return (
        <>
            {renderAppState()}
            {/* O modal de edição agora é renderizado aqui, no topo de tudo */}
            {editingEntry && <JournalEntryModal entry={editingEntry} onClose={handleCloseEntryModal} />}
        </>
    );
}

export default App;