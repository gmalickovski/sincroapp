import React, { useState, useEffect } from 'react';
import { BookIcon, XIcon, ChevronLeft, CheckSquareIcon } from './Icons';
import Spinner from './Spinner';
import { db, auth } from '../../services/firebase';
import { collection, addDoc, onSnapshot, query, where, orderBy, doc, deleteDoc, updateDoc, Timestamp } from "firebase/firestore";
import numerologyEngine from '../../services/numerologyEngine';

// --- Mini Componentes Internos para o Modal ---
const CheckboxIcon = ({ checked }) => (
    <div className={`h-5 w-5 border-2 ${checked ? 'border-purple-500 bg-purple-500' : 'border-gray-500'} rounded flex-shrink-0 flex items-center justify-center cursor-pointer`}>
        {checked && <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
    </div>
);

// --- Componente Principal do Modal ---
const CalendarActionModal = ({ day, onClose, userData }) => {
    const [view, setView] = useState('menu');
    const [noteContent, setNoteContent] = useState('');
    const [tasks, setTasks] = useState([]);
    const [isLoadingTasks, setIsLoadingTasks] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const user = auth.currentUser;

    useEffect(() => {
        if (view !== 'task' || !user) return;
        setIsLoadingTasks(true);
        const startOfDay = new Date(day.date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(day.date);
        endOfDay.setHours(23, 59, 59, 999);
        const q = query(collection(db, 'users', user.uid, 'tasks'), where('createdAt', '>=', Timestamp.fromDate(startOfDay)), where('createdAt', '<=', Timestamp.fromDate(endOfDay)), orderBy('createdAt', 'asc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setIsLoadingTasks(false);
        }, (error) => {
            console.error("Erro ao buscar tarefas no modal:", error);
            setIsLoadingTasks(false);
        });
        return () => unsubscribe();
    }, [view, day.date, user]);

    const handleSaveNote = async () => {
        if (noteContent.trim() === '' || !user || !userData?.dataNasc) return;
        setIsSaving(true);
        try {
            const personalDayForNote = numerologyEngine.calculatePersonalDayForDate(day.date, userData.dataNasc);
            await addDoc(collection(db, 'users', user.uid, 'journalEntries'), { content: noteContent, createdAt: Timestamp.fromDate(day.date), personalDay: personalDayForNote });
            onClose(); 
        } catch (error) { console.error("Erro ao salvar anotação:", error); } 
        finally { setIsSaving(false); }
    };
    
    const handleAddTask = async (text) => {
        if (text.trim() === '' || !user) return;
        try { await addDoc(collection(db, 'users', user.uid, 'tasks'), { text: text, completed: false, createdAt: Timestamp.fromDate(day.date) }); } 
        catch (error) { console.error("Erro ao adicionar tarefa:", error); }
    };

    const handleTaskKeyDown = (e) => {
        if (e.key === 'Enter') { e.preventDefault(); handleAddTask(e.target.value); e.target.value = ''; }
    };
    
    const toggleTaskCompletion = async (task) => {
        if (!user) return;
        const taskDocRef = doc(db, 'users', user.uid, 'tasks', task.id);
        await updateDoc(taskDocRef, { completed: !task.completed });
    };

    const handleDeleteTask = async (taskId) => {
        if (!user) return;
        const taskDocRef = doc(db, 'users', user.uid, 'tasks', taskId);
        await deleteDoc(taskDocRef);
    };

    const formattedDate = day.date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

    const renderContent = () => {
        switch (view) {
            case 'note':
                return (
                    <div className="text-left animate-fade-in">
                        <textarea value={noteContent} onChange={(e) => setNoteContent(e.target.value)} placeholder="Escreva sua anotação..." rows="5" className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-sm" autoFocus />
                        <button onClick={handleSaveNote} disabled={isSaving || noteContent.trim() === ''} className="mt-3 w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg h-10 flex items-center justify-center">{isSaving ? <Spinner /> : 'Salvar Anotação'}</button>
                    </div>
                );
            case 'task':
                return (
                    <div className="text-left animate-fade-in max-h-64 overflow-y-auto pr-2">
                        {isLoadingTasks ? <div className="flex justify-center py-4"><Spinner/></div> :
                        <div className="space-y-2">
                            {tasks.map(task => (
                                <div key={task.id} className="flex items-center group">
                                    <button onClick={() => toggleTaskCompletion(task)}><CheckboxIcon checked={task.completed} /></button>
                                    <span className={`flex-1 ml-3 text-sm ${task.completed ? 'line-through text-gray-500' : 'text-gray-300'}`}>{task.text}</span>
                                    {/* BOTÃO DE EXCLUSÃO PADRONIZADO COM O ÍCONE 'X' */}
                                    <button onClick={() => handleDeleteTask(task.id)} className="ml-2 p-1 rounded-md text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-colors" title="Excluir tarefa">
                                        <XIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                               <div className="flex items-center group pt-2">
                                    <div className="h-5 w-5 border-2 border-gray-600 rounded flex-shrink-0"></div>
                                    <input type="text" onKeyDown={handleTaskKeyDown} placeholder="Adicionar tarefa e Enter" className="flex-1 ml-3 bg-transparent focus:outline-none placeholder-gray-500 text-sm" />
                                </div>
                        </div>
                        }
                    </div>
                );
            default:
                return (
                     <div className="space-y-3 animate-fade-in">
                         <button onClick={() => setView('note')} className="w-full bg-purple-600 font-bold py-3 px-4 rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2"><BookIcon className="h-5 w-5" />Adicionar Anotação Rápida</button>
                         <button onClick={() => setView('task')} className="w-full bg-blue-600 font-bold py-3 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"><CheckSquareIcon className="h-5 w-5" />Ver/Adicionar Tarefas</button>
                    </div>
                );
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-gray-800 text-white p-6 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-sm relative" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-3 right-3 p-2 rounded-full text-gray-400 hover:bg-gray-700"><XIcon className="h-5 w-5" /></button>
                {view !== 'menu' && (
                    <button onClick={() => setView('menu')} className="absolute top-3 left-3 p-2 rounded-full text-gray-400 hover:bg-gray-700"><ChevronLeft className="h-5 w-5" /></button>
                )}
                <span className="text-sm font-semibold text-purple-300">Vibração {day.personalDay}</span>
                <h3 className="text-xl font-bold text-white mt-1 mb-6 capitalize">{formattedDate}</h3>
                {renderContent()}
            </div>
        </div>
    );
};

export default CalendarActionModal;