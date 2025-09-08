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
import numerologyEngine from './services/numerologyEngine';

// ========================================================================
// |                   LAYOUT PRINCIPAL (ÁREA LOGADA)                     |
// ========================================================================
const AppLayout = ({ user, userData, onLogout }) => {
    const [activeView, setActiveView] = useState('dashboard');
    const [numerologyData, setNumerologyData] = useState(null);
    // Este estado é usado para pré-selecionar a data ao navegar para Journal ou Tasks
    const [dateForAction, setDateForAction] = useState(null); 

    useEffect(() => {
        if (userData?.nome && userData?.dataNasc) {
            const data = numerologyEngine(userData.nome, userData.dataNasc);
            setNumerologyData(data);
        }
    }, [userData]);
    
    // Função para limpar a data (usada pelas páginas Journal/Tasks ao salvar)
    const handleActionFinished = () => {
        setDateForAction(null);
    }

    // Decide qual página renderizar com base no estado 'activeView'
    const renderView = () => {
        switch (activeView) {
            case 'dashboard': 
                return <Dashboard user={user} userData={userData} data={numerologyData} setActiveView={setActiveView} />;
            case 'calendar': 
                return <Calendar user={user} userData={userData} />;
            case 'journal': 
                return <Journal user={user} userData={userData} preselectedDate={dateForAction} onJournalUpdated={handleActionFinished} />;
            // ATUALIZADO: Passando 'userData' para a página de Tarefas
            case 'tasks': 
                return <Tasks user={user} userData={userData} preselectedDate={dateForAction} onTasksUpdated={handleActionFinished} />;
            case 'admin': 
                return <AdminPanel />;
            default: 
                return <Dashboard user={user} userData={userData} data={numerologyData} setActiveView={setActiveView} />;
        }
    };
    
    return (
        <div className="h-screen w-screen flex bg-gray-900 text-gray-200 font-sans antialiased" style={{ backgroundImage: "radial-gradient(circle at top right, rgba(128, 90, 213, 0.1), transparent 50%)" }}>
            <Sidebar activeView={activeView} setActiveView={setActiveView} isAdmin={userData?.isAdmin} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header user={user} onLogout={onLogout} />
                <main className="flex-1 overflow-y-auto">{renderView()}</main>
            </div>
        </div>
    );
};


// ========================================================================
// |               COMPONENTE PRINCIPAL QUE GERENCIA TUDO               |
// ========================================================================
function App() {
    // Estados que controlam a aplicação inteira
    const [appState, setAppState] = useState('loading'); // loading, landing, login, app
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    
    // Este 'useEffect' roda uma vez e fica ouvindo por mudanças no login/logout
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const userDocRef = doc(db, "users", currentUser.uid);
                const userDoc = await getDoc(userDocRef);
                
                if (userDoc.exists()) {
                    setUserData(userDoc.data());
                    setShowDetailsModal(false);
                    setAppState('app');
                } else {
                    setShowDetailsModal(true);
                    setAppState('app');
                }
            } else {
                setUser(null);
                setUserData(null);
                setAppState('landing');
            }
        });
        
        return () => unsubscribe();
    }, []);

    // Função para salvar os detalhes do novo usuário no Firestore
    const handleSaveUserDetails = async ({ nome, dataNasc }) => {
        if (user) {
            const userDocRef = doc(db, "users", user.uid);
            const newUserData = { email: user.email, nome, dataNasc, plano: "gratuito", isAdmin: false };
            await setDoc(userDocRef, newUserData);
            setUserData(newUserData);
            setShowDetailsModal(false);
        }
    };

    // Função de logout que será passada para o Header
    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Erro ao fazer logout:", error);
        }
    };

    // Lógica principal para decidir qual tela mostrar
    switch (appState) {
        case 'loading':
            return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><Spinner /></div>;
        case 'landing':
            return <LandingPage onEnterClick={() => setAppState('login')} />;
        case 'login':
            return <LoginPage onBackToHomeClick={() => setAppState('landing')} />;
        case 'app':
            if (showDetailsModal) {
                 return <UserDetailsModal onSave={handleSaveUserDetails} />;
            }
            if (user && userData) {
                 return <AppLayout user={user} userData={userData} onLogout={handleLogout} />;
            }
            // Mostra o spinner enquanto os dados do usuário estão sendo carregados do Firestore
            return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><Spinner /></div>;
        default:
            return <LandingPage onEnterClick={() => setAppState('login')} />;
    }
}

export default App;