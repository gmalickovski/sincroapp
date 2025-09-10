import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../services/firebase';
import { collection, onSnapshot, query, where, Timestamp, orderBy } from "firebase/firestore";
import numerologyEngine from '../services/numerologyEngine';
import { ChevronLeft, ChevronRight, BookIcon, CheckSquareIcon, PlusIcon } from '../components/ui/Icons';
import CalendarActionModal from '../components/ui/CalendarActionModal';

// --- Subcomponente para o Painel de Detalhes ---
const DetailPanel = ({ selectedDay, onOpenModal }) => {
    // ... (nenhuma mudança neste subcomponente)
    const selectedDayFormatted = new Date(selectedDay.date).toLocaleString('pt-BR', { day: 'numeric', weekday: 'long' });
    const selectedDayItems = Object.values(selectedDay.items);

    const DetailItem = ({ item }) => {
        const icon = item.type === 'task' 
            ? <CheckSquareIcon className="w-4 h-4 text-blue-300 flex-shrink-0" /> 
            : <BookIcon className="w-4 h-4 text-cyan-300 flex-shrink-0" />;
        const view = item.type === 'task' ? 'task' : 'note';

        return (
            <button onClick={() => onOpenModal(view)} className="w-full flex items-center gap-3 text-sm text-gray-300 bg-gray-900/50 p-3 rounded-lg animate-fade-in hover:bg-gray-700 transition-colors text-left">
                {icon}
                <span className="truncate">{item.text}</span>
            </button>
        );
    };

    return (
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-4 h-full flex flex-col">
            <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold capitalize">{selectedDayFormatted}</h2>
                <span className="text-xs font-bold bg-gray-700 px-2 py-1 rounded-full whitespace-nowrap">Vibração {selectedDay.personalDay}</span>
            </div>
            <div className="mt-4 space-y-2 overflow-y-auto flex-1">
                {selectedDayItems.length > 0 ? (
                    selectedDayItems.map((item) => <DetailItem key={item.id} item={item} />)
                ) : (<p className="text-gray-500 text-sm">Nenhum item para este dia.</p>)}
            </div>
             <button 
                onClick={() => onOpenModal('menu')} 
                className="w-full mt-4 bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors items-center justify-center gap-2 shrink-0 hidden lg:flex"
             >
                <PlusIcon className="w-5 h-5" /> Adicionar
            </button>
        </div>
    );
};

// --- Subcomponente para cada Célula do Dia no Calendário ---
const DayCell = ({ day, isSelected, onClick }) => {
    // ... (nenhuma mudança neste subcomponente)
    if (day.empty) return <div />;
    const dayNumberClasses = `font-bold text-sm w-6 h-6 flex items-center justify-center rounded-full ${day.isToday ? 'bg-purple-600 text-white' : ''}`;
    const cellClasses = `h-full rounded-lg p-2 flex flex-col justify-between relative border-2 transition-all duration-200 cursor-pointer overflow-hidden 
                         ${isSelected ? 'border-purple-500 bg-gray-700/50' : 'border-transparent'} 
                         ${!isSelected && day.isToday ? 'bg-gray-700/40' : ''}`;
    return (
        <div onClick={onClick} className={cellClasses}>
            <div>
                <span className={dayNumberClasses}>{day.date.getDate()}</span>
                <div className="flex items-center gap-1.5 mt-2">
                    {day.items.task && <CheckSquareIcon className="w-3.5 h-3.5 text-blue-400"/>}
                    {day.items.journal && <BookIcon className="w-3.5 h-3.5 text-cyan-400"/>}
                </div>
            </div>
            <div className={`w-full h-1 rounded-b-md ${day.energyColorClass}`}></div>
        </div>
    );
};

