import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../services/firebase';
import { doc, addDoc, updateDoc, collection, Timestamp } from 'firebase/firestore';
import numerologyEngine from '../../services/numerologyEngine';
import { XIcon, CheckIcon, BookOpenIcon } from './Icons'; 
import Spinner from './Spinner';
import VibrationPill from './VibrationPill';
import { journalPrompts } from '../../data/content';
import MoodSelector from './MoodSelector';

const NewNoteEditor = ({ entryData, user, userData, onClose, onInfoClick }) => {
    const [content, setContent] = useState('');
    const [mood, setMood] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const textareaRef = useRef(null);
    const isEditing = !!entryData?.id;

    // ### CORREÇÃO APLICADA AQUI ###
    // Converte o Timestamp do Firebase para um objeto Date do JavaScript.
    // Isso garante que funções como .getDate() e .toLocaleDateString() funcionem corretamente.
    const noteDate = entryData?.createdAt?.toDate ? entryData.createdAt.toDate() : (entryData?.date || new Date());

    const personalDayForPill = entryData?.personalDay || numerologyEngine.calculatePersonalDayForDate(noteDate, userData.dataNasc);

    useEffect(() => {
        if (entryData) {
            setContent(entryData.content || '');
            setMood(entryData.mood || null);
        }
        
        const timer = setTimeout(() => {
            textareaRef.current?.focus();
            if (textareaRef.current && entryData?.content) {
                const len = entryData.content.length;
                textareaRef.current.setSelectionRange(len, len);
            }
        }, 150);

        return () => clearTimeout(timer);
    }, [entryData]);

    const handleSave = async () => {
        if (!content.trim() || !user?.uid || !userData?.dataNasc || isSaving) return;
        
        setIsSaving(true);
        onClose(); 

        try {
            const dataToSave = {
                content: content.trim(),
                updatedAt: Timestamp.now(),
                mood: mood,
            };

            if (isEditing) {
                const noteRef = doc(db, 'users', user.uid, 'journalEntries', entryData.id);
                await updateDoc(noteRef, dataToSave);
            } else {
                dataToSave.personalDay = personalDayForPill;
                dataToSave.createdAt = Timestamp.fromDate(noteDate);
                const collectionRef = collection(db, 'users', user.uid, 'journalEntries');
                await addDoc(collectionRef, dataToSave);
            }
        } catch (error) {
            console.error("Erro ao salvar anotação:", error);
            alert("Sua anotação não pôde ser salva. Verifique sua conexão e tente novamente.");
        } finally {
            setIsSaving(false);
        }
    };
    
    const formattedDate = noteDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }).replace(/ De /g, ' de ');
    const promptsForToday = journalPrompts[personalDayForPill] || [];

    const handlePromptClick = (prompt) => {
        setContent(prompt + '\n\n');
        textareaRef.current?.focus();
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div 
                className="bg-gray-800 text-white w-full h-full flex flex-col shadow-2xl transition-transform duration-300 ease-out sm:rounded-2xl sm:w-full sm:max-w-2xl sm:h-[70vh]" 
                onClick={e => e.stopPropagation()}
            >
                <header className="flex justify-between items-start p-4 border-b border-gray-700 flex-shrink-0">
                    <div className="flex items-start gap-3 sm:gap-4">
                        <BookOpenIcon className="w-8 h-8 sm:w-8 sm:h-8 text-purple-300 flex-shrink-0 mt-1" />
                        <div className="flex flex-col">
                            <h2 className="text-base sm:text-lg font-bold capitalize leading-tight">{formattedDate}</h2>
                            <div className="mt-2 sm:hidden">
                                <VibrationPill 
                                    vibrationNumber={personalDayForPill} 
                                    onClick={() => onInfoClick(personalDayForPill)} 
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4 pl-2">
                        <div className="hidden sm:block">
                            <VibrationPill 
                                vibrationNumber={personalDayForPill} 
                                onClick={() => onInfoClick(personalDayForPill)} 
                            />
                        </div>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700 transition-colors">
                            <XIcon className="w-5 h-5" />
                        </button>
                    </div>
                </header>
                
                {!isEditing && !content && promptsForToday.length > 0 && (
                     <div className="p-4 border-b border-gray-700">
                         <h3 className="text-sm font-semibold text-gray-300 mb-3 text-center">Inspire-se para começar...</h3>
                         <div className="flex flex-col sm:flex-row gap-2 justify-center">
                             {promptsForToday.slice(0, 3).map((prompt, index) => (
                                 <button key={index} onClick={() => handlePromptClick(prompt)} className="text-xs text-center bg-gray-700/50 hover:bg-gray-700 transition-colors p-2 rounded-lg" >
                                     {prompt}
                                 </button>
                             ))}
                         </div>
                     </div>
                )}
                <main className="flex-1 p-4 sm:p-6 overflow-y-auto custom-scrollbar">
                    <textarea ref={textareaRef} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Escreva seus pensamentos, sentimentos e reflexões do dia aqui..." className="w-full h-full bg-transparent text-gray-200 resize-none focus:outline-none placeholder-gray-500 font-serif text-lg leading-relaxed" />
                </main>
                
                <footer className="p-4 border-t border-gray-700 flex-shrink-0 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-500 mb-2 sm:hidden text-center">Como você se sentiu hoje?</p>
                        <MoodSelector selectedMood={mood} onMoodSelect={setMood} />
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || !content.trim()}
                        className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all transform hover:scale-110"
                        aria-label="Salvar anotação"
                    >
                        {isSaving ? <Spinner /> : <CheckIcon className="w-6 h-6" />}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default NewNoteEditor;