import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../services/firebase';
import { collection, onSnapshot, query, where, Timestamp, orderBy } from "firebase/firestore";
import numerologyEngine from '../services/numerologyEngine';
import { ChevronLeft, ChevronRight, BookIcon, CheckSquareIcon, PlusIcon } from '../components/ui/Icons';
import CalendarActionModal from '../components/ui/CalendarActionModal';

// --- Componente de Pré-visualização para o Layout de DESKTOP (>= 640px) ---
const DesktopCalendarItemPreview = ({ item }) => {
    if (!item) return null; // Não renderiza nada se o item não existir
    const icon = item.type === 'task' 
        ? <CheckSquareIcon className="w-3 h-3 text-blue-300 flex-shrink-0" /> 
        : <BookIcon className="w-3 h-3 text-cyan-300 flex-shrink-0" />;

    return (
        <div className="flex items-start gap-1.5 text-xs text-gray-300 truncate">
            {icon}
            <span className="truncate">{item.text}</span>
        </div>
    );
};

// --- Componente de Pré-visualização para a área de detalhes do MOBILE (< 640px) ---
const MobileDetailItem = ({ item, onClick }) => {
    if (!item) return null;
    const icon = item.type === 'task' 
        ? <CheckSquareIcon className="w-4 h-4 text-blue-300 flex-shrink-0" /> 
        : <BookIcon className="w-4 h-4 text-cyan-300 flex-shrink-0" />;

    return (
        <button onClick={onClick} className="w-full flex items-center gap-2 text-sm text-gray-300 bg-gray-800/50 p-2 rounded-lg animate-fade-in hover:bg-gray-700 transition-colors text-left">
            {icon}
            <span className="truncate">{item.text}</span>
        </button>
    );
};


