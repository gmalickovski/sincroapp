import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../services/firebase';
import { collection, onSnapshot, query, where, Timestamp } from "firebase/firestore";
import numerologyEngine from '../services/numerologyEngine';
import { ChevronLeft, ChevronRight, BookIcon, CheckSquareIcon, PlusIcon, CalendarIcon } from '../components/ui/Icons';
import VibrationPill from '../components/ui/VibrationPill';
import TaskModal from '../components/ui/TaskModal';

const FloatingActionButton = ({ onNewTask, onNewNote }) => {
    const [isOpen, setIsOpen] = useState(false);
    const secondaryButtonClasses = "w-12 h-12 rounded-full bg-white/10 border border-white/20 backdrop-blur-lg text-purple-300 flex items-center justify-center shadow-lg transition-all duration-200 ease-out";
    const mainButtonClasses = `fixed bottom-6 right-6 flex items-center justify-center bg-purple-600 text-white rounded-full p-4 shadow-lg hover:bg-purple-700 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-purple-500 z-30`;
    const mainButtonIconClasses = `transition-transform duration-300 ${isOpen ? 'rotate-45' : 'rotate-0'}`;

    return (
        <div className="fixed bottom-6 right-6 lg:hidden z-20">
            <div className="relative flex flex-col items-center gap-3">
                <div 
                    className={`flex flex-col items-center gap-3 transition-all duration-300 ${isOpen ? 'opacity-100 -translate-y-20' : 'opacity-0 translate-y-0 pointer-events-none'}`}
                    style={{transitionDelay: isOpen ? '0ms' : '100ms'}}
                >
                    <button onClick={() => { onNewNote(); setIsOpen(false); }} className={secondaryButtonClasses} title="Nova Anotação">
                        <BookIcon className="w-6 h-6" />
                    </button>
                    <button onClick={() => { onNewTask(); setIsOpen(false); }} className={secondaryButtonClasses} title="Nova Tarefa">
                        <CheckSquareIcon className="w-6 h-6" />
                    </button>
                </div>
                <button onClick={() => setIsOpen(!isOpen)} className={mainButtonClasses}>
                    <PlusIcon className={`w-6 h-6 ${mainButtonIconClasses}`} />
                </button>
            </div>
        </div>
    );
};

