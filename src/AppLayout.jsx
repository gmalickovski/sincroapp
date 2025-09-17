// src/AppLayout.jsx

import React, { useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import Journal from './pages/Journal';
import Tasks from './pages/Tasks';
import AdminPanel from './pages/AdminPanel';
import JournalEntryModal from './components/ui/JournalEntryModal';
import InfoModal from './components/ui/InfoModal';
import NewNoteEditor from './NewNoteEditor';
import { textosDescritivos } from './data/content';

// REMOVIDO: numerologyEngine não é mais chamado aqui

const AppLayout = ({ userData, onLogout, numerologyData }) => { // userData é a fonte da verdade
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState(null);
    const [isNewNoteEditorOpen, setIsNewNoteEditorOpen] = useState(false);
    const [preselectedDateForEditor, setPreselectedDateForEditor] = useState(null);
    const [infoModalData, setInfoModalData] = useState(null);
    const navigate = useNavigate();

    // REMOVIDO: O useEffect que calculava os dados foi movido para o App.jsx

    const handleInfoClick = (vibrationNumber) => {
        const info = textosDescritivos.diaPessoal[vibrationNumber];
        if (info) setInfoModalData({ ...info, numero: vibrationNumber });
    };

    const openNewNoteEditor = (date = null) => {
        setPreselectedDateForEditor(date);
        setIsNewNoteEditorOpen(true);
    };
    
    return (
        <div className="h-screen w-screen flex bg-gray-900 text-gray-200 font-sans antialiased">
            <Sidebar 
                isAdmin={userData?.isAdmin}
                isMobileOpen={isMobileMenuOpen} 
                closeMobileMenu={() => setIsMobileMenuOpen(false)} 
                onLogout={onLogout} 
            />
            <div className="flex-1 flex flex-col h-screen md:ml-20 lg:ml-64 transition-all duration-300">
                <Header userData={userData} onMenuClick={() => setIsMobileMenuOpen(true)} />
                <main className="flex-1 overflow-y-auto overflow-x-hidden">
                    <Routes>
                        <Route index element={<Dashboard userData={userData} data={numerologyData} setActiveView={(view) => navigate(`/app/${view}`)} />} />
                        <Route path="dashboard" element={<Dashboard userData={userData} data={numerologyData} setActiveView={(view) => navigate(`/app/${view}`)} />} />
                        <Route path="calendario" element={<Calendar userData={userData} setEditingEntry={setEditingEntry} openNewNoteEditor={openNewNoteEditor} onInfoClick={handleInfoClick} />} />
                        <Route path="diario" element={<Journal userData={userData} setEditingEntry={setEditingEntry} openNewNoteEditor={openNewNoteEditor} onInfoClick={handleInfoClick} />} />
                        <Route path="tarefas" element={<Tasks userData={userData} setActiveView={(view) => navigate(`/app/${view}`)} onInfoClick={handleInfoClick} />} />
                        {userData?.isAdmin && <Route path="admin" element={<AdminPanel />} />}
                    </Routes>
                </main>
            </div>
            
            <JournalEntryModal entry={editingEntry} onClose={() => setEditingEntry(null)} onInfoClick={handleInfoClick} />
            {isNewNoteEditorOpen && <NewNoteEditor onClose={() => setIsNewNoteEditorOpen(false)} preselectedDate={preselectedDateForEditor} user={userData} userData={userData} onInfoClick={handleInfoClick} />}
            <InfoModal info={infoModalData} onClose={() => setInfoModalData(null)} />
        </div>
    );
};

export default AppLayout;