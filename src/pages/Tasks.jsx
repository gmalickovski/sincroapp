// /src/pages/Tasks.jsx

/* ==================================================================
    SUBSTITUA O CONTEÚDO DO SEU ARQUIVO POR ESTE CÓDIGO
   ================================================================== */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { db, auth } from '../services/firebase';
import { collection, onSnapshot, query, orderBy, doc, deleteDoc, updateDoc, Timestamp, writeBatch } from "firebase/firestore";
import Spinner from '../components/ui/Spinner';
import numerologyEngine from '../services/numerologyEngine';
import { TrashIcon, CheckboxIcon, XIcon, PlusIcon, CalendarIcon } from '../components/ui/Icons'; // Ícone de Calendário adicionado

// O componente TaskCard permanece o mesmo
const TaskCard = ({ date, tasks, cardStatus, personalDay, onAddTask, onToggleTask, onDeleteTask, onUpdateTask, onDeleteCard, cardRef }) => {
    const dateObj = new Date(date);
    dateObj.setMinutes(dateObj.getMinutes() + dateObj.getTimezoneOffset());
    const formattedDate = dateObj.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
    const energyColors = { 1: 'bg-red-500 text-white', 2: 'bg-orange-500 text-white', 3: 'bg-yellow-500 text-black', 4: 'bg-lime-500 text-black', 5: 'bg-cyan-500 text-black', 6: 'bg-blue-500 text-white', 7: 'bg-purple-500 text-white', 8: 'bg-pink-500 text-white', 9: 'bg-teal-500 text-white', default: 'bg-gray-700 text-white' };
    let cardClasses = 'border-gray-700';
    if (cardStatus === 'today') { cardClasses = 'border-purple-500 shadow-lg shadow-purple-500/10'; } 
    else if (cardStatus === 'past') { cardClasses = 'border-gray-700 opacity-60'; }
    const taskInputRefs = useRef([]);
    const newTaskInputRef = useRef(null);
    useEffect(() => { taskInputRefs.current = taskInputRefs.current.slice(0, tasks.length); }, [tasks]);
    const handleTaskKeyDown = (e, index) => {
        const { key, currentTarget } = e;
        if (key === 'ArrowUp' && index > 0) { e.preventDefault(); taskInputRefs.current[index - 1]?.focus(); } 
        else if (key === 'ArrowDown') { e.preventDefault(); if (index < tasks.length - 1) { taskInputRefs.current[index + 1]?.focus(); } else { newTaskInputRef.current?.focus(); } } 
        else if (key === 'Backspace' && currentTarget.value === '') { e.preventDefault(); const taskToDeleteId = tasks[index].id; if (index > 0) { taskInputRefs.current[index - 1]?.focus(); } onDeleteTask(taskToDeleteId); }
    };
    const handleNewTaskKeyDown = (e) => {
        if (e.key === 'Enter' && e.target.value.trim() !== '') { e.preventDefault(); onAddTask(e.target.value, dateObj); e.target.value = ''; } 
        else if (e.key === 'ArrowUp' && tasks.length > 0) { e.preventDefault(); taskInputRefs.current[tasks.length - 1]?.focus(); }
    };
    return (
        <div ref={cardRef} className={`relative bg-gray-800/50 border rounded-2xl p-4 md:p-6 w-full animate-fade-in transition-opacity duration-500 ${cardClasses}`}>
            <button onClick={() => onDeleteCard(tasks)} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors z-10" title="Excluir todas as tarefas deste dia"><XIcon className="w-5 h-5"/></button>
            <div className="mb-4"><h2 className={`text-lg font-bold capitalize pr-8 ${cardStatus === 'today' ? 'text-purple-300' : 'text-white'}`}>{formattedDate} {cardStatus === 'today' && <span className="text-sm font-normal text-gray-400">(Hoje)</span>}</h2><div className="flex items-center mt-2"><div className={`px-3 py-1 rounded-full text-xs font-bold ${energyColors[personalDay] || energyColors.default}`}>Vibração {personalDay}</div></div></div>
            <div className="space-y-2">{tasks.map((task, index) => (<div key={task.id} className="flex items-center group"><button onClick={() => onToggleTask(task)} className="flex-shrink-0"><CheckboxIcon checked={task.completed} /></button><input ref={(el) => taskInputRefs.current[index] = el} type="text" defaultValue={task.text} onKeyDown={(e) => handleTaskKeyDown(e, index)} onBlur={(e) => onUpdateTask(task.id, e.target.value)} className={`flex-1 ml-3 bg-transparent focus:outline-none focus:bg-gray-800/50 rounded-md px-2 py-1 transition-all text-sm ${task.completed ? 'line-through text-gray-500' : 'text-gray-300'}`} /><div className="flex-shrink-0 ml-2 w-8 h-8 flex items-center justify-center"><button onClick={() => onDeleteTask(task.id)} className="p-1 rounded-md text-gray-600 hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500 sm:opacity-0 group-hover:sm:opacity-100 transition-opacity" title="Excluir tarefa"><TrashIcon className="h-5 w-5" /></button></div></div>))}{<div className="flex items-center group pt-2"><div className="h-5 w-5 border-2 border-gray-600 rounded flex-shrink-0"></div><input ref={newTaskInputRef} type="text" onKeyDown={handleNewTaskKeyDown} placeholder="Adicionar tarefa e Enter" className="flex-1 ml-3 bg-transparent focus:outline-none placeholder-gray-500 text-sm" /></div>}</div>
        </div>
    );
};

