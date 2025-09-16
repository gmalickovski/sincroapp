// src/NewNoteEditor.jsx

import React, { useState } from 'react';
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { db } from './services/firebase';
import numerologyEngine from './services/numerologyEngine';
import Spinner from './components/ui/Spinner';
import VibrationPill from './components/ui/VibrationPill';

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
        } catch (error) { console.error("Erro:", error); } 
        finally { setIsSaving(false); }
    };

    const date = preselectedDate || new Date();
    const personalDay = numerologyEngine.calculatePersonalDayForDate(date, userData.dataNasc);

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center z-50 animate-fade-in p-4" onClick={onClose}>
            <div className="w-full max-w-3xl relative" onClick={e => e.stopPropagation()}>
                <div className="journal-paper shadow-2xl h-[70vh] flex flex-col">
                    <div className="flex justify-between items-start text-gray-600 border-b border-gray-300 pb-3 mb-3">
                        <h3 className="text-lg font-bold capitalize">{date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}</h3>
                        <VibrationPill vibrationNumber={personalDay} onClick={onInfoClick} />
                    </div>
                    <textarea value={content} onChange={(e) => setContent(e.target.value)} className="w-full h-full bg-transparent focus:outline-none text-base resize-none" autoFocus />
                </div>
                <div className="flex justify-center mt-4">
                    <button onClick={handleSave} disabled={isSaving || content.trim() === ''} className="text-white font-bold py-2 px-8 rounded-lg transition-colors hover:bg-white/10 disabled:text-gray-500">
                        {isSaving ? <Spinner /> : 'Salvar Anotação'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewNoteEditor;