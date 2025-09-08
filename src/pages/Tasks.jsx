import React, { useState, useEffect, useMemo, useRef } from 'react';
import { db, auth } from '../services/firebase';
import { collection, addDoc, onSnapshot, query, where, orderBy, doc, deleteDoc, updateDoc, Timestamp, writeBatch } from "firebase/firestore";
import Spinner from '../components/ui/Spinner';
import numerologyEngine from '../services/numerologyEngine';
import { TrashIcon, CheckboxIcon, XIcon, PlusIcon } from '../components/ui/Icons';
import AddNewDayModal from '../components/ui/AddNewDayModal';

// --- Componente do Card de Tarefas para um Dia Específico ---
const TaskCard = ({ date, tasks, cardStatus, personalDay, onAddTask, onToggleTask, onDeleteTask, onUpdateTask, onDeleteCard, cardRef }) => {
    const dateObj = new Date(date.replace(/-/g, '/'));
    const formattedDate = dateObj.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
    const energyColors = { 1: 'bg-red-500 text-white', 2: 'bg-orange-500 text-white', 3: 'bg-yellow-500 text-black', 4: 'bg-lime-500 text-black', 5: 'bg-cyan-500 text-black', 6: 'bg-blue-500 text-white', 7: 'bg-purple-500 text-white', 8: 'bg-pink-500 text-white', 9: 'bg-teal-500 text-white', default: 'bg-gray-700 text-white' };

    let cardClasses = 'border-gray-700';
    if (cardStatus === 'today') {
        cardClasses = 'border-purple-500 shadow-lg shadow-purple-500/10';
    } else if (cardStatus === 'past') {
        cardClasses = 'border-gray-700 opacity-60';
    }

    const taskInputRefs = useRef([]);
    const newTaskInputRef = useRef(null);

    useEffect(() => {
        taskInputRefs.current = taskInputRefs.current.slice(0, tasks.length);
    }, [tasks]);

    const handleTaskKeyDown = (e, index) => {
        const { key, currentTarget } = e;
        if (key === 'ArrowUp' && index > 0) { e.preventDefault(); taskInputRefs.current[index - 1]?.focus(); }
        if (key === 'ArrowDown') { e.preventDefault(); if (index < tasks.length - 1) { taskInputRefs.current[index + 1]?.focus(); } else { newTaskInputRef.current?.focus(); }}
        if (key === 'Backspace' && currentTarget.value === '') { e.preventDefault(); onDeleteTask(tasks[index].id); if (index > 0) { setTimeout(() => taskInputRefs.current[index - 1]?.focus(), 0); } }
    };

    const handleNewTaskKeyDown = (e) => {
        if (e.key === 'Enter' && e.target.value.trim() !== '') { e.preventDefault(); onAddTask(e.target.value, dateObj); e.target.value = ''; }
        if (e.key === 'ArrowUp' && tasks.length > 0) { e.preventDefault(); taskInputRefs.current[tasks.length - 1]?.focus(); }
    };

    return (
        <div ref={cardRef} className={`relative bg-gray-800/50 border rounded-2xl p-4 md:p-6 w-full animate-fade-in transition-opacity duration-500 ${cardClasses}`}>
            <div className="flex justify-between items-start mb-4">
                <h2 className={`text-lg font-bold capitalize ${cardStatus === 'today' ? 'text-purple-300' : 'text-white'}`}>{formattedDate} {cardStatus === 'today' && <span className="text-sm font-normal text-gray-400">(Hoje)</span>}</h2>
                <div className="flex items-center gap-4">
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${energyColors[personalDay] || energyColors.default}`}>Vibração {personalDay}</div>
                    <button onClick={() => onDeleteCard(tasks)} className="text-gray-500 hover:text-white transition-colors" title="Excluir todas as tarefas deste dia"><XIcon className="w-5 h-5"/></button>
                </div>
            </div>
            <div className="space-y-2">
                {tasks.map((task, index) => (
                    <div key={task.id} className="flex items-center group">
                        <button onClick={() => onToggleTask(task)} className="flex-shrink-0"><CheckboxIcon checked={task.completed} /></button>
                        <input ref={(el) => taskInputRefs.current[index] = el} type="text" defaultValue={task.text} onKeyDown={(e) => handleTaskKeyDown(e, index)} onBlur={(e) => onUpdateTask(task.id, e.target.value)} className={`flex-1 ml-3 bg-transparent focus:outline-none focus:bg-gray-800/50 rounded-md px-2 py-1 transition-all text-sm ${task.completed ? 'line-through text-gray-500' : 'text-gray-300'}`} />
                        
                        {/* BOTÃO DE EXCLUSÃO PADRONIZADO COM O ÍCONE 'X' */}
                        <button onClick={() => onDeleteTask(task.id)} className="ml-2 p-1 rounded-md text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-colors" title="Excluir tarefa">
                            <XIcon className="h-4 w-4" />
                        </button>
                    </div>
                ))}
                <div className="flex items-center group pt-2">
                    <div className="h-5 w-5 border-2 border-gray-600 rounded flex-shrink-0"></div>
                    <input ref={newTaskInputRef} type="text" onKeyDown={handleNewTaskKeyDown} placeholder="Adicionar tarefa e Enter" className="flex-1 ml-3 bg-transparent focus:outline-none placeholder-gray-500 text-sm" />
                </div>
            </div>
        </div>
    );
};

// --- Página Principal de Tarefas ---
const Tasks = ({ userData }) => {
    const [allTasks, setAllTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const user = auth.currentUser;
    const todayCardRef = useRef(null);

    useEffect(() => {
        if (!user) { setIsLoading(false); return; }
        const q = query(collection(db, 'users', user.uid, 'tasks'), orderBy('createdAt', 'asc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setAllTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setIsLoading(false);
        }, (error) => { console.error("Erro ao buscar tarefas:", error); setIsLoading(false); });
        return () => unsubscribe();
    }, [user]);

    useEffect(() => {
        if (!isLoading && todayCardRef.current) {
            todayCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [isLoading, allTasks]);

    const groupedTasks = useMemo(() => {
        return allTasks.reduce((groups, task) => {
            const dateKey = task.createdAt.toDate().toISOString().split('T')[0];
            if (!groups[dateKey]) groups[dateKey] = [];
            groups[dateKey].push(task);
            return groups;
        }, {});
    }, [allTasks]);

    const handleAddTask = async (text, date) => { await addDoc(collection(db, 'users', user.uid, 'tasks'), { text, completed: false, createdAt: Timestamp.fromDate(date) }); };
    const handleToggleTask = async (task) => { await updateDoc(doc(db, 'users', user.uid, 'tasks', task.id), { completed: !task.completed }); };
    const handleDeleteTask = async (taskId) => { await deleteDoc(doc(db, 'users', user.uid, 'tasks', taskId)); };
    const handleUpdateTask = async (taskId, newText) => { if (newText.trim() === '') { handleDeleteTask(taskId); return; } await updateDoc(doc(db, 'users', user.uid, 'tasks', taskId), { text: newText }); };
    const handleDeleteCard = async (tasksToDelete) => {
        if (tasksToDelete.length > 0 && !window.confirm("Apagar todas as tarefas deste dia?")) return;
        const batch = writeBatch(db);
        tasksToDelete.forEach(task => { batch.delete(doc(db, 'users', user.uid, 'tasks', task.id)); });
        await batch.commit();
    };

    const sortedDatesWithTasks = Object.keys(groupedTasks).filter(dateKey => groupedTasks[dateKey].length > 0).sort((a, b) => new Date(a) - new Date(b));
    const todayKey = new Date().toISOString().split('T')[0];

    return (
        <>
            <AddNewDayModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} userData={userData} />
            <div className="p-4 md:p-8 text-white max-w-3xl mx-auto w-full">
                <h1 className="text-3xl font-bold mb-8 text-center">Minhas Tarefas</h1>
                {isLoading ? <div className="flex justify-center mt-16"><Spinner /></div> : (
                    <div className="space-y-8">
                        {sortedDatesWithTasks.length > 0 ? (
                            sortedDatesWithTasks.map(dateKey => {
                                const dateObj = new Date(dateKey.replace(/-/g, '/'));
                                const personalDay = numerologyEngine.calculatePersonalDayForDate(dateObj, userData.dataNasc);
                                const isToday = dateKey === todayKey;
                                const isPast = dateKey < todayKey;
                                const cardStatus = isToday ? 'today' : (isPast ? 'past' : 'future');

                                return (
                                    <TaskCard
                                        key={dateKey}
                                        cardRef={isToday ? todayCardRef : null}
                                        date={dateKey}
                                        tasks={groupedTasks[dateKey]}
                                        cardStatus={cardStatus}
                                        personalDay={personalDay}
                                        onAddTask={handleAddTask}
                                        onToggleTask={handleToggleTask}
                                        onDeleteTask={handleDeleteTask}
                                        onUpdateTask={handleUpdateTask}
                                        onDeleteCard={handleDeleteCard}
                                    />
                                );
                            })
                        ) : (
                            <div className="text-center text-gray-400 mt-16">
                                <p className="text-lg">Sua lista de tarefas está vazia.</p>
                                <p className="mt-2">Clique no botão abaixo para começar.</p>
                            </div>
                        )}
                        <button onClick={() => setIsModalOpen(true)} className="border-2 border-dashed border-gray-700 rounded-2xl p-4 w-full flex items-center justify-center text-gray-400 h-24 hover:bg-gray-800/50 hover:border-purple-500 hover:text-white transition-all duration-300 transform hover:scale-105">
                            <PlusIcon className="w-8 h-8"/>
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default Tasks;