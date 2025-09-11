// /src/pages/Calendar.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../services/firebase';
import { collection, onSnapshot, query, where, Timestamp, orderBy } from "firebase/firestore";
import numerologyEngine from '../services/numerologyEngine';
import { ChevronLeft, ChevronRight, BookIcon, CheckSquareIcon, PlusIcon } from '../components/ui/Icons';
import CalendarActionModal from '../components/ui/CalendarActionModal';
import VibrationPill from '../components/ui/VibrationPill';

const DetailItem = ({ item, setEditingEntry, onOpenTaskModal }) => {
    const icon = item.type === 'task' ? <CheckSquareIcon className="w-4 h-4 text-blue-300 flex-shrink-0" /> : <BookIcon className="w-4 h-4 text-cyan-300 flex-shrink-0" />;
    const handleClick = () => {
        if (item.type === 'journal') { setEditingEntry(item); } 
        else { onOpenTaskModal(); }
    };
    return ( <button onClick={handleClick} className="w-full flex items-center gap-3 text-sm text-gray-300 bg-gray-900/50 p-3 rounded-lg animate-fade-in hover:bg-gray-700 transition-colors text-left"> {icon} <span className="truncate">{item.text}</span> </button> );
};

const DesktopDetailPanel = ({ selectedDay, onOpenModal, setEditingEntry, onInfoClick }) => {
    if (!selectedDay) return null;
    const selectedDayFormatted = new Date(selectedDay.date).toLocaleString('pt-BR', { day: 'numeric', weekday: 'long' });
    const journalItems = selectedDay.items.journal || [];
    const taskItem = selectedDay.items.task ? [selectedDay.items.task] : [];
    const selectedDayItems = [...journalItems, ...taskItem];

    return (
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-4 h-full flex flex-col">
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-bold capitalize">{selectedDayFormatted}</h2>
                <VibrationPill vibrationNumber={selectedDay.personalDay} onClick={onInfoClick} tooltipDirection="left" />
            </div>
            <div className="mt-4 space-y-2 overflow-y-auto flex-1 custom-scrollbar pr-2">
                {selectedDayItems.length > 0 ? (
                    selectedDayItems.map((item) => <DetailItem key={item.id} item={item} setEditingEntry={setEditingEntry} onOpenTaskModal={() => onOpenModal('task')} />)
                ) : (<p className="text-gray-500 text-sm p-3">Nenhum item para este dia.</p>)}
            </div>
            <button onClick={() => onOpenModal('menu')} className="w-full mt-4 bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 shrink-0">
                <PlusIcon className="w-5 h-5" /> Adicionar
            </button>
        </div>
    );
};

const MobileDetailPanel = ({ selectedDay, isVisible, onClose, onOpenModal, setEditingEntry, onInfoClick }) => {
    if (!selectedDay) return null;
    const selectedDayFormatted = new Date(selectedDay.date).toLocaleString('pt-BR', { day: 'numeric', weekday: 'long' });
    const journalItems = selectedDay.items.journal || [];
    const taskItem = selectedDay.items.task ? [selectedDay.items.task] : [];
    const selectedDayItems = [...journalItems, ...taskItem];

    return (
        <>
            <div className={`fixed inset-0 bg-black/60 z-40 transition-opacity lg:hidden ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
            <div className={`fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 rounded-t-2xl p-4 z-50 transition-transform duration-300 ease-out lg:hidden ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}>
                <div className="w-10 h-1.5 bg-gray-600 rounded-full mx-auto mb-4"></div>
                <div className="flex items-center justify-between gap-3 mb-4">
                    <h2 className="text-xl font-bold capitalize">{selectedDayFormatted}</h2>
                    <VibrationPill vibrationNumber={selectedDay.personalDay} onClick={onInfoClick} tooltipDirection="left" />
                </div>
                <div className="space-y-2 max-h-[30vh] overflow-y-auto custom-scrollbar pr-2">
                     {selectedDayItems.length > 0 ? (
                        selectedDayItems.map((item) => <DetailItem key={item.id} item={item} setEditingEntry={setEditingEntry} onOpenTaskModal={() => onOpenModal('task')} />)
                    ) : (<p className="text-gray-500 text-sm p-3">Nenhum item para este dia.</p>)}
                </div>
                 <button onClick={() => onOpenModal('menu')} className="w-full mt-4 bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
                    <PlusIcon className="w-5 h-5" /> Adicionar
                </button>
            </div>
        </>
    );
};

