import React, { useState, useEffect } from 'react';
import numerologyEngine from '../services/numerologyEngine';
import { intencoes } from '../data/content';
import { ChevronLeft, ChevronRight, BookIcon, CheckSquareIcon } from '../components/ui/Icons';
import CalendarActionModal from '../components/ui/CalendarActionModal';
import { db } from '../services/firebase';
import { collection, onSnapshot, query, where, Timestamp } from "firebase/firestore";

// SIMPLIFICADO: Não precisa mais das props onAddNoteForDate e onTasksForDate
const Calendar = ({ user, userData }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [daysInMonth, setDaysInMonth] = useState([]);
    const [journalEntries, setJournalEntries] = useState(new Set());
    const [taskEntries, setTaskEntries] = useState(new Set());
    const [selectedIntention, setSelectedIntention] = useState('none');
    const [selectedDay, setSelectedDay] = useState(null);

    const isPremium = userData?.plano === 'premium' || userData?.isAdmin === true;

    const energyColors = {
        1: 'bg-red-500/80', 2: 'bg-orange-500/80', 3: 'bg-yellow-500/80',
        4: 'bg-lime-500/80', 5: 'bg-cyan-500/80', 6: 'bg-blue-500/80',
        7: 'bg-purple-500/80', 8: 'bg-pink-500/80', 9: 'bg-teal-500/80',
        default: 'bg-gray-700/80'
    };

    useEffect(() => {
        if (!user?.uid) return;
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        const createSubscription = (collectionName, setState) => {
            const q = query(collection(db, 'users', user.uid, collectionName), 
                where('createdAt', '>=', Timestamp.fromDate(startOfMonth)),
                where('createdAt', '<=', Timestamp.fromDate(endOfMonth))
            );
            return onSnapshot(q, (snapshot) => {
                const datesWithData = new Set();
                snapshot.forEach(doc => {
                    const date = doc.data().createdAt.toDate().toDateString();
                    datesWithData.add(date);
                });
                setState(datesWithData);
            });
        };
        
        const journalUnsub = createSubscription('journalEntries', setJournalEntries);
        const tasksUnsub = createSubscription('tasks', setTaskEntries);

        return () => { journalUnsub(); tasksUnsub(); };
    }, [user, currentDate]);


    useEffect(() => {
        if (!userData?.dataNasc) return;
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        
        const days = [];
        for (let i = 0; i < firstDayOfMonth.getDay(); i++) { days.push({ key: `empty-${i}`, empty: true }); }

        const intentionData = intencoes[selectedIntention];
        const midMonthDate = new Date(year, month, 15);
        const personalMonth = numerologyEngine.calculatePersonalMonthForDate(midMonthDate, userData.dataNasc);

        for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
            const date = new Date(year, month, i);
            const personalDay = numerologyEngine.calculatePersonalDayForDate(date, userData.dataNasc);
            
            let isHighlighted = false;
            if (isPremium && intentionData) {
                const isFavorableDay = intentionData.dias.includes(personalDay);
                const isFavorableMonth = intentionData.meses.includes(personalMonth);
                if (isFavorableDay && isFavorableMonth) { isHighlighted = true; }
            }

            days.push({
                key: date.toISOString(),
                date,
                personalDay,
                isToday: new Date().toDateString() === date.toDateString(),
                isHighlighted,
                hasNote: journalEntries.has(date.toDateString()),
                hasTask: taskEntries.has(date.toDateString())
            });
        }
        setDaysInMonth(days);

    }, [currentDate, userData, selectedIntention, isPremium, journalEntries, taskEntries]);
    
    const handleDayClick = (day) => { setSelectedDay(day); };
    
    const changeMonth = (amount) => {
        setSelectedDay(null);
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + amount, 1));
    };

    const monthName = currentDate.toLocaleString('pt-BR', { month: 'long' });
    const year = currentDate.getFullYear();

    return (
        <div className="p-8 text-white relative">
            {selectedDay && 
                <CalendarActionModal 
                    day={selectedDay}
                    onClose={() => setSelectedDay(null)}
                    userData={userData}
                />
            }

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold capitalize">{`${monthName} de ${year}`}</h1>
                <div className="flex items-center gap-2">
                    <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-700"><ChevronLeft/></button>
                    <button onClick={() => setCurrentDate(new Date())} className="text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-700">Hoje</button>
                    <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-700"><ChevronRight/></button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center font-semibold text-gray-400 mb-2">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => <div key={day}>{day}</div>)}
            </div>

            <div className="grid grid-cols-7 gap-2">
                {daysInMonth.map(day => (
                    day.empty ? <div key={day.key}></div> : (
                        <div 
                            key={day.key} 
                            className={`h-28 rounded-lg p-2 flex flex-col items-start relative border transition-all duration-300 cursor-pointer hover:scale-105 hover:border-white/50 ${day.isHighlighted ? 'border-yellow-400 shadow-lg' : (day.isToday ? 'border-purple-500' : 'border-gray-700')}`}
                            onClick={() => handleDayClick(day)}
                        >
                             <div className="absolute top-2 right-2 flex space-x-1">
                                {day.hasTask && <CheckSquareIcon className="h-3 w-3 text-blue-400" />}
                                {day.hasNote && <BookIcon className="h-3 w-3 text-cyan-400" />}
                            </div>
                            <span className={`font-bold ${day.isToday ? 'text-purple-300' : ''}`}>{day.date.getDate()}</span>
                            <div className="absolute bottom-2 left-2 right-2">
                                <div className={`px-2 py-1 rounded text-xs font-bold text-white text-center ${energyColors[day.personalDay] || energyColors.default}`}>
                                    Vibração {day.personalDay}
                                </div>
                            </div>
                        </div>
                    )
                ))}
            </div>
        </div>
    );
};

export default Calendar;