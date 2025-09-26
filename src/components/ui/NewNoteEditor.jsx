// src/components/ui/NewNoteEditor.jsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { doc, getDoc, updateDoc, addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import numerologyEngine from '../../services/numerologyEngine';
import { XIcon, CheckIcon } from './Icons';
import VibrationPill from './VibrationPill';
import Spinner from './Spinner'; // Importe o Spinner

const NewNoteEditor = ({ onClose, entryData, user, userData, onInfoClick }) => {
    const [localContent, setLocalContent] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false); // Novo estado para feedback de salvamento
    const [docId, setDocId] = useState(entryData?.id || null); 
    const textAreaRef = useRef(null);

    const date = entryData.date ? (entryData.date instanceof Date ? entryData.date : entryData.date.toDate()) : new
     Date();

    useEffect(() => {
        const fetchEntry = async () => {
            setIsLoading(true);
            if (entryData.id) {
                const docRef = doc(db, 'users', user.uid, 'journalEntries', entryData.id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setLocalContent(docSnap.data().content || '');
                }
            } else {
                setLocalContent(entryData.content || '');
            }
            setIsLoading(false);
        };
        fetchEntry();
    }, [entryData, user.uid]);

    useEffect(() => {
        if (!isLoading) {
            textAreaRef.current?.focus();
        }
    }, [isLoading]);
    
    // ========== FUNÇÃO DE SALVAMENTO ATUALIZADA ==========
    const handleSave = useCallback(async () => {
        if (!user?.uid || !userData?.dataNasc || isSaving) return;
        
        setIsSaving(true); // Ativa o estado de "salvando"
        
        // UI Otimista: Fecha o modal imediatamente para o usuário
        onClose();

        const dataToSave = {
            content: localContent,
            date: Timestamp.fromDate(date),
            personalDay: numerologyEngine.calculatePersonalDayForDate(date, userData.dataNasc),
            userId: user.uid,
            updatedAt: Timestamp.now(),
        };

        try {
            if (docId) {
                const docRef = doc(db, 'users', user.uid, 'journalEntries', docId);
                await updateDoc(docRef, dataToSave);
            } else {
                const collectionRef = collection(db, 'users', user.uid, 'journalEntries');
                // Não precisamos mais do newDocRef aqui, pois o componente será desmontado
                await addDoc(collectionRef, { ...dataToSave, createdAt: Timestamp.now() });
            }
            // Opcional: Adicionar um toast/notificação de sucesso aqui
        } catch (error) {
            console.error("Erro ao salvar anotação em segundo plano:", error);
            // Opcional: Adicionar um toast/notificação de erro aqui
        }
        // O setIsSaving(false) não é estritamente necessário, pois o componente já foi fechado.
    }, [docId, user, userData, date, localContent, onClose, isSaving]);
    
    const personalDay = numerologyEngine.calculatePersonalDayForDate(date, userData.dataNasc);
    const formattedDate = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                <p className="text-white">Carregando...</p>
            </div>
        );
    }
    
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in-fast">
            <div className="relative w-full max-w-2xl">
                <div className="absolute top-0 right-0 -mt-3 -mr-3 flex gap-2 z-10">
                    <button 
                        onClick={handleSave} 
                        disabled={isSaving}
                        className="bg-green-500 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center shadow-lg hover:bg-green-600 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:bg-gray-500 disabled:scale-100"
                        title="Salvar Anotação"
                    >
                        {isSaving ? <Spinner /> : <CheckIcon className="w-6 h-6" />}
                    </button>
                    <button 
                        onClick={onClose}
                        disabled={isSaving}
                        className="bg-red-500 text-white rounded-full p-2 shadow-lg hover:bg-red-600 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:bg-gray-500 disabled:scale-100"
                        title="Fechar (não salvar)"
                    >
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="bg-[#FBF3D9] rounded-lg shadow-2xl w-full h-[80vh] flex flex-col">
                    <header className="flex-shrink-0 mb-4 px-8 pt-12 pb-4 flex justify-between items-center">
                        <h2 className="text-gray-700 font-serif font-bold text-xl">{formattedDate}</h2>
                        <div onClick={() => onInfoClick(personalDay)}>
                            <VibrationPill vibrationNumber={personalDay} />
                        </div>
                    </header>
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar-light px-8 pb-8">
                        <textarea
                            ref={textAreaRef}
                            value={localContent}
                            onChange={(e) => setLocalContent(e.target.value)}
                            placeholder="Comece a escrever aqui..."
                            className="w-full h-full bg-transparent text-gray-800 placeholder-gray-500 focus:outline-none resize-none font-serif text-lg leading-relaxed"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewNoteEditor;