import React, { useState } from 'react';
import { db, auth } from '../../services/firebase';
import { doc, updateDoc } from "firebase/firestore";
import Spinner from './Spinner';
import { XIcon } from './Icons';

const JournalEntryModal = ({ entry, onClose }) => {
    if (!entry) return null;

    const [content, setContent] = useState(entry.content);
    const [originalContent, setOriginalContent] = useState(entry.content);
    const [isSaving, setIsSaving] = useState(false);
    const user = auth.currentUser;
    const hasChanges = content !== originalContent;
    
    const formattedDate = new Date(entry.createdAt.seconds * 1000).toLocaleString('pt-BR', {
        weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
    });

    const handleSave = async () => {
        if (!user || !hasChanges || isSaving) return;
        setIsSaving(true);
        const entryRef = doc(db, 'users', user.uid, 'journalEntries', entry.id);
        try {
            await updateDoc(entryRef, { content: content });
            setOriginalContent(content); 
            setTimeout(onClose, 1000); 
        } catch (error) {
            console.error("Erro ao atualizar a anotação:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center z-50 animate-fade-in p-4" onClick={onClose}>
            <div className="w-full max-w-3xl relative" onClick={e => e.stopPropagation()}>
                {/* Folha de Papel */}
                <div className="journal-paper shadow-2xl h-[70vh] flex flex-col">
                    <div className="flex justify-between items-start text-gray-600 border-b border-gray-300 pb-3 mb-3">
                        <div className="flex-1">
                            <h3 className="text-lg font-bold capitalize">{formattedDate}</h3>
                        </div>
                        <span className="text-sm font-semibold bg-gray-200/80 px-3 py-1 rounded-full text-purple-800">Vibração {entry.personalDay}</span>
                    </div>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full h-full bg-transparent focus:outline-none text-base resize-none"
                        autoFocus
                    />
                </div>
                 {/* Botão Salvar Flutuante */}
                <div className="flex justify-center mt-4">
                    <button 
                        onClick={handleSave} 
                        disabled={!hasChanges || isSaving} 
                        className="text-white font-bold py-2 px-8 rounded-lg transition-colors hover:bg-white/10 disabled:text-gray-500 disabled:cursor-not-allowed"
                    >
                        {isSaving ? <Spinner /> : (hasChanges ? 'Salvar Alterações' : 'Salvo')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JournalEntryModal;