const DayCell = ({ day, isSelected, onClick }) => {
    if (day.empty) return <div />;
    const dayNumberClasses = `font-bold text-sm w-7 h-7 flex items-center justify-center rounded-full transition-colors ${isSelected ? 'bg-purple-600 text-white' : day.isToday ? 'bg-gray-600 text-white' : 'text-gray-300'}`;
    const cellClasses = `h-full rounded-lg p-1.5 flex flex-col justify-between relative border-2 transition-all duration-200 cursor-pointer overflow-hidden hover:bg-gray-700/50 ${isSelected ? 'border-purple-500 bg-gray-700/50' : 'border-transparent'}`;
    const hasTasks = !!day.items.task;
    const hasJournal = day.items.journal && day.items.journal.length > 0;

    return (
        <div onClick={onClick} className={cellClasses}>
            <div className="flex justify-between items-start">
                <span className={dayNumberClasses}>{day.date.getDate()}</span>
                <div className="flex flex-col items-end gap-1.5 mt-1">
                    {hasTasks && <CheckSquareIcon className="w-3.5 h-3.5 text-blue-400"/>}
                    {hasJournal && <BookIcon className="w-3.5 h-3.5 text-cyan-400"/>}
                </div>
            </div>
            <div className={`w-full h-1 rounded-b-md ${day.energyColorClass} mt-1`}></div>
        </div>
    );
};