// --- Componente Principal do Calendário ---
const Calendar = ({ user, userData }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [daysInMonth, setDaysInMonth] = useState([]);
    const [monthData, setMonthData] = useState({});
    const [selectedDay, setSelectedDay] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalInitialView, setModalInitialView] = useState('menu');

    const energyColors = {
        1: {bg: 'bg-red-500/80', text: 'text-white'}, 2: {bg: 'bg-orange-500/80', text: 'text-white'}, 3: {bg: 'bg-yellow-500/80', text: 'text-black'},
        4: {bg: 'bg-lime-500/80', text: 'text-black'}, 5: {bg: 'bg-cyan-500/80', text: 'text-white'}, 6: {bg: 'bg-blue-500/80', text: 'text-white'},
        7: {bg: 'bg-purple-500/80', text: 'text-white'}, 8: {bg: 'bg-pink-500/80', text: 'text-white'}, 9: {bg: 'bg-teal-500/80', text: 'text-white'},
        default: {bg: 'bg-gray-700/80', text: 'text-white'}
    };

    useEffect(() => {
        if (!user?.uid) return;
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        const fetchData = (collectionName, type) => {
            // Ordena por mais recente para pegar o último item
            const q = query(collection(db, 'users', user.uid, collectionName), where('createdAt', '>=', Timestamp.fromDate(startOfMonth)), where('createdAt', '<=', Timestamp.fromDate(endOfMonth)), orderBy('createdAt', 'desc'));
            return onSnapshot(q, (snapshot) => {
                const data = {};
                snapshot.forEach(doc => {
                    const docData = doc.data();
                    const dateKey = docData.createdAt.toDate().toISOString().split('T')[0];
                    // Pega apenas o PRIMEIRO item (que é o mais recente devido à ordenação 'desc')
                    if (!data[dateKey]) {
                        data[dateKey] = { id: doc.id, text: type === 'task' ? docData.text : docData.content, type: type };
                    }
                });
                setMonthData(prev => {
                    const newData = {...prev};
                    // Limpa dados antigos do mesmo tipo
                    Object.keys(newData).forEach(k => {
                        if (newData[k][type]) delete newData[k][type];
                    });
                    // Adiciona os novos dados (apenas o último de cada tipo)
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
        for (let i = 0; i < firstDayOfMonth.getDay(); i++) { daysArray.push({ key: `empty-${i}`, empty: true }); }
        for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
            const date = new Date(year, month, i);
            const dateKey = date.toISOString().split('T')[0];
            daysArray.push({
                key: date.toISOString(),
                date,
                personalDay: numerologyEngine.calculatePersonalDayForDate(date, userData.dataNasc),
                isToday: new Date().toDateString() === date.toDateString(),
                // Agora 'items' é um objeto com a última tarefa e/ou anotação
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
        setModalInitialView(view);
        setIsModalOpen(true);
    };

    const monthName = currentDate.toLocaleString('pt-BR', { month: 'long' });
    const year = currentDate.getFullYear();
    const selectedDayFormatted = selectedDay ? new Date(selectedDay.date).toLocaleDateString('pt-BR', { day: 'numeric', weekday: 'long' }) : '';
    const selectedDayVibration = selectedDay ? (energyColors[selectedDay.personalDay] || energyColors.default) : null;
    const selectedDayItems = selectedDay ? Object.values(selectedDay.items) : [];

    return (
        <div className="p-4 md:p-8 text-white h-full flex flex-col">
            {isModalOpen && selectedDay && <CalendarActionModal key={selectedDay.key} day={selectedDay} initialView={modalInitialView} onClose={() => setIsModalOpen(false)} userData={userData} />}
            
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold capitalize">{`${monthName} de ${year}`}</h1>
                <div className="flex items-center gap-2">
                    <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-700"><ChevronLeft/></button>
                    <button onClick={() => setCurrentDate(new Date())} className="text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-700">Hoje</button>
                    <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-700"><ChevronRight/></button>
                </div>
            </div>
            
            {/* --- LAYOUT PARA DESKTOP/TABLET (>= 640px) --- */}
            <div className="hidden sm:block">
                <div className="grid grid-cols-7 gap-1 text-center font-semibold text-gray-400 mb-2">
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, index) => <div key={`${day}-${index}`}>{day}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-2">
                    {daysInMonth.map(day => (
                        day.empty ? <div key={day.key}></div> : (
                            <div key={day.key} onClick={() => {setSelectedDay(day); handleOpenModal('menu');}} className={`h-36 rounded-lg p-2 flex flex-col items-start relative border transition-all duration-300 cursor-pointer hover:border-white/50 ${day.isToday ? 'border-purple-500 bg-gray-700/50' : 'border-gray-700 bg-gray-800/50'}`}>
                                <span className={`font-bold text-sm ${day.isToday ? 'text-purple-300' : ''}`}>{day.date.getDate()}</span>
                                <div className="mt-1 space-y-1 w-full overflow-hidden">
                                    <DesktopCalendarItemPreview item={day.items.task} />
                                    <DesktopCalendarItemPreview item={day.items.journal} />
                                </div>
                                <div className="absolute bottom-2 left-2 right-2">
                                    <div className={`px-2 py-1 rounded text-xs font-bold text-center ${energyColors[day.personalDay]?.bg || energyColors.default.bg} ${energyColors[day.personalDay]?.text || energyColors.default.text}`}>
                                        <span className="hidden min-[920px]:inline">Vibração </span>
                                        {day.personalDay}
                                    </div>
                                </div>
                            </div>
                        )
                    ))}
                </div>
            </div>

            {/* --- LAYOUT PARA MOBILE (< 640px) --- */}
            <div className="sm:hidden flex-1 flex flex-col">
                <div>
                    <div className="grid grid-cols-7 gap-1 text-center font-semibold text-gray-400 mb-2">
                        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, index) => <div key={`${day}-${index}`} className="text-xs">{day}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {daysInMonth.map(day => (
                            day.empty ? <div key={day.key}></div> : (
                                <div key={day.key} onClick={() => setSelectedDay(day)} className={`aspect-square rounded-lg p-1 flex flex-col items-center relative border-2 transition-all duration-200 cursor-pointer ${selectedDay?.key === day.key ? 'border-purple-500' : 'border-transparent'} ${day.isToday && selectedDay?.key !== day.key ? 'bg-gray-700/50' : ''}`}>
                                    <span className={`font-bold text-sm ${day.isToday ? 'text-purple-300' : ''}`}>{day.date.getDate()}</span>
                                    <div className="flex items-center justify-center gap-1 mt-1 w-full">
                                        {day.items.task && <CheckSquareIcon className="w-2.5 h-2.5 text-blue-400"/>}
                                        {day.items.journal && <BookIcon className="w-2.5 h-2.5 text-cyan-400"/>}
                                    </div>
                                    <div className="absolute bottom-1 left-1 right-1"><div className={`w-full h-1 rounded-b-md ${energyColors[day.personalDay]?.bg || energyColors.default.bg}`}></div></div>
                                </div>
                            )
                        ))}
                    </div>
                </div>

                {selectedDay && (
                <div className="flex-1 flex flex-col pt-6 overflow-y-auto">
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold capitalize">{selectedDayFormatted}</h2>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${selectedDayVibration?.bg} ${selectedDayVibration?.text}`}>
                            Vibração {selectedDay.personalDay}
                        </div>
                    </div>
                    <div className="mt-4 space-y-2">
                        {selectedDayItems.length > 0 ? (
                            selectedDayItems.map((item) => (
                                <MobileDetailItem key={item.id} item={item} onClick={() => handleOpenModal(item.type === 'journal' ? 'note' : 'task')} />
                            ))
                        ) : (<p className="text-gray-500">Nenhum item para este dia.</p>)}
                    </div>
                </div>
                )}
                
                {selectedDay && (
                    <button onClick={() => handleOpenModal('menu')} className="fixed bottom-6 right-6 bg-purple-600 text-white rounded-full p-4 shadow-lg hover:bg-purple-700 transition-transform hover:scale-110 z-10" title={`Adicionar evento em ${selectedDayFormatted}`}>
                        <PlusIcon className="w-6 h-6" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default Calendar;