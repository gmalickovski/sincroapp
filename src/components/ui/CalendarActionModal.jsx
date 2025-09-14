// /src/components/ui/CalendarActionModal.jsx

import React, { useState, useEffect } from 'react';
import { BookIcon, XIcon, ChevronLeft, CheckSquareIcon, TrashIcon, CheckboxIcon } from './Icons';
import Spinner from './Spinner';
import { db, auth } from '../../services/firebase';
import { collection, addDoc, onSnapshot, query, where, orderBy, doc, deleteDoc, updateDoc, Timestamp } from "firebase/firestore";
import VibrationPill from './VibrationPill';

// MODIFICADO: Componente agora recebe a prop 'onInfoClick'
const CalendarActionModal = ({ day, onClose, initialView = 'menu', openNewNoteEditor, onInfoClick }) => {
    const [view, setView] = useState(initialView);
    const [tasks, setTasks] = useState([]);
    const [newTaskText, setNewTaskText] = useState('');
    
    const [isLoadingTasks, setIsLoadingTasks] = useState(false);
    const [isSavingTask, setIsSavingTask] = useState(false);

    const user = auth.currentUser;

    const energyColors = {
        1: 'border-red-500', 2: 'border-orange-500', 3: 'border-yellow-500',
        4: 'border-lime-500', 5: 'border-cyan-500', 6: 'border-blue-500',
        7: 'border-purple-500', 8: 'border-pink-500', 9: 'border-teal-500',
        11: 'border-violet-400', 22: 'border-indigo-400',
        default: 'border-gray-700'
    };
    
    useEffect(() => {
        if (view !== 'task' || !user) return;
        setIsLoadingTasks(true);
        const startOfDay = new Date(day.date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(day.date);
        endOfDay.setHours(23, 59, 59, 999);
        const q = query(
            collection(db, 'users', user.uid, 'tasks'),
            where('createdAt', '>=', Timestamp.fromDate(startOfDay)),
            where('createdAt', '<=', Timestamp.fromDate(endOfDay)),
            orderBy('createdAt', 'asc')
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setIsLoadingTasks(false);
        }, (error) => { console.error("Erro:", error); setIsLoadingTasks(false); });
        return () => unsubscribe();
    }, [view, day.date, user]);

    const handleAddNoteClick = () => { openNewNoteEditor(day.date); onClose(); };
    const handleSaveNewTask = async () => { if (newTaskText.trim() === '' || !user || isSavingTask) return; setIsSavingTask(true); try { await addDoc(collection(db, 'users', user.uid, 'tasks'), { text: newTaskText, completed: false, createdAt: Timestamp.fromDate(day.date) }); setNewTaskText(''); } catch (error) { console.error("Erro:", error); } finally { setIsSavingTask(false); }};
    const handleNewTaskKeyDown = (e) => { if (e.key === 'Enter') { e.preventDefault(); handleSaveNewTask(); }};
    const toggleTaskCompletion = async (task) => { if (!user) return; await updateDoc(doc(db, 'users', user.uid, 'tasks', task.id), { completed: !task.completed }); };
    const handleDeleteTask = async (taskId) => { if (!user) return; await deleteDoc(doc(db, 'users', user.uid, 'tasks', taskId)); };
    const formattedDate = day.date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

    const renderContent = () => {
        switch (view) {
            case 'task':
                return ( <div className="text-left animate-fade-in"> <div className="max-h-56 overflow-y-auto pr-2 space-y-2">{isLoadingTasks ? <div className="flex justify-center py-4"><Spinner/></div> : tasks.map(task => (<div key={task.id} className="flex items-center group"><button onClick={() => toggleTaskCompletion(task)}><CheckboxIcon checked={task.completed} /></button><span className={`flex-1 ml-3 text-sm ${task.completed ? 'line-through text-gray-500' : 'text-gray-300'}`}>{task.text}</span><button onClick={() => handleDeleteTask(task.id)} className="ml-2 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100"><TrashIcon className="h-4 w-4" /></button></div>))}</div><div className="flex items-center group pt-3 mt-3 border-t border-gray-700"><div className="h-5 w-5 border-2 border-gray-600 rounded flex-shrink-0"></div><input type="text" value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} onKeyDown={handleNewTaskKeyDown} placeholder="Adicionar nova tarefa" className="flex-1 ml-3 bg-transparent focus:outline-none placeholder-gray-500 text-sm" autoFocus /></div><button onClick={handleSaveNewTask} disabled={isSavingTask || newTaskText.trim() === ''} className="mt-4 w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg h-10 flex items-center justify-center hover:bg-blue-700 disabled:bg-gray-600">{isSavingTask ? <Spinner /> : 'Adicionar Tarefa'}</button></div> );
            default:
                return ( <div className="space-y-3 animate-fade-in"><button onClick={handleAddNoteClick} className="w-full bg-purple-600 font-bold py-3 px-4 rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2"><BookIcon className="h-5 w-5" />Adicionar Anotação</button><button onClick={() => setView('task')} className="w-full bg-blue-600 font-bold py-3 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"><CheckSquareIcon className="h-5 w-5" />Adicionar Tarefa</button></div> );
        }
    }
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className={`bg-gray-800 text-white p-6 rounded-2xl shadow-2xl w-full max-w-sm relative transition-all border-t-4 ${energyColors[day.personalDay] || energyColors.default}`} onClick={(e) => e.stopPropagation()}>
                <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-white capitalize">{formattedDate}</h3>
                    <div className="flex justify-center mt-3">
                        {/* CORREÇÃO: Passando a função onInfoClick para a prop onClick */}
                        <VibrationPill vibrationNumber={day.personalDay} onClick={onInfoClick} />
                    </div>
                </div>
                {view !== 'menu' && ( <button onClick={() => setView('menu')} className="absolute top-4 left-4 p-2 rounded-full text-gray-400 hover:bg-gray-700"><ChevronLeft className="h-5 w-5" /></button> )}
                <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:bg-gray-700"><XIcon className="h-5 w-5" /></button>
                {renderContent()}
            </div>
        </div>
    );
};
export default CalendarActionModal;