const Calendar = ({ user, userData, setEditingEntry, openNewNoteEditor, onInfoClick }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [monthEntries, setMonthEntries] = useState([]);
    const [monthTasks, setMonthTasks] = useState([]);
    const [selectedDay, setSelectedDay] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPanelVisible, setIsPanelVisible] = useState(false);
    const [modalInitialView, setModalInitialView] = useState('menu');

    const energyColors = { 1: 'bg-red-500', 2: 'bg-orange-500', 3: 'bg-yellow-500', 4: 'bg-lime-500', 5: 'bg-cyan-500', 6: 'bg-blue-500', 7: 'bg-purple-500', 8: 'bg-pink-500', 9: 'bg-teal-500', 11: 'bg-violet-400', 22: 'bg-indigo-400', default: 'bg-gray-700' };

    useEffect(() => {
        if (!user?.uid) return;
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        const journalQuery = query(collection(db, 'users', user.uid, 'journalEntries'), where('createdAt', '>=', Timestamp.fromDate(startOfMonth)), where('createdAt', '<=', Timestamp.fromDate(endOfMonth)));
        const journalUnsub = onSnapshot(journalQuery, (snapshot) => {
            setMonthEntries(snapshot.docs.map(doc => ({ id: doc.id, text: doc.data().content, type: 'journal', ...doc.data() })));
        });

        const tasksQuery = query(collection(db, 'users', user.uid, 'tasks'), where('createdAt', '>=', Timestamp.fromDate(startOfMonth)), where('createdAt', '<=', Timestamp.fromDate(endOfMonth)));
        const tasksUnsub = onSnapshot(tasksQuery, (snapshot) => {
            setMonthTasks(snapshot.docs.map(doc => ({ id: doc.id, text: doc.data().text, type: 'task', ...doc.data() })));
        });

        return () => { journalUnsub(); tasksUnsub(); };
    }, [user, currentDate]);
    
    const isSameDay = (d1, d2) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();

    const daysInMonth = useMemo(() => {
        if (!userData?.dataNasc) return [];
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const daysArray = [];
        for (let i = 0; i < firstDayOfMonth.getDay(); i++) { daysArray.push({ key: `empty-${i}`, empty: true }); }
        
        for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
            const date = new Date(year, month, i);
            const personalDay = numerologyEngine.calculatePersonalDayForDate(date, userData.dataNasc);
            const dayEntries = monthEntries.filter(entry => isSameDay(entry.createdAt.toDate(), date));
            const dayTasks = monthTasks.filter(task => isSameDay(task.createdAt.toDate(), date));
            daysArray.push({
                key: date.toISOString(), 
                date, personalDay,
                isToday: new Date().toDateString() === date.toDateString(),
                items: {
                    journal: dayEntries,
                    task: dayTasks.length > 0 ? dayTasks[dayTasks.length - 1] : null
                },
                energyColorClass: energyColors[personalDay] || energyColors.default
            });
        }
        return daysArray;
    }, [currentDate, userData, monthEntries, monthTasks]);

    // CORREÇÃO: useEffect que seleciona E ATUALIZA o dia.
    useEffect(() => {
        if (daysInMonth.length > 0) {
            // Se nenhum dia estiver selecionado, seleciona o de hoje ou o primeiro do mês
            if (!selectedDay) {
                const today = daysInMonth.find(d => d.isToday);
                const dayToSelect = today || daysInMonth.find(d => !d.empty);
                setSelectedDay(dayToSelect);
            } 
            // Se um dia JÁ ESTIVER selecionado, busca a versão mais recente dele no array de dias
            // para garantir que os itens (anotações/tarefas) estejam atualizados.
            else {
                const updatedSelectedDay = daysInMonth.find(d => d.key === selectedDay.key);
                if (updatedSelectedDay) {
                    setSelectedDay(updatedSelectedDay);
                }
            }
        }
    }, [daysInMonth]); // Este efeito roda sempre que 'daysInMonth' é recalculado (ou seja, quando os dados chegam)

    const changeMonth = (amount) => {
        setSelectedDay(null);
        setIsPanelVisible(false);
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + amount, 1));
    };

    const handleDayClick = (day) => {
        if (day.empty) return;
        setSelectedDay(day);
        if (window.innerWidth < 1024) {
             setIsPanelVisible(true);
        }
    };

    const handleOpenModal = (view = 'menu') => {
        if (!selectedDay) return;
        setModalInitialView(view);
        setIsModalOpen(true);
        setIsPanelVisible(false);
    };

    const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

    return (
        <>
            {isModalOpen && selectedDay && 
                <CalendarActionModal key={selectedDay.key} day={selectedDay} initialView={modalInitialView} onClose={() => setIsModalOpen(false)} userData={userData} openNewNoteEditor={openNewNoteEditor} onInfoClick={onInfoClick} />
            }
            <div className="p-4 md:p-6 lg:p-8 text-white h-full flex flex-col">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 flex-shrink-0">
                    <h1 className="text-2xl sm:text-3xl font-bold capitalize">{`${currentDate.toLocaleString('pt-BR', { month: 'long' })} de ${currentDate.getFullYear()}`}</h1>
                    <div className="flex items-center gap-2">
                        <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-700"><ChevronLeft/></button>
                        <button onClick={() => { setCurrentDate(new Date()); setSelectedDay(null); }} className="text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-700">Hoje</button>
                        <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-700"><ChevronRight/></button>
                    </div>
                </div>

                <div className="flex-1 lg:grid lg:grid-cols-3 lg:gap-8 min-h-0">
                    <div className="lg:col-span-2 flex flex-col h-full">
                        <div className="grid grid-cols-7 gap-1 text-center font-semibold text-gray-400 mb-2">
                            {weekDays.map((day, index) => <div key={index} className="text-xs sm:text-base">{day}</div>)}
                        </div>
                        <div className="grid grid-cols-7 grid-rows-6 gap-1 md:gap-2 flex-1">
                            {daysInMonth.map(day => (
                                <DayCell key={day.key} day={day} isSelected={selectedDay?.key === day.key} onClick={() => handleDayClick(day)} />
                            ))}
                        </div>
                    </div>
                    {selectedDay && (
                        <div className="hidden lg:block lg:col-span-1">
                           <div className="sticky top-8">
                                <DesktopDetailPanel selectedDay={selectedDay} onOpenModal={handleOpenModal} setEditingEntry={setEditingEntry} onInfoClick={onInfoClick} />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <MobileDetailPanel selectedDay={selectedDay} isVisible={isPanelVisible} onClose={() => setIsPanelVisible(false)} onOpenModal={handleOpenModal} setEditingEntry={setEditingEntry} onInfoClick={onInfoClick} />
        </>
    );
};

export default Calendar;