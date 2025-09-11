// /src/App.jsx

import React, { useState, useEffect } from 'react';
import { auth, db } from './services/firebase';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, addDoc, collection, Timestamp } from "firebase/firestore";
import { textosDescritivos } from './data/content'; // Importa os textos para o InfoModal

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
import InfoModal from './components/ui/InfoModal'; // Importa o novo modal de info
import VibrationPill from './components/ui/VibrationPill'; // Importa a nova pílula
import numerologyEngine from './services/numerologyEngine';


// O componente NewNoteEditor agora recebe onInfoClick e usa a VibrationPill
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
        } catch (error) {
            console.error("Erro ao salvar anotação:", error);
        } finally {
            setIsSaving(false);
        }
    };
    
    const date = preselectedDate || new Date();
    const personalDay = numerologyEngine.calculatePersonalDayForDate(date, userData.dataNasc);

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center z-50 animate-fade-in p-4" onClick={onClose}>
            <div className="w-full max-w-3xl relative" onClick={e => e.stopPropagation()}>
                <div className="journal-paper shadow-2xl h-[70vh] flex flex-col">
                    <div className="flex justify-between items-start text-gray-600 border-b border-gray-300 pb-3 mb-3">
                        <h3 className="text-lg font-bold capitalize">{date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}</h3>
                        {/* MODIFICADO: Usa a VibrationPill interativa */}
                        <VibrationPill vibrationNumber={personalDay} onClick={onInfoClick} />
                    </div>
                    <textarea value={content} onChange={(e) => setContent(e.target.value)} className="w-full h-full bg-transparent focus:outline-none text-base resize-none" autoFocus />
                </div>
                <div className="flex justify-center mt-4"><button onClick={handleSave} disabled={isSaving || content.trim() === ''} className="text-white font-bold py-2 px-8 rounded-lg transition-colors hover:bg-white/10 disabled:text-gray-500">{isSaving ? <Spinner /> : 'Salvar Anotação'}</button></div>
            </div>
        </div>
    );
};

const AppLayout = ({ user, userData, onLogout, setEditingEntry, openNewNoteEditor, onInfoClick }) => {
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
        // Passa a função onInfoClick para todos os componentes que podem ter uma pílula
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
            <Sidebar activeView={activeView} setActiveView={setActiveView} isAdmin={userData?.isAdmin} isMobileOpen={isMobileMenuOpen} closeMobileMenu={() => setIsMobileMenuOpen(false)} />
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
    const [editingEntry, setEditingEntry] = useState(null);
    const [isNewNoteEditorOpen, setIsNewNoteEditorOpen] = useState(false);
    const [preselectedDateForEditor, setPreselectedDateForEditor] = useState(null);

    // NOVO: Estado para controlar o modal de informações de vibração
    const [infoModalData, setInfoModalData] = useState(null);

    // NOVO: Função que a VibrationPill vai chamar
    const handleInfoClick = (vibrationNumber) => {
        const info = textosDescritivos.diaPessoal[vibrationNumber];
        if (info) {
            setInfoModalData({ ...info, numero: vibrationNumber });
        }
    };

    // NOVO: Função para fechar o modal de informações
    const closeInfoModal = () => {
        setInfoModalData(null);
    };

    const openNewNoteEditor = (date = null) => {
        setPreselectedDateForEditor(date);
        setIsNewNoteEditorOpen(true);
    };

    const closeNewNoteEditor = () => {
        setIsNewNoteEditorOpen(false);
        setPreselectedDateForEditor(null);
    };

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
    
    const handleCloseEntryModal = () => {
        setEditingEntry(null);
    };

    const renderAppState = () => {
        switch (appState) {
            case 'loading': return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><Spinner /></div>;
            case 'landing': return <LandingPage onEnterClick={() => setAppState('login')} />;
            case 'login': return <LoginPage onBackToHomeClick={() => setAppState('landing')} />;
            case 'app':
                if (showDetailsModal) { return <UserDetailsModal onSave={handleSaveUserDetails} />; }
                if (user && userData) { return <AppLayout user={user} userData={userData} onLogout={handleLogout} setEditingEntry={setEditingEntry} openNewNoteEditor={openNewNoteEditor} onInfoClick={handleInfoClick} />; }
                return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><Spinner /></div>;
            default: return <LandingPage onEnterClick={() => setAppState('login')} />;
        }
    };

    return (
        <>
            {renderAppState()}

            {/* Modais existentes */}
            <JournalEntryModal entry={editingEntry} onClose={handleCloseEntryModal} onInfoClick={handleInfoClick} />
            {isNewNoteEditorOpen && <NewNoteEditor onClose={closeNewNoteEditor} preselectedDate={preselectedDateForEditor} user={user} userData={userData} onInfoClick={handleInfoClick} />}

            {/* O novo InfoModal é renderizado aqui, no topo de tudo */}
            <InfoModal info={infoModalData} onClose={closeInfoModal} />
        </>
    );
}

export default App;