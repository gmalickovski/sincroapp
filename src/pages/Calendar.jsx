import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../services/firebase';
import { collection, onSnapshot, query, where, Timestamp, orderBy } from "firebase/firestore";
import numerologyEngine from '../services/numerologyEngine';
import { ChevronLeft, ChevronRight, BookIcon, CheckSquareIcon, PlusIcon } from '../components/ui/Icons';
import CalendarActionModal from '../components/ui/CalendarActionModal';

const DetailItem = ({ item, onClick }) => {
    if (!item) return null;
    const icon = item.type === 'task' 
        ? <CheckSquareIcon className="w-4 h-4 text-blue-300 flex-shrink-0" /> 
        : <BookIcon className="w-4 h-4 text-cyan-300 flex-shrink-0" />;

    return (
        <button onClick={onClick} className="w-full flex items-center gap-3 text-sm text-gray-300 bg-gray-900/50 p-3 rounded-lg animate-fade-in hover:bg-gray-700 transition-colors text-left">
            {icon}
            <span className="truncate">{item.text}</span>
        </button>
    );
};

const Calendar = ({ user, userData }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [daysInMonth, setDaysInMonth] = useState([]);
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

        const fetchData = (collectionName, type) => {
            const q = query(collection(db, 'users', user.uid, collectionName), where('createdAt', '>=', Timestamp.fromDate(startOfMonth)), where('createdAt', '<=', Timestamp.fromDate(endOfMonth)), orderBy('createdAt', 'desc'));
            return onSnapshot(q, (snapshot) => {
                const data = {};
                snapshot.forEach(doc => {
                    const docData = doc.data();
                    const dateKey = docData.createdAt.toDate().toISOString().split('T')[0];
                    if (!data[dateKey]) {
                        data[dateKey] = { id: doc.id, text: type === 'task' ? docData.text : docData.content, type: type };
                    }
                });
                setMonthData(prev => {
                    const newData = {...prev};
                    Object.keys(newData).forEach(k => {
                        if (newData[k][type]) delete newData[k][type];
                    });
                    Object.keys(data).forEach(k => {
                        if (!newData[k]) newData[k] = {};
                        newData[k][type] = data[k];
                    });
                    return newData;
                });
            });
        };
        
        const journalUnsub = fetchData('journalEntries', 'journal');
        const tasksUnsub = fetchData('tasks', 'task');
        return () => { journalUnsub(); tasksUnsub(); setMonthData({}); };
    }, [user, currentDate]);

    useEffect(() => {
        if (!userData?.dataNasc) return;
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const daysArray = [];
        let firstDayIndex = firstDayOfMonth.getDay();
        for (let i = 0; i < firstDayIndex; i++) { daysArray.push({ key: `empty-${i}`, empty: true }); }
        for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
            const date = new Date(year, month, i);
            const dateKey = date.toISOString().split('T')[0];
            daysArray.push({
                key: date.toISOString(),
                date,
                personalDay: numerologyEngine.calculatePersonalDayForDate(date, userData.dataNasc),
                isToday: new Date().toDateString() === date.toDateString(),
                items: monthData[dateKey] || {}
            });
        }
        setDaysInMonth(daysArray);
        if (!selectedDay) {
            const today = daysArray.find(d => d.isToday);
            if (today) setSelectedDay(today);
        }
    }, [currentDate, userData, monthData]);
    
    const changeMonth = (amount) => {
        setSelectedDay(null);
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + amount, 1));
    };

    const handleOpenModal = (view = 'menu') => {
        if (!selectedDay) return;
        setModalInitialView(view);
        setIsModalOpen(true);
    };

    const monthName = currentDate.toLocaleString('pt-BR', { month: 'long' });
    const year = currentDate.getFullYear();
    const selectedDayFormatted = selectedDay ? new Date(selectedDay.date).toLocaleDateString('pt-BR', { day: 'numeric', weekday: 'long' }) : '';
    const selectedDayItems = selectedDay ? Object.values(selectedDay.items) : [];

    const DetailPanel = () => (
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-4 animate-fade-in h-full flex flex-col">
            <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold capitalize">{selectedDayFormatted}</h2>
                <span className="text-xs font-bold bg-gray-700 px-2 py-1 rounded-full">Vibração {selectedDay.personalDay}</span>
            </div>
            <div className="mt-4 space-y-2 overflow-y-auto flex-1">
                {selectedDayItems.length > 0 ? (
                    selectedDayItems.map((item) => (
                        <DetailItem key={item.id} item={item} onClick={() => handleOpenModal(item.type === 'journal' ? 'note' : 'task')} />
                    ))
                ) : (<p className="text-gray-500">Nenhum item para este dia.</p>)}
            </div>
             <button onClick={() => handleOpenModal('menu')} className="w-full mt-4 bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 shrink-0">
                <PlusIcon className="w-5 h-5" /> Adicionar
            </button>
        </div>
    );

    return (
        <div className="p-4 md:p-8 text-white h-full flex flex-col">
            {isModalOpen && selectedDay && <CalendarActionModal key={selectedDay.key} day={selectedDay} initialView={modalInitialView} onClose={() => setIsModalOpen(false)} userData={userData} />}
            
            {/* --- LAYOUT DESKTOP / TABLET --- */}
            <div className="hidden md:flex flex-col h-full">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <h1 className="text-2xl sm:text-3xl font-bold capitalize">{`${monthName} de ${year}`}</h1>
                    <div className="flex items-center gap-2">
                        <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-700"><ChevronLeft/></button>
                        <button onClick={() => setCurrentDate(new Date())} className="text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-700">Hoje</button>
                        <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-700"><ChevronRight/></button>
                    </div>
                </div>
                <div className="flex-1 grid grid-cols-3 gap-8 min-h-0">
                    <div className="col-span-2 flex flex-col">
                        <div className="grid grid-cols-7 gap-1 text-center font-semibold text-gray-400 mb-2">
                            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, index) => <div key={`${day}-${index}`} className="text-xs sm:text-base">{day.substring(0, 3)}</div>)}
                        </div>
                        <div className="grid grid-cols-7 gap-2 flex-1">
                            {daysInMonth.map(day => (
                                day.empty ? <div key={day.key}></div> : (
                                    <div key={day.key} onClick={() => setSelectedDay(day)} className={`h-full rounded-lg p-2 flex flex-col justify-between relative border-2 transition-all duration-200 cursor-pointer overflow-hidden ${selectedDay?.key === day.key ? 'border-purple-500' : 'border-transparent'} ${day.isToday && selectedDay?.key !== day.key ? 'bg-gray-700/50' : ''}`}>
                                        <div>
                                            <span className={`font-bold text-sm ${day.isToday ? 'w-6 h-6 flex items-center justify-center bg-purple-600 text-white rounded-full' : ''}`}>{day.date.getDate()}</span>
                                            <div className="flex items-center gap-1.5 mt-2">
                                                {day.items.task && <CheckSquareIcon className="w-3.5 h-3.5 text-blue-400"/>}
                                                {day.items.journal && <BookIcon className="w-3.5 h-3.5 text-cyan-400"/>}
                                            </div>
                                        </div>
                                        <div className={`w-full h-1 rounded-b-md ${energyColors[day.personalDay] || energyColors.default}`}></div>
                                    </div>
                                )
                            ))}
                        </div>
                    </div>
                    {selectedDay && <div className="col-span-1"><DetailPanel /></div>}
                </div>
            </div>

            {/* --- LAYOUT MOBILE --- */}
            <div className="md:hidden flex flex-col h-full -mx-4 -my-4">
                <div className="px-4 pt-4">
                    <div className="flex flex-col items-center mb-4 gap-4">
                        <h1 className="text-2xl font-bold capitalize">{`${monthName} de ${year}`}</h1>
                        <div className="flex items-center gap-2">
                            <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-700"><ChevronLeft/></button>
                            <button onClick={() => setCurrentDate(new Date())} className="text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-700">Hoje</button>
                            <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-700"><ChevronRight/></button>
                        </div>
                    </div>
                </div>
                <div className="flex-1 flex flex-col min-h-0">
                    {/* Painel do Calendário (com rolagem) */}
                    <div className="h-3/5 overflow-y-auto px-4">
                        <div className="grid grid-cols-7 gap-1 text-center font-semibold text-gray-400 mb-2 sticky top-0 bg-gray-900 py-1 z-10">
                            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, index) => <div key={`${day}-${index}`} className="text-xs">{day}</div>)}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                            {daysInMonth.map(day => (
                                day.empty ? <div key={day.key}></div> : (
                                    <div key={day.key} onClick={() => setSelectedDay(day)} className={`aspect-square rounded-lg p-2 flex flex-col justify-between relative border-2 transition-all duration-200 cursor-pointer overflow-hidden ${selectedDay?.key === day.key ? 'border-purple-500' : 'border-transparent'} ${day.isToday && selectedDay?.key !== day.key ? 'bg-gray-700/50' : ''}`}>
                                        <div>
                                            <span className={`font-bold text-sm ${day.isToday ? 'w-6 h-6 flex items-center justify-center bg-purple-600 text-white rounded-full' : ''}`}>{day.date.getDate()}</span>
                                            <div className="flex items-center gap-1.5 mt-1 sm:mt-2">
                                                {day.items.task && <CheckSquareIcon className="w-3 h-3 text-blue-400"/>}
                                                {day.items.journal && <BookIcon className="w-3 h-3 text-cyan-400"/>}
                                            </div>
                                        </div>
                                        <div className={`w-full h-1 rounded-b-md ${energyColors[day.personalDay] || energyColors.default}`}></div>
                                    </div>
                                )
                            ))}
                        </div>
                    </div>
                    {/* Painel de Detalhes */}
                    {selectedDay && <div className="h-2/5 mt-4 px-4 pb-4"><DetailPanel /></div>}
                </div>
            </div>
        </div>
    );
};

export default Calendar;