// /src/App.jsx

/* ==================================================================
    SUBSTITUA O CONTEÚDO DO SEU ARQUIVO POR ESTE CÓDIGO
   ================================================================== */

import React, { useState, useEffect } from 'react';
import { auth, db } from './services/firebase';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, addDoc, collection, Timestamp } from "firebase/firestore";

// --- INÍCIO DO CÓDIGO DE MIGRAÇÃO TEMPORÁRIO ---
// Passo 1: Importe a função de migração que você acabou de criar.
import { runMigration } from './migration.js'; 
// --- FIM DO CÓDIGO DE MIGRAÇÃO TEMPORÁRIO ---

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
import numerologyEngine from './services/numerologyEngine';

// Editor de Nova Anotação que é controlado pelo App.jsx
const NewNoteEditor = ({ onClose, preselectedDate, user, userData }) => {
    // ... (código do editor sem alterações)
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
                    <div className="flex justify-between items-start text-gray-600 border-b border-gray-300 pb-3 mb-3"><h3 className="text-lg font-bold capitalize">{date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}</h3><span className="text-sm font-semibold bg-gray-200/80 px-3 py-1 rounded-full text-purple-800">Vibração {personalDay}</span></div>
                    <textarea value={content} onChange={(e) => setContent(e.target.value)} className="w-full h-full bg-transparent focus:outline-none text-base resize-none" autoFocus />
                </div>
                <div className="flex justify-center mt-4"><button onClick={handleSave} disabled={isSaving || content.trim() === ''} className="text-white font-bold py-2 px-8 rounded-lg transition-colors hover:bg-white/10 disabled:text-gray-500">{isSaving ? <Spinner /> : 'Salvar Anotação'}</button></div>
            </div>
        </div>
    );
};

const AppLayout = ({ user, userData, onLogout, setEditingEntry, openNewNoteEditor }) => {
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
            case 'calendar':  return <Calendar user={user} userData={userData} setEditingEntry={setEditingEntry} openNewNoteEditor={openNewNoteEditor} />;
            case 'journal': return <Journal user={user} userData={userData} setEditingEntry={setEditingEntry} openNewNoteEditor={openNewNoteEditor} />;
            case 'tasks': return <Tasks user={user} userData={userData} setActiveView={setActiveView} />;
            case 'admin': return <AdminPanel />;
            default: return <Dashboard user={user} userData={userData} data={numerologyData} setActiveView={setActiveView} />;
        }
    };
    
    return (
        <div className="h-screen w-screen flex bg-gray-900 text-gray-200 font-sans antialiased">
            <Sidebar activeView={activeView} setActiveView={setActiveView} isAdmin={userData?.isAdmin} isMobileOpen={isMobileMenuOpen} closeMobileMenu={() => setIsMobileMenuOpen(false)} />
            <div className="flex-1 flex flex-col h-screen md:ml-20 lg:ml-64 transition-all duration-300">
                <Header user={user} onLogout={onLogout} onMenuClick={() => setIsMobileMenuOpen(true)} />
                <main className="flex-1 overflow-y-auto overflow-x-hidden">
                    {renderView()}

                    {/* --- INÍCIO DO CÓDIGO DE MIGRAÇÃO TEMPORÁRIO --- */}
                    {/* Passo 2: Adicione este botão para executar a migração. */}
                    {/* Ele só aparecerá se você for um administrador. */}
                    {userData?.isAdmin && (
                        <button 
                            onClick={runMigration} 
                            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:bg-red-700"
                        >
                            MIGRAR TEXTOS PARA O FIREBASE
                        </button>
                    )}
                    {/* --- FIM DO CÓDIGO DE MIGRAÇÃO TEMPORÁRIO --- */}

                </main>
            </div>
        </div>
    );
};

// ... (Resto do componente App, sem alterações)
function App() {
    const [appState, setAppState] = useState('loading');
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [editingEntry, setEditingEntry] = useState(null);
    const [isNewNoteEditorOpen, setIsNewNoteEditorOpen] = useState(false);
    const [preselectedDateForEditor, setPreselectedDateForEditor] = useState(null);

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
                if (user && userData) { return <AppLayout user={user} userData={userData} onLogout={handleLogout} setEditingEntry={setEditingEntry} openNewNoteEditor={openNewNoteEditor} />; }
                return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><Spinner /></div>;
            default: return <LandingPage onEnterClick={() => setAppState('login')} />;
        }
    };

    return (
        <>
            {renderAppState()}
            {editingEntry && <JournalEntryModal entry={editingEntry} onClose={handleCloseEntryModal} />}
            {isNewNoteEditorOpen && <NewNoteEditor onClose={closeNewNoteEditor} preselectedDate={preselectedDateForEditor} user={user} userData={userData} />}
        </>
    );
}

export default App;