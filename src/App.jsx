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
import AdminPanel from './pages/AdminPanel';
import numerologyEngine from './services/numerologyEngine';

const AppLayout = ({ user, userData, onLogout }) => {
    const [activeView, setActiveView] = useState('dashboard');
    const [numerologyData, setNumerologyData] = useState(null);

    useEffect(() => {
        if (userData?.nome && userData?.dataNasc) {
            const data = numerologyEngine(userData.nome, userData.dataNasc);
            setNumerologyData(data);
        }
    }, [userData]);

    const renderView = () => {
        switch (activeView) {
            case 'dashboard': return <Dashboard data={numerologyData} />;
            case 'calendar': return <Calendar userData={userData} />;
            // AJUSTE AQUI: Passamos também o 'userData' para o Diário
            case 'journal': return <Journal user={user} userData={userData} />;
            case 'admin': return <AdminPanel />;
            default: return <Dashboard data={numerologyData} />;
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

function App() {
    const [appState, setAppState] = useState('loading');
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
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
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Erro ao fazer logout:", error);
        }
    };

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
            return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><Spinner /></div>;
        default:
            return <LandingPage onEnterClick={() => setAppState('login')} />;
    }
}

export default App;