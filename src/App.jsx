// src/App.jsx

import React, { useState, useEffect } from 'react';
import { auth, db } from './services/firebase';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import numerologyEngine from './services/numerologyEngine';

// Componentes e Páginas da versão estável
import Spinner from './components/ui/Spinner';
import LoginPage from './pages/LoginPage';
import UserDetailsModal from './components/ui/UserDetailsModal';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';
// Adicione outras importações de páginas (Calendar, Journal, etc.) se necessário

// Este é o layout que continha a lógica de cálculo, agora dentro do App.jsx
const AppLayout = ({ user, userData, onLogout, activeView, setActiveView }) => {
    const [numerologyData, setNumerologyData] = useState(null);

    // Efeito que recalcula os dados sempre que userData mudar
    useEffect(() => {
        if (userData?.nome && userData?.dataNasc) {
            // AQUI A MÁGICA ACONTECE:
            // O nome do campo no seu UserDetailsModal é "nome", não "nomeNascimento"
            // Usamos o campo "nome" para o cálculo, como na versão estável.
            const data = numerologyEngine(userData.nome, userData.dataNasc);
            setNumerologyData(data);
        }
    }, [userData]);
    
    const renderView = () => {
        switch (activeView) {
            case 'dashboard':
                // Passa os dados calculados (numerologyData) para o Dashboard
                return <Dashboard user={user} userData={userData} data={numerologyData} setActiveView={setActiveView} />;
            // Adicione outros 'cases' para 'calendar', 'journal', etc. se necessário
            default:
                return <Dashboard user={user} userData={userData} data={numerologyData} setActiveView={setActiveView} />;
        }
    };
    
    return (
        <div className="h-screen w-screen flex bg-gray-900 text-gray-200">
            <Sidebar activeView={activeView} setActiveView={setActiveView} onLogout={onLogout} />
            <div className="flex-1 flex flex-col h-screen">
                <Header userData={userData} />
                <main className="flex-1 overflow-y-auto overflow-x-hidden">
                    {renderView()}
                </main>
            </div>
        </div>
    );
};


function App() {
    // Estados que controlam todo o fluxo do aplicativo
    const [appState, setAppState] = useState('loading'); // loading, login, app
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [activeView, setActiveView] = useState('dashboard');

    useEffect(() => {
        // Observador de autenticação do Firebase
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const userDocRef = doc(db, "users", currentUser.uid);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    // Se o usuário já existe no Firestore, carrega seus dados
                    setUserData(userDoc.data());
                    setShowDetailsModal(false);
                    setAppState('app');
                } else {
                    // Se é a primeira vez (só autenticado, sem dados no Firestore),
                    // mostra o modal para coletar nome e data de nascimento.
                    setShowDetailsModal(true);
                    setAppState('app'); // Entra no estado de 'app' para mostrar o modal
                }
            } else {
                // Se não há usuário, volta para a tela de login
                setUser(null);
                setUserData(null);
                setAppState('login');
            }
        });
        return () => unsubscribe(); // Limpa o observador
    }, []);

    // Função para salvar os dados coletados do UserDetailsModal
    const handleSaveUserDetails = async ({ nome, dataNasc }) => {
        if (user) {
            // IMPORTANTE: A data já vem no formato DD/MM/AAAA do modal antigo
            const newUserData = { 
                email: user.email, 
                nome: nome, // O campo chave é 'nome'
                dataNasc: dataNasc, // A data já está no formato correto
                plano: "gratuito", 
                isAdmin: false 
            };
            await setDoc(doc(db, "users", user.uid), newUserData);
            setUserData(newUserData);
            setShowDetailsModal(false); // Esconde o modal e o dashboard irá carregar
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        setAppState('login');
    };
    
    // Renderiza o estado correto da aplicação
    switch (appState) {
        case 'loading':
            return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><Spinner /></div>;
        case 'login':
            return <LoginPage />; // Simplificado, assumindo que a navegação para registro está dentro dele
        case 'app':
            if (showDetailsModal) {
                return <UserDetailsModal onSave={handleSaveUserDetails} />;
            }
            if (user && userData) {
                return <AppLayout user={user} userData={userData} onLogout={handleLogout} activeView={activeView} setActiveView={setActiveView} />;
            }
            // Fallback de carregamento se os dados ainda não sincronizaram
            return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><Spinner /></div>;
        default:
            return <LoginPage />;
    }
}

export default App;