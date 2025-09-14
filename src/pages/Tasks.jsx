// /src/pages/Tasks.jsx

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { db, auth } from '../services/firebase';
import { collection, onSnapshot, query, orderBy, doc, deleteDoc, updateDoc, Timestamp, writeBatch } from "firebase/firestore";
import Spinner from '../components/ui/Spinner';
import numerologyEngine from '../services/numerologyEngine';
import { TrashIcon, CheckboxIcon, XIcon, PlusIcon, CalendarIcon, CheckAllIcon, ChevronDownIcon } from '../components/ui/Icons';
import VibrationPill from '../components/ui/VibrationPill';

const TaskCard = ({ date, tasks, cardStatus, personalDay, onAddTask, onToggleTask, onDeleteTask, onUpdateTask, onDeleteCard, onCompleteAll, cardRef, onInfoClick }) => {
    const dateObj = new Date(date);
    dateObj.setMinutes(dateObj.getMinutes() + dateObj.getTimezoneOffset());
    const formattedDate = dateObj.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
    
    const allTasksCompleted = tasks.length > 0 && tasks.every(task => task.completed);
    
    let cardClasses = 'border-gray-700';
    if (cardStatus === 'today') { cardClasses = 'border-purple-500 shadow-lg shadow-purple-500/10'; } 
    else if (cardStatus === 'past' && !allTasksCompleted) { cardClasses = 'border-gray-700 opacity-80'; }
    
    if (allTasksCompleted) {
        cardClasses += ' opacity-50';
    }

    const newTaskInputRef = useRef(null);

    return (
        <div ref={cardRef} className={`relative bg-gray-800/50 border rounded-2xl p-4 md:p-6 w-full animate-fade-in transition-all duration-500 ${cardClasses}`}>
            <div className="flex justify-between items-start mb-4">
                <h2 className={`text-lg font-bold capitalize ${cardStatus === 'today' ? 'text-purple-300' : 'text-white'}`}>
                    {formattedDate} {cardStatus === 'today' && <span className="text-sm font-normal text-gray-400">(Hoje)</span>}
                </h2>
                <div className="flex items-center gap-3 flex-shrink-0">
                    <VibrationPill vibrationNumber={personalDay} onClick={onInfoClick} />
                    <button onClick={() => onCompleteAll(tasks)} className="text-gray-400 hover:text-green-400 transition-colors" title="Finalizar todas as tarefas do dia">
                        <CheckAllIcon className="w-5 h-5"/>
                    </button>
                    <button onClick={() => onDeleteCard(tasks)} className="text-gray-400 hover:text-red-400 transition-colors" title="Excluir todas as tarefas deste dia">
                        <XIcon className="w-5 h-5"/>
                    </button>
                </div>
            </div>
            <div className="space-y-2">
                {tasks.map((task) => (
                    <div key={task.id} className="flex items-center group">
                        <button onClick={() => onToggleTask(task)} className="flex-shrink-0"><CheckboxIcon checked={task.completed} /></button>
                        <input type="text" defaultValue={task.text} onBlur={(e) => onUpdateTask(task.id, e.target.value)} className={`flex-1 ml-3 bg-transparent focus:outline-none focus:bg-gray-800/50 rounded-md px-2 py-1 transition-all text-sm ${task.completed ? 'line-through text-gray-500' : 'text-gray-300'}`} />
                    </div>
                ))}
                <div className="flex items-center group pt-2">
                    <div className="h-5 w-5 border-2 border-gray-600 rounded flex-shrink-0"></div>
                    <input ref={newTaskInputRef} type="text" onKeyDown={(e) => { if (e.key === 'Enter' && e.target.value.trim() !== '') { e.preventDefault(); onAddTask(e.target.value, dateObj); e.target.value = ''; }}} placeholder="Adicionar tarefa e Enter" className="flex-1 ml-3 bg-transparent focus:outline-none placeholder-gray-500 text-sm" />
                </div>
            </div>
        </div>
    );
};