const getLocalDateKey = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// MODIFICADO: Recebe a prop 'setActiveView'
const Tasks = ({ userData, setActiveView }) => {
    const [allTasks, setAllTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    // REMOVIDO: O estado do modal não é mais necessário
    // const [isModalOpen, setIsModalOpen] = useState(false);
    const [isTodayCardHidden, setIsTodayCardHidden] = useState(false);
    const user = auth.currentUser;
    const todayCardRef = useRef(null);

    useEffect(() => {
        if (!user) { setIsLoading(false); return; }
        const q = query(collection(db, 'users', user.uid, 'tasks'), orderBy('createdAt', 'asc'));
        const unsubscribe = onSnapshot(q, (snapshot) => { setAllTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))); setIsLoading(false); }, (error) => { console.error("Erro ao buscar tarefas:", error); setIsLoading(false); });
        return () => unsubscribe();
    }, [user]);

    useEffect(() => {
        if (!isLoading && todayCardRef.current) {
            todayCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [isLoading, allTasks]);

    const groupedTasks = useMemo(() => allTasks.reduce((groups, task) => {
        const dateKey = getLocalDateKey(task.createdAt.toDate());
        if (!groups[dateKey]) groups[dateKey] = [];
        groups[dateKey].push(task);
        return groups;
    }, {}), [allTasks]);

    const handleAddTask = async (text, date) => { await addDoc(collection(db, 'users', user.uid, 'tasks'), { text, completed: false, createdAt: Timestamp.fromDate(date) }); };
    const handleToggleTask = async (task) => { await updateDoc(doc(db, 'users', user.uid, 'tasks', task.id), { completed: !task.completed }); };
    const handleDeleteTask = async (taskId) => { await deleteDoc(doc(db, 'users', user.uid, 'tasks', taskId)); };
    const handleUpdateTask = async (taskId, newText) => { if (newText.trim() === '') { handleDeleteTask(taskId); return; } await updateDoc(doc(db, 'users', user.uid, 'tasks', taskId), { text: newText }); };
    
    const handleDeleteCard = async (tasksToDelete) => {
        if (tasksToDelete.length === 0) { setIsTodayCardHidden(true); return; }
        if (!window.confirm("Apagar todas as tarefas deste dia?")) return;
        const batch = writeBatch(db);
        tasksToDelete.forEach(task => { batch.delete(doc(db, 'users', user.uid, 'tasks', task.id)); });
        await batch.commit();
    };

    const sortedDatesWithTasks = Object.keys(groupedTasks).filter(dateKey => groupedTasks[dateKey].length > 0).sort((a, b) => new Date(a) - new Date(b));
    const todayKey = getLocalDateKey(new Date());
    const pastDates = sortedDatesWithTasks.filter(date => date < todayKey);
    const todayDateTasks = sortedDatesWithTasks.filter(date => date === todayKey);
    const futureDates = sortedDatesWithTasks.filter(date => date > todayKey);
    const shouldShowEmptyTodayCard = todayDateTasks.length === 0 && !isTodayCardHidden;

    const renderTaskCard = (dateKey) => {
        const dateObj = new Date(dateKey);
        dateObj.setMinutes(dateObj.getMinutes() + dateObj.getTimezoneOffset());
        const personalDay = numerologyEngine.calculatePersonalDayForDate(dateObj, userData.dataNasc);
        const isToday = dateKey === todayKey;
        const isPast = dateKey < todayKey;
        const cardStatus = isToday ? 'today' : (isPast ? 'past' : 'future');
        return <TaskCard key={dateKey} cardRef={isToday ? todayCardRef : null} date={dateKey} tasks={groupedTasks[dateKey] || []} cardStatus={cardStatus} personalDay={personalDay} onAddTask={handleAddTask} onToggleTask={handleToggleTask} onDeleteTask={handleDeleteTask} onUpdateTask={handleUpdateTask} onDeleteCard={handleDeleteCard} />;
    }

    return (
        <>
            {/* REMOVIDO: O modal não é mais chamado daqui */}
            <div className="relative p-4 md:p-8 pt-8 text-white max-w-3xl mx-auto w-full pb-24 lg:pb-8">
                {isLoading ? <div className="flex justify-center mt-16"><Spinner /></div> : (
                    <div className="space-y-6 md:space-y-8">
                        {pastDates.map(dateKey => renderTaskCard(dateKey))}
                        {todayDateTasks.map(dateKey => renderTaskCard(dateKey))}
                        {shouldShowEmptyTodayCard && renderTaskCard(todayKey)}
                        
                        {/* MODIFICADO: Este botão agora navega para o calendário e tem novo texto/ícone */}
                        <button onClick={() => setActiveView('calendar')} className="hidden lg:flex flex-col gap-2 border-2 border-dashed border-gray-700 rounded-2xl p-4 w-full items-center justify-center text-gray-400 h-24 hover:bg-gray-800/50 hover:border-purple-500 hover:text-white transition-all duration-300 transform hover:scale-105">
                            <CalendarIcon className="w-8 h-8"/>
                            <span className="font-semibold">Planejar um novo dia</span>
                        </button>
                        
                        {futureDates.map(dateKey => renderTaskCard(dateKey))}
                        {sortedDatesWithTasks.length === 0 && !shouldShowEmptyTodayCard && (
                             <div className="text-center text-gray-400 mt-16">
                                <p className="text-lg">Sua lista de tarefas está vazia.</p>
                                <p className="mt-2">Clique no botão para planejar no calendário.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
            
            {/* MODIFICADO: O botão flutuante agora navega para o calendário */}
            <button
                onClick={() => setActiveView('calendar')}
                className="fixed bottom-6 right-6 bg-purple-600 text-white rounded-full p-4 shadow-lg hover:bg-purple-700 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 z-20 lg:hidden"
                aria-label="Planejar no Calendário"
            >
                <CalendarIcon className="w-6 h-6" />
            </button>
        </>
    );
};
export default Tasks;