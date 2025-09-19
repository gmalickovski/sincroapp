// src/pages/Calendar.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../services/firebase';
import { collection, onSnapshot, query, where, Timestamp } from "firebase/firestore";
import numerologyEngine from '../services/numerologyEngine';
import { ChevronLeft, ChevronRight, BookIcon, CheckSquareIcon, PlusIcon } from '../components/ui/Icons';
import VibrationPill from '../components/ui/VibrationPill';
import TaskModal from '../components/ui/TaskModal';

// (RESTAURADO) Painel Lateral com design "clean"
const DetailPanel = ({ selectedDay, onOpenTaskModal, openNewNoteEditor, setEditingEntry, onInfoClick, onClose, isMobileVisible }) => {
    if (!selectedDay) return null;

    const { date, items, personalDay } = selectedDay;
    const formattedDate = date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric' });
    
    const taskListItem = useMemo(() => {
        if (items.tasks.length === 0) return null;
        const completedCount = items.tasks.filter(t => t.completed).length;
        return { id: 'task-list-summary', type: 'task_list', text: 'Lista de Tarefas', progress: `${completedCount}/${items.tasks.length}` };
    }, [items.tasks]);

    const hasItems = taskListItem || items.journal.length > 0;

    const DetailItem = ({ item, onClick }) => {
        const icon = item.type === 'task_list' 
            ? <CheckSquareIcon className="w-4 h-4 text-blue-300 flex-shrink-0" /> 
            : <BookIcon className="w-4 h-4 text-cyan-300 flex-shrink-0" />;
        return (
            <button onClick={onClick} className="w-full flex items-center gap-3 text-sm text-gray-300 bg-gray-900/50 p-3 rounded-lg animate-fade-in hover:bg-gray-700 transition-colors text-left">
                {icon}
                <span className="flex-1 truncate">{item.text}</span>
                {item.type === 'task_list' && <span className="text-xs text-gray-400 flex-shrink-0">{item.progress}</span>}
            </button>
        );
    };

    const PanelContent = () => (
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-4 h-full flex flex-col">
            <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="text-xl font-bold capitalize">{formattedDate}</h2>
                <VibrationPill vibrationNumber={personalDay} onClick={onInfoClick} />
            </div>
            <div className="space-y-2 overflow-y-auto flex-1 pr-2">
                {hasItems ? (
                    <>
                        {taskListItem && <DetailItem item={taskListItem} onClick={onOpenTaskModal} />}
                        {items.journal.map(entry => <DetailItem key={entry.id} item={entry} onClick={() => setEditingEntry(entry)} />)}
                    </>
                ) : (<p className="text-gray-500 text-sm p-3 text-center">Nenhum item para este dia.</p>)}
            </div>
            <div className="mt-4 space-y-2 shrink-0">
                 <button onClick={onOpenTaskModal} className="w-full bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
                    <CheckSquareIcon className="w-5 h-5" /> Tarefas
                </button>
                <button onClick={() => openNewNoteEditor(date)} className="w-full bg-gray-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2">
                    <BookIcon className="w-5 h-5" /> Anotação
                </button>
            </div>
        </div>
    );

    return (
        <>
            <div className="hidden lg:block lg:col-span-1 sticky top-8 self-start"><PanelContent /></div>
            <div className={`fixed inset-0 bg-black/60 z-40 transition-opacity lg:hidden ${isMobileVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
            <div className={`fixed bottom-0 left-0 right-0 max-h-[70%] z-50 transition-transform duration-300 ease-out lg:hidden ${isMobileVisible ? 'translate-y-0' : 'translate-y-full'}`}>
                <div className="bg-gray-800 border-t border-gray-700 rounded-t-2xl p-2 h-full flex flex-col">
                    <div className="w-10 h-1.5 bg-gray-600 rounded-full mx-auto my-2 shrink-0" /><PanelContent />
                </div>
            </div>
        </>
    );
};

// (ATUALIZADO) Célula do Dia com tamanho e proporção corrigidos
const DayCellGrid = ({ day, isSelected, onClick }) => {
    if (day.empty) return <div className="rounded-lg bg-gray-800/20 aspect-square"></div>;

    const energyClasses = {
        1: { border: 'border-red-500', bg: 'bg-red-500/10', text: 'text-red-300' },
        2: { border: 'border-orange-500', bg: 'bg-orange-500/10', text: 'text-orange-300' },
        3: { border: 'border-yellow-500', bg: 'bg-yellow-500/10', text: 'text-yellow-300' },
        4: { border: 'border-lime-500', bg: 'bg-lime-500/10', text: 'text-lime-300' },
        5: { border: 'border-cyan-500', bg: 'bg-cyan-500/10', text: 'text-cyan-300' },
        6: { border: 'border-blue-500', bg: 'bg-blue-500/10', text: 'text-blue-300' },
        7: { border: 'border-purple-500', bg: 'bg-purple-500/10', text: 'text-purple-300' },
        8: { border: 'border-pink-500', bg: 'bg-pink-500/10', text: 'text-pink-300' },
        9: { border: 'border-teal-500', bg: 'bg-teal-500/10', text: 'text-teal-300' },
        11: { border: 'border-violet-400', bg: 'bg-violet-400/10', text: 'text-violet-300' },
        22: { border: 'border-indigo-400', bg: 'bg-indigo-400/10', text: 'text-indigo-300' },
        default: { border: 'border-gray-700', bg: 'bg-gray-800/50', text: 'text-gray-300' }
    };

    const currentEnergy = energyClasses[day.personalDay] || energyClasses.default;
    const hasTasks = day.items.tasks.length > 0;
    const hasJournal = day.items.journal.length > 0;

    const cellClasses = `h-full rounded-lg flex flex-col relative border transition-all duration-200 cursor-pointer overflow-hidden group aspect-square
        ${isSelected ? `${currentEnergy.border} ${currentEnergy.bg}` : `border-gray-700/50 bg-gray-800/30 hover:${currentEnergy.bg}/50`}`;

    return (
        <div onClick={onClick} className={cellClasses}>
            <div className={`p-1 text-xs sm:text-sm font-bold ${isSelected ? currentEnergy.text : (day.isToday ? 'text-purple-300' : 'text-gray-300')}`}>
                {day.date.getDate()}
            </div>
            <div className="flex-1 flex justify-end items-end p-1.5 gap-1.5">
                {hasTasks && <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-blue-400" title="Contém tarefas"></div>}
                {hasJournal && <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-cyan-400" title="Contém anotação"></div>}
            </div>
        </div>
    );
};


// --- Componente Principal ---
const Calendar = ({ user, userData, openNewNoteEditor, setEditingEntry, onInfoClick, taskUpdater }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [monthData, setMonthData] = useState({ journalEntries: [], tasks: [] });
    const [selectedDay, setSelectedDay] = useState(null);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isPanelVisible, setIsPanelVisible] = useState(false);

    useEffect(() => {
        if (!user?.uid) return;
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const fetchData = (collectionName, typeName) => {
            const q = query(collection(db, 'users', user.uid, collectionName), where('createdAt', '>=', Timestamp.fromDate(startOfMonth)), where('createdAt', '<=', Timestamp.fromDate(endOfMonth)));
            return onSnapshot(q, (snapshot) => {
                const items = snapshot.docs.map(doc => ({ id: doc.id, type: typeName, ...doc.data() }));
                setMonthData(prevData => ({ ...prevData, [collectionName]: items }));
            });
        };
        const journalUnsub = fetchData('journalEntries', 'journal');
        const tasksUnsub = fetchData('tasks', 'task');
        return () => { journalUnsub(); tasksUnsub(); };
    }, [user, currentDate]);
    
    const isSameDay = (d1, d2) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
    
    const daysInMonth = useMemo(() => {
        if (!userData?.dataNasc) return [];
        const year = currentDate.getFullYear(); const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1); const lastDayOfMonth = new Date(year, month + 1, 0);
        const daysArray = [];
        for (let i = 0; i < firstDayOfMonth.getDay(); i++) { daysArray.push({ key: `empty-${i}`, empty: true }); }
        for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
            const date = new Date(year, month, i);
            const personalDay = numerologyEngine.calculatePersonalDayForDate(date, userData.dataNasc);
            daysArray.push({ key: date.toISOString(), date, personalDay, isToday: new Date().toDateString() === date.toDateString(), items: { journal: monthData.journalEntries.filter(entry => isSameDay(entry.createdAt.toDate(), date)), tasks: monthData.tasks.filter(task => isSameDay(task.createdAt.toDate(), date)) } });
        }
        return daysArray;
    }, [currentDate, userData, monthData]);
    
    useEffect(() => {
        if (daysInMonth.length > 0 && !selectedDay) { const today = daysInMonth.find(d => d.isToday); setSelectedDay(today || daysInMonth.find(d => !d.empty)); } 
        else if (selectedDay) { const updatedSelectedDay = daysInMonth.find(d => d.key === selectedDay.key); if (updatedSelectedDay) setSelectedDay(updatedSelectedDay); }
    }, [daysInMonth]);

    const changeMonth = (amount) => { setSelectedDay(null); setIsPanelVisible(false); setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + amount, 1)); };
    const handleDayClick = (day) => { if (day.empty) return; setSelectedDay(day); if (window.innerWidth < 1024) setIsPanelVisible(true); };
    const handleOpenTaskModal = () => { if (!selectedDay) return; setIsTaskModalOpen(true); setIsPanelVisible(false); };
    
    const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

    return (
        <>
            <TaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} dayData={{date: selectedDay?.date, tasks: selectedDay?.items.tasks}} userData={userData} taskUpdater={taskUpdater} onInfoClick={onInfoClick} />
            <div className="p-4 md:p-6 lg:p-8 text-white h-full flex flex-col">
                <div className="flex justify-between items-center mb-6 gap-4 flex-shrink-0">
                    <h1 className="text-3xl font-bold capitalize">{`${currentDate.toLocaleString('pt-BR', { month: 'long' })} de ${currentDate.getFullYear()}`}</h1>
                    <div className="flex items-center gap-2">
                        <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-700"><ChevronLeft/></button>
                        <button onClick={() => { setCurrentDate(new Date()); setSelectedDay(null); }} className="text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-700">Hoje</button>
                        <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-700"><ChevronRight/></button>
                    </div>
                </div>

                <div className="flex-1 lg:grid lg:grid-cols-3 md:gap-8 min-h-0">
                    <div className="lg:col-span-2 flex flex-col h-full">
                        <div className="grid grid-cols-7 gap-1 text-center font-semibold text-gray-400 mb-2">{weekDays.map((day, i) => <div key={i} className="text-xs sm:text-base">{day}</div>)}</div>
                        {/* (ATUALIZADO) A altura das linhas da grade foi removida para permitir que 'aspect-square' funcione */}
                        <div className="grid grid-cols-7 gap-2 flex-1">
                            {daysInMonth.map(day => (<DayCellGrid key={day.key} day={day} isSelected={selectedDay?.key === day.key} onClick={() => handleDayClick(day)} />))}
                        </div>
                    </div>
                    <DetailPanel selectedDay={selectedDay} onOpenTaskModal={handleOpenTaskModal} openNewNoteEditor={openNewNoteEditor} setEditingEntry={setEditingEntry} onInfoClick={onInfoClick} onClose={() => setIsPanelVisible(false)} isMobileVisible={isPanelVisible} />
                </div>
            </div>
        </>
    );
};

export default Calendar;