const DayDetailPanel = ({ selectedDay, onOpenTaskModal, openNewNoteEditor, setEditingEntry, onInfoClick, isMobile = false, showActionButtons = false }) => {
    if (!selectedDay && !isMobile) {
        return (
            <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-6 h-full flex flex-col items-center justify-center text-center">
                <CalendarIcon className="w-16 h-16 text-gray-600 mb-4" />
                <h2 className="text-lg font-bold text-gray-400">Selecione um dia</h2>
                <p className="text-sm text-gray-500">Escolha uma data no calendário para ver os detalhes.</p>
            </div>
        );
    }
    
    if (!selectedDay) return null;

    const { date, items, personalDay } = selectedDay;
    
    const formattedDate = `${date.toLocaleString('pt-BR', { weekday: 'long' })} - Dia ${date.getDate()}`;
        
    const taskListItem = useMemo(() => { if (items.tasks.length === 0) return null; const completedCount = items.tasks.filter(t => t.completed).length; return { id: 'task-list-summary', type: 'task_list', text: 'Foco do Dia', progress: `${completedCount}/${items.tasks.length}` }; }, [items.tasks]);
    const allItems = [taskListItem, ...items.journal.map(j => ({...j, text: j.content}))].filter(Boolean);
    const hasItems = allItems.length > 0;

    const DetailItem = ({ item, onClick }) => {
        const icon = item.type === 'task_list' ? <CheckSquareIcon className="w-5 h-5 text-purple-300 flex-shrink-0" /> : <BookIcon className="w-5 h-5 text-cyan-300 flex-shrink-0" />;
        return (
            <button onClick={onClick} className="w-full flex items-center gap-4 text-sm text-gray-300 bg-gray-900/50 p-3 rounded-lg animate-fade-in hover:bg-gray-700/80 transition-colors text-left active:bg-gray-700">
                {icon}
                <span className="flex-1 line-clamp-2 break-all font-medium">{item.text}</span>
                {item.type === 'task_list' && <span className="text-xs font-bold text-gray-400 flex-shrink-0">{item.progress}</span>}
            </button>
        );
    };

    const containerClasses = isMobile 
        ? "border-t border-gray-700"
        : "bg-gray-800/30 border border-gray-700/50 rounded-2xl h-full";

    return (
        <div className={`flex flex-col h-full ${containerClasses}`}>
            <div className="px-4 pt-4 flex-shrink-0">
                <div className="flex items-center justify-between gap-3">
                    <h2 className="text-xl font-bold capitalize">{formattedDate}</h2>
                    <VibrationPill vibrationNumber={personalDay} onClick={() => onInfoClick(personalDay)} />
                </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-3 min-h-0">
                {hasItems ? (
                    allItems.map(item => (
                        <DetailItem 
                            key={item.id} 
                            item={item} 
                            onClick={item.type === 'task_list' ? onOpenTaskModal : () => setEditingEntry(item)} 
                        />
                    ))
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-500 text-center text-sm">
                        <p>Nenhum item para este dia.</p>
                    </div>
                )}
            </div>

            {showActionButtons && (
                <div className="p-4 border-t border-gray-700/50 flex-shrink-0 space-y-2">
                    <button onClick={onOpenTaskModal} className="w-full bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
                        <PlusIcon className="w-4 h-4" /> Tarefas do Dia
                    </button>
                    <button onClick={() => openNewNoteEditor(date)} className="w-full bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-700 transition-colors flex items-center justify-center gap-2">
                        <PlusIcon className="w-4 h-4" /> Nova Anotação
                    </button>
                </div>
            )}
        </div>
    );
};

const DayCellGrid = ({ day, isSelected, onClick }) => {
    if (day.empty) return <div className="rounded-lg bg-transparent min-h-10 md:min-h-16"></div>;

    const energyClasses = { 1: { border: 'border-red-500', bg: 'bg-red-500/10', text: 'text-red-300' }, 2: { border: 'border-orange-500', bg: 'bg-orange-500/10', text: 'text-orange-300' }, 3: { border: 'border-yellow-500', bg: 'bg-yellow-500/10', text: 'text-yellow-300' }, 4: { border: 'border-lime-500', bg: 'bg-lime-500/10', text: 'text-lime-300' }, 5: { border: 'border-cyan-500', bg: 'bg-cyan-500/10', text: 'text-cyan-300' }, 6: { border: 'border-blue-500', bg: 'bg-blue-500/10', text: 'text-blue-300' }, 7: { border: 'border-purple-500', bg: 'bg-purple-500/10', text: 'text-purple-300' }, 8: { border: 'border-pink-500', bg: 'bg-pink-500/10', text: 'text-pink-300' }, 9: { border: 'border-teal-500', bg: 'bg-teal-500/10', text: 'text-teal-300' }, 11: { border: 'border-violet-400', bg: 'bg-violet-400/10', text: 'text-violet-300' }, 22: { border: 'border-indigo-400', bg: 'bg-indigo-400/10', text: 'text-indigo-300' }, default: { border: 'border-gray-700', bg: 'bg-gray-800/50', text: 'text-gray-300' } };
    const currentEnergy = energyClasses[day.personalDay] || energyClasses.default;
    const hasTasks = day.items.tasks.length > 0;
    const hasJournal = day.items.journal.length > 0;
    
    const cellClasses = `rounded-lg flex flex-col relative border transition-all duration-200 cursor-pointer overflow-hidden group min-h-10 md:min-h-16 ${isSelected ? `border-2 ${currentEnergy.border} ${currentEnergy.bg} scale-105 shadow-lg` : `border-gray-700/50 bg-gray-800/30 hover:bg-gray-700/50`}`;
    
    return ( 
        <div onClick={onClick} className={cellClasses}> 
            <div className={`p-1.5 text-xs sm:text-sm font-bold flex-shrink-0 ${isSelected ? currentEnergy.text : (day.isToday ? 'text-purple-300' : 'text-gray-300')}`}>{day.date.getDate()}</div> 
            <div className="flex-1 flex flex-col justify-start px-1.5 pb-1.5 pt-0.5 gap-1 sm:gap-1.5 overflow-hidden">
                {hasTasks && ( <div className="h-1.5 sm:h-2 w-full bg-blue-400 rounded-full opacity-90" title="Contém tarefas"></div> )}
                {hasJournal && ( <div className="h-1.5 sm:h-2 w-full bg-cyan-400 rounded-full opacity-90" title="Contém anotação"></div> )}
            </div>
        </div> 
    );
};