const Calendar = ({ user, userData }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [monthData, setMonthData] = useState({});
    const [selectedDay, setSelectedDay] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalInitialView, setModalInitialView] = useState('menu');

    const energyColors = {
        1: 'bg-red-500', 2: 'bg-orange-500', 3: 'bg-yellow-500',
        4: 'bg-lime-500', 5: 'bg-cyan-500', 6: 'bg-blue-500',
        7: 'bg-purple-500', 8: 'bg-pink-500', 9: 'bg-teal-500',
        11: 'bg-violet-400', 22: 'bg-indigo-400',
        default: 'bg-gray-700'
    };
    
    useEffect(() => {
        if (!user?.uid) return;
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        const fetchDataForMonth = (collectionName, type) => {
            const q = query(collection(db, 'users', user.uid, collectionName), where('createdAt', '>=', Timestamp.fromDate(startOfMonth)), where('createdAt', '<=', Timestamp.fromDate(endOfMonth)));
            
            return onSnapshot(q, (snapshot) => {
                setMonthData(prevData => {
                    const updatedData = { ...prevData };
                     Object.keys(updatedData).forEach(dateKey => {
                        if (updatedData[dateKey]?.[type]) {
                            delete updatedData[dateKey][type];
                        }
                    });
                    
                    snapshot.forEach(doc => {
                        const docData = doc.data();
                        const dateKey = docData.createdAt.toDate().toISOString().split('T')[0];
                        if (!updatedData[dateKey]) updatedData[dateKey] = {};
                        updatedData[dateKey][type] = { id: doc.id, text: type === 'task' ? docData.text : docData.content, type: type };
                    });
                    return updatedData;
                });
            });
        };

        const journalUnsub = fetchDataForMonth('journalEntries', 'journal');
        const tasksUnsub = fetchDataForMonth('tasks', 'task');
        
        return () => {
            journalUnsub();
            tasksUnsub();
            setMonthData({});
        };
    }, [user, currentDate]);
    
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
            const dateKey = date.toISOString().split('T')[0];
            const personalDay = numerologyEngine.calculatePersonalDayForDate(date, userData.dataNasc);
            daysArray.push({
                key: date.toISOString(),
                date,
                personalDay: personalDay,
                isToday: new Date().toDateString() === date.toDateString(),
                items: monthData[dateKey] || {},
                energyColorClass: energyColors[personalDay] || energyColors.default
            });
        }
        return daysArray;
    }, [currentDate, userData, monthData]);

    // AJUSTE 2: Efeito para selecionar o dia de hoje automaticamente ao carregar
    useEffect(() => {
        if (daysInMonth.length > 0 && !selectedDay) {
            const today = daysInMonth.find(d => d.isToday);
            if (today) {
                setSelectedDay(today);
            }
        }
    }, [daysInMonth, selectedDay]);
    
    const changeMonth = (amount) => {
        setSelectedDay(null);
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + amount, 1));
    };

    const handleOpenModal = (view = 'menu') => {
        if (!selectedDay) return;
        setModalInitialView(view);
        setIsModalOpen(true);
    };

    const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

    return (
        <>
            {isModalOpen && selectedDay && <CalendarActionModal key={selectedDay.key} day={selectedDay} initialView={modalInitialView} onClose={() => setIsModalOpen(false)} userData={userData} />}
            
            {/* AJUSTE 1: Modificado o padding para resolver a quebra de layout no mobile */}
            <div className="px-4 pt-4 md:p-8 text-white h-full flex flex-col">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <h1 className="text-2xl sm:text-3xl font-bold capitalize">{`${currentDate.toLocaleString('pt-BR', { month: 'long' })} de ${currentDate.getFullYear()}`}</h1>
                    <div className="flex items-center gap-2">
                        <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-700"><ChevronLeft/></button>
                        <button onClick={() => setCurrentDate(new Date())} className="text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-700">Hoje</button>
                        <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-700"><ChevronRight/></button>
                    </div>
                </div>

                <div className="flex-1 lg:grid lg:grid-cols-3 lg:gap-8 min-h-0">
                    <div className="lg:col-span-2 flex flex-col">
                        <div className="grid grid-cols-7 gap-1 text-center font-semibold text-gray-400 mb-2">
                            {weekDays.map((day, index) => <div key={index} className="text-xs sm:text-base">{day}</div>)}
                        </div>
                        <div className="grid grid-cols-7 gap-2 flex-1">
                            {daysInMonth.map(day => (
                                <DayCell 
                                    key={day.key}
                                    day={day}
                                    isSelected={selectedDay?.key === day.key}
                                    onClick={() => !day.empty && setSelectedDay(day)}
                                />
                            ))}
                        </div>
                    </div>
                    {selectedDay && (
                        <>
                            <div className="hidden lg:block lg:col-span-1">
                                <DetailPanel selectedDay={selectedDay} onOpenModal={handleOpenModal} />
                            </div>
                            <div className="block lg:hidden mt-6">
                                <DetailPanel selectedDay={selectedDay} onOpenModal={handleOpenModal} />
                            </div>
                        </>
                    )}
                </div>
            </div>
            
            {selectedDay && (
                <button
                    onClick={() => handleOpenModal('menu')}
                    className="lg:hidden fixed bottom-6 right-6 bg-purple-600 rounded-full w-14 h-14 flex items-center justify-center shadow-lg transform-gpu transition-transform hover:scale-110 active:scale-95 z-20"
                    aria-label="Adicionar item"
                >
                    <PlusIcon className="w-7 h-7 text-white" />
                </button>
            )}
        </>
    );
};

export default Calendar;