const getLocalDateKey = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const Tasks = ({ userData, setActiveView, onInfoClick }) => {
    const [allTasks, setAllTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showPastTasks, setShowPastTasks] = useState(false);
    const user = auth.currentUser;

    useEffect(() => {
        if (!user) { setIsLoading(false); return; }
        const q = query(collection(db, 'users', user.uid, 'tasks'), orderBy('createdAt', 'asc'));
        const unsubscribe = onSnapshot(q, (snapshot) => { setAllTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))); setIsLoading(false); });
        return () => unsubscribe();
    }, [user]);

    const groupedTasks = useMemo(() => allTasks.reduce((groups, task) => {
        const dateKey = getLocalDateKey(task.createdAt.toDate());
        if (!groups[dateKey]) groups[dateKey] = [];
        groups[dateKey].push(task);
        return groups;
    }, {}), [allTasks]);

    const handleAddTask = async (text, date) => { await addDoc(collection(db, 'users', user.uid, 'tasks'), { text, completed: false, createdAt: Timestamp.fromDate(date) }); };
    const handleToggleTask = async (task) => { await updateDoc(doc(db, 'users', user.uid, 'tasks', task.id), { completed: !task.completed }); };
    const handleUpdateTask = async (taskId, newText) => { if (newText.trim() === '') { return; } await updateDoc(doc(db, 'users', user.uid, 'tasks', taskId), { text: newText }); };
    const handleDeleteCard = async (tasksToDelete) => {
        if (tasksToDelete.length > 0 && !window.confirm("Apagar todas as tarefas deste dia? Esta ação não pode ser desfeita.")) return;
        const batch = writeBatch(db);
        tasksToDelete.forEach(task => { batch.delete(doc(db, 'users', user.uid, 'tasks', task.id)); });
        await batch.commit();
    };
    const handleCompleteAll = async (tasksToComplete) => {
        if (tasksToComplete.length === 0) return;
        const batch = writeBatch(db);
        tasksToComplete.forEach(task => {
            const taskRef = doc(db, 'users', user.uid, 'tasks', task.id);
            batch.update(taskRef, { completed: true });
        });
        await batch.commit();
    };

    const sortedDatesWithTasks = Object.keys(groupedTasks).sort((a, b) => new Date(a) - new Date(b));
    const todayKey = getLocalDateKey(new Date());
    const pastDates = sortedDatesWithTasks.filter(date => date < todayKey);
    const todayDateTasks = sortedDatesWithTasks.filter(date => date === todayKey);
    const futureDates = sortedDatesWithTasks.filter(date => date > todayKey);
    const shouldShowEmptyTodayCard = todayDateTasks.length === 0;
    
    const pastTasks = pastDates.flatMap(dateKey => groupedTasks[dateKey]);
    const hasUnfinishedPastTasks = pastTasks.some(task => !task.completed);

    const renderTaskCard = (dateKey) => {
        const dateObj = new Date(dateKey);
        dateObj.setMinutes(dateObj.getMinutes() + dateObj.getTimezoneOffset());
        const personalDay = numerologyEngine.calculatePersonalDayForDate(dateObj, userData.dataNasc);
        const cardStatus = dateKey === todayKey ? 'today' : (dateKey < todayKey ? 'past' : 'future');
        return <TaskCard key={dateKey} date={dateKey} tasks={groupedTasks[dateKey] || []} cardStatus={cardStatus} personalDay={personalDay} onAddTask={handleAddTask} onToggleTask={handleToggleTask} onUpdateTask={handleUpdateTask} onDeleteCard={handleDeleteCard} onCompleteAll={handleCompleteAll} onInfoClick={onInfoClick} />;
    }

    return (
        <>
            <div className="relative p-4 md:p-8 pt-8 text-white max-w-3xl mx-auto w-full pb-24 lg:pb-8">
                {isLoading ? <div className="flex justify-center mt-16"><Spinner /></div> : (
                    <div className="space-y-6 md:space-y-8">
                        
                        {/* BOTÃO PARA MOSTRAR/ESCONDER DIAS ANTERIORES */}
                        {pastDates.length > 0 && (
                            <div className="text-center border-b border-gray-700 pb-6">
                                <button
                                    onClick={() => setShowPastTasks(!showPastTasks)}
                                    className="text-sm font-semibold text-gray-400 hover:text-white transition-colors flex items-center gap-2 mx-auto"
                                >
                                    <span>{showPastTasks ? 'Esconder dias anteriores' : `Mostrar ${pastDates.length} dias anteriores`}</span>
                                    <ChevronDownIcon className={`w-5 h-5 transition-transform ${showPastTasks ? 'rotate-180' : ''}`} />
                                </button>
                            </div>
                        )}

                        {/* SEÇÃO RECOLHÍVEL PARA TAREFAS PASSADAS */}
                        {showPastTasks && (
                            <div className="space-y-6 md:space-y-8 animate-fade-in">
                                {pastDates.map(dateKey => renderTaskCard(dateKey))}
                            </div>
                        )}

                        {/* AVISO DE TAREFAS PENDENTES (SEMPRE VISÍVEL, QUANDO NECESSÁRIO) */}
                        {hasUnfinishedPastTasks && !showPastTasks && (
                            <div className="text-center p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-sm text-amber-300 animate-fade-in">
                                Você tem tarefas passadas não finalizadas.
                            </div>
                        )}

                        {/* CARD DE HOJE */}
                        {todayDateTasks.map(dateKey => renderTaskCard(dateKey))}
                        {shouldShowEmptyTodayCard && renderTaskCard(dateKey)}
                        
                        {/* BOTÃO DE PLANEJAR NOVO DIA */}
                        <button onClick={() => setActiveView('calendar')} className="hidden lg:flex flex-col gap-2 border-2 border-dashed border-gray-700 rounded-2xl p-4 w-full items-center justify-center text-gray-400 h-24 hover:bg-gray-800/50 hover:border-purple-500 hover:text-white transition-all">
                            <CalendarIcon className="w-8 h-8"/><span className="font-semibold">Planejar um novo dia</span>
                        </button>
                        
                        {/* CARDS FUTUROS */}
                        {futureDates.map(dateKey => renderTaskCard(dateKey))}
                    </div>
                )}
            </div>
            
            <button onClick={() => setActiveView('calendar')} className="fixed bottom-6 right-6 bg-purple-600 text-white rounded-full p-4 shadow-lg hover:bg-purple-700 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-purple-500 z-20 lg:hidden" aria-label="Planejar no Calendário">
                <CalendarIcon className="w-6 h-6" />
            </button>
        </>
    );
};
export default Tasks;