const Calendar = ({ user, userData, openNewNoteEditor, setEditingEntry, onInfoClick, taskUpdater }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [monthData, setMonthData] = useState({ journalEntries: [], tasks: [] });
    const [selectedDay, setSelectedDay] = useState(null);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    
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

    const changeMonth = (amount) => { setSelectedDay(null); setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + amount, 1)); };
    const handleDayClick = (day) => { if (day.empty) return; setSelectedDay(day); };
    const handleOpenTaskModal = () => { if (!selectedDay) return; setIsTaskModalOpen(true); };
    
    const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
    const commonPanelProps = { selectedDay, onOpenTaskModal: handleOpenTaskModal, openNewNoteEditor, setEditingEntry, onInfoClick, taskUpdater };

    return (
        <>
            <TaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} dayData={{date: selectedDay?.date, tasks: selectedDay?.items.tasks}} userData={userData} taskUpdater={taskUpdater} onInfoClick={onInfoClick} />
            
            {/* --- MUDANÇA FINAL APLICADA ---
              - O container principal agora tem w-full e padding.
              - O container do grid foi simplificado e usa uma proporção flexível para as colunas.
            */}
            <div className="p-4 md:p-6 h-full w-full">
                <div className="max-w-6xl mx-auto lg:grid lg:grid-cols-[1fr_auto] lg:gap-8">
                    
                    <div className="flex flex-col lg:col-span-1 min-h-0 h-full">
                        
                        <div>
                            <div className="flex justify-between items-center mb-4 gap-4">
                                <h1 className="text-xl sm:text-3xl font-bold text-white capitalize">
                                    {`${currentDate.toLocaleString('pt-BR', { month: 'long' })}, ${currentDate.getFullYear()}`}
                                </h1>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-700"><ChevronLeft/></button>
                                    <button onClick={() => { setCurrentDate(new Date()); setSelectedDay(null); }} className="text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-700">Hoje</button>
                                    <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-700"><ChevronRight/></button>
                                </div>
                            </div>
                            <div className="grid grid-cols-7 gap-1 text-center font-semibold text-gray-400 mb-2 flex-shrink-0">{weekDays.map((day, i) => <div key={i} className="text-xs sm:text-base">{day}</div>)}</div>
                            <div className="grid grid-cols-7 gap-1 sm:gap-2">
                               {daysInMonth.map(day => (<DayCellGrid key={day.key} day={day} isSelected={selectedDay?.key === day.key} onClick={() => handleDayClick(day)} />))}
                            </div>
                        </div>
                        
                        <div className="lg:hidden mt-4 flex-1 min-h-0">
                           <DayDetailPanel {...commonPanelProps} isMobile={true} showActionButtons={false} />
                        </div>
                    </div>

                    <div className="hidden lg:flex lg:col-span-1 h-full">
                        <DayDetailPanel {...commonPanelProps} isMobile={false} showActionButtons={true} />
                    </div>
                </div>
            </div>
            
            <FloatingActionButton 
                onNewTask={handleOpenTaskModal}
                onNewNote={() => openNewNoteEditor(selectedDay?.date || new Date())}
            />
        </>
    );
};
export default Calendar;