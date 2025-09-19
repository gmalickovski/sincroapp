// src/components/ui/NewNoteEditor.jsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { addDoc, updateDoc, collection, doc, Timestamp } from "firebase/firestore";
import { db } from '../../services/firebase';
import numerologyEngine from '../../services/numerologyEngine';
import Spinner from './Spinner';
import VibrationPill from './VibrationPill';
import { XIcon, CheckCircleIcon } from './Icons';

// Hook customizado para debouncing
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
        return () => { clearTimeout(handler); };
    }, [value, delay]);
    return debouncedValue;
}

const NewNoteEditor = ({ onClose, entryData, user, userData, onInfoClick }) => {
    const isEditing = !!entryData?.id;
    const [content, setContent] = useState(entryData?.content || '');
    const [docId, setDocId] = useState(entryData?.id || null);
    const [status, setStatus] = useState('Salvo');
    const initialContentRef = useRef(entryData?.content || '');
    const debouncedContent = useDebounce(content, 1500);

    const handleSave = useCallback(async (textToSave) => {
        if (textToSave.trim() === '' && !isEditing) return;
        if (!user?.uid || !userData?.dataNasc) return;
        setStatus('Salvando');
        const dateForNote = entryData?.createdAt?.toDate() || entryData?.date || new Date();
        const personalDayForNote = numerologyEngine.calculatePersonalDayForDate(dateForNote, userData.dataNasc);
        const data = { content: textToSave, createdAt: Timestamp.fromDate(dateForNote), personalDay: personalDayForNote };
        try {
            if (docId) {
                await updateDoc(doc(db, 'users', user.uid, 'journalEntries', docId), data);
            } else {
                const newDocRef = await addDoc(collection(db, 'users', user.uid, 'journalEntries'), data);
                setDocId(newDocRef.id);
            }
            initialContentRef.current = textToSave;
            setStatus('Salvo');
        } catch (error) { console.error("Erro ao salvar anotação:", error); setStatus('Erro'); }
    }, [docId, user, userData, entryData, isEditing]);

    useEffect(() => {
        if (debouncedContent !== initialContentRef.current) { handleSave(debouncedContent); }
    }, [debouncedContent, handleSave]);

    const handleContentChange = (e) => {
        setContent(e.target.value);
        if (status === 'Salvo') { setStatus('Editando'); }
    };

    const displayDate = entryData?.createdAt?.toDate() || entryData?.date || new Date();
    const personalDay = numerologyEngine.calculatePersonalDayForDate(displayDate, userData.dataNasc);

    const SaveStatusIndicator = () => {
        if (status === 'Salvando') return <div className="flex items-center gap-2 text-sm text-gray-500"><Spinner /><span>Salvando...</span></div>;
        if (status === 'Salvo') return <div className="flex items-center gap-2 text-sm text-green-600"><CheckCircleIcon className="w-4 h-4" /><span>Salvo</span></div>;
        if (status === 'Erro') return <span className="text-sm text-red-500">Erro ao salvar</span>;
        return <span className="text-sm text-gray-500">Editando...</span>;
    };

    // (AJUSTE) Estilo da folha de papel definido aqui, SEM as linhas
    const paperStyle = {
        backgroundColor: '#F7F4EB', // Cor de papel antigo
        lineHeight: '2', 
    };
    
    const textareaStyle = {
        lineHeight: '2',
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4" onClick={onClose}>
            <div className="w-full max-w-2xl h-[90vh] flex flex-col relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute -top-3 -right-3 p-2 rounded-full text-gray-300 bg-gray-900 border border-gray-700 hover:bg-gray-800 z-10">
                    <XIcon className="w-5 h-5" />
                </button>
                
                <div
                    style={paperStyle}
                    className="text-gray-800 font-serif p-6 sm:p-8 rounded-lg shadow-2xl flex-1 flex flex-col"
                >
                    <div className="flex justify-between items-center text-gray-600 border-b border-gray-300 pb-4 mb-4 flex-shrink-0">
                        <h3 className="text-base sm:text-lg font-bold capitalize">{displayDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}</h3>
                        <div className="flex items-center gap-4">
                            <SaveStatusIndicator />
                            <VibrationPill vibrationNumber={personalDay} onClick={onInfoClick} />
                        </div>
                    </div>
                    <textarea
                        style={textareaStyle}
                        value={content}
                        onChange={handleContentChange}
                        className="w-full h-full bg-transparent focus:outline-none text-base resize-none"
                        placeholder="Comece a escrever seus pensamentos, sentimentos ou insights do dia..."
                        autoFocus
                    />
                </div>
            </div>
        </div>
    );
};

export default NewNoteEditor;