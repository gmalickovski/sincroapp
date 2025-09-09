import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../../services/firebase';
import { doc, updateDoc, deleteDoc, addDoc, collection, Timestamp, writeBatch } from "firebase/firestore";
import Spinner from './Spinner';
import { XIcon, TrashIcon, CheckboxIcon } from './Icons'; // Garanta que CheckboxIcon esteja em Icons.jsx
import numerologyEngine from '../../services/numerologyEngine';

const ItemDetailModal = ({ item, day, onClose }) => {
    if (!item) return null;

    const isTask = item.type === 'task';
    // Para anotações, o estado é um texto. Para tarefas, é um array de textos.
    const [content, setContent] = useState(isTask ? item.text.split('\n') : item.text);
    const [originalContent, setOriginalContent] = useState(content);
    const [isSaving, setIsSaving] = useState(false);
    const inputRefs = useRef([]);
    
    const user = auth.currentUser;
    const hasChanges = JSON.stringify(content) !== JSON.stringify(originalContent);

    const energyColors = { 1: 'bg-red-500/80', 2: 'bg-orange-500/80', 3: 'bg-yellow-500/80', 4: 'bg-lime-500/80', 5: 'bg-cyan-500/80', 6: 'bg-blue-500/80', 7: 'bg-purple-500/80', 8: 'bg-pink-500/80', 9: 'bg-teal-500/80', default: 'bg-gray-700/80' };
    const formattedDate = day.date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });

    const handleSave = async () => {
        if (!user || !hasChanges) return;
        setIsSaving(true);
        
        const collectionName = isTask ? 'tasks' : 'journalEntries';
        const fieldName = isTask ? 'text' : 'content';
        const newText = isTask ? content.join('\n') : content;
        
        const itemRef = doc(db, 'users', user.uid, collectionName, item.id);
        try {
            await updateDoc(itemRef, { [fieldName]: newText });
            onClose();
        } catch (error) {
            console.error("Erro ao atualizar:", error);
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleKeyDown = (e, index) => {
        if (!isTask) return;
        
        if (e.key === 'Enter') {
            e.preventDefault();
            const newContent = [...content.slice(0, index + 1), '', ...content.slice(index + 1)];
            setContent(newContent);
            setTimeout(() => inputRefs.current[index + 1]?.focus(), 0);
        }
        
        if (e.key === 'Backspace' && e.target.value === '' && content.length > 1) {
            e.preventDefault();
            const newContent = content.filter((_, i) => i !== index);
            setContent(newContent);
            setTimeout(() => inputRefs.current[index - 1]?.focus(), 0);
        }
    };
    
    const updateTaskLine = (text, index) => {
        const newContent = [...content];
        newContent[index] = text;
        setContent(newContent);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-gray-800 text-white p-4 sm:p-6 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${energyColors[day.personalDay] || energyColors.default}`}>Vibração {day.personalDay}</div>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-700"><XIcon className="w-5 h-5" /></button>
                </div>
                <h2 className="text-xl font-bold capitalize mb-4">{formattedDate}</h2>

                <div className="w-full min-h-[200px] bg-gray-900/50 p-4 rounded-lg space-y-2">
                    {isTask ? (
                        content.map((line, index) => (
                            <div key={index} className="flex items-center">
                                <CheckboxIcon checked={false} />
                                <input
                                    ref={el => inputRefs.current[index] = el}
                                    type="text"
                                    value={line}
                                    onChange={e => updateTaskLine(e.target.value, index)}
                                    onKeyDown={e => handleKeyDown(e, index)}
                                    className="w-full bg-transparent focus:outline-none placeholder-gray-500 ml-3 text-sm"
                                    autoFocus={index === content.length - 1}
                                />
                            </div>
                        ))
                    ) : (
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full h-full min-h-[200px] bg-transparent focus:outline-none text-sm"
                            autoFocus
                        />
                    )}
                </div>

                <div className="flex justify-end items-center mt-6">
                    <button onClick={handleSave} disabled={!hasChanges || isSaving} className="bg-purple-600 font-bold py-2 px-6 rounded-lg hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed flex justify-center items-center w-32">
                        {isSaving ? <Spinner /> : 'Salvar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ItemDetailModal;