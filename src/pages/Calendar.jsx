import React, { useState, useEffect } from 'react';
import numerologyEngine from '../services/numerologyEngine';
import { intencoes } from '../data/content';
import { ChevronLeft, ChevronRight, StarIcon, BookIcon } from '../components/ui/Icons';

const Calendar = ({ userData, onAddNoteForDate }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [daysInMonth, setDaysInMonth] = useState([]);
    const [selectedIntention, setSelectedIntention] = useState('none');
    const [selectedDay, setSelectedDay] = useState(null); // Para controlar o dia clicado

    const isPremium = userData?.plano === 'premium' || userData?.isAdmin === true;

    const energyColors = {
        1: 'bg-red-500/80', 2: 'bg-orange-500/80', 3: 'bg-yellow-500/80',
        4: 'bg-lime-500/80', 5: 'bg-cyan-500/80', 6: 'bg-blue-500/80',
        7: 'bg-purple-500/80', 8: 'bg-pink-500/80', 9: 'bg-teal-500/80',
        11: 'bg-yellow-300/80 text-black', 22: 'bg-blue-300/80 text-black',
        default: 'bg-gray-700/80'
    };

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
                isHighlighted
            });
        }
        setDaysInMonth(days);

    }, [currentDate, userData, selectedIntention, isPremium]);

    const changeMonth = (amount) => {
        setSelectedDay(null); // Limpa a seleção ao mudar de mês
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + amount, 1));
    };
    
    const handleDayClick = (day) => {
        if (selectedDay?.key === day.key) {
            setSelectedDay(null); // Clicar de novo no mesmo dia deseleciona
        } else {
            setSelectedDay(day);
        }
    };

    const monthName = currentDate.toLocaleString('pt-BR', { month: 'long' });
    const year = currentDate.getFullYear();

    if (!userData) { return <div className="p-8 text-white">Carregando dados do usuário...</div> }

    return (
        <div className="p-8 text-white relative">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold capitalize">{`${monthName} de ${year}`}</h1>
                <div className="flex items-center gap-2">
                    <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-700"><ChevronLeft/></button>
                    <button onClick={() => setCurrentDate(new Date())} className="text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-700">Hoje</button>
                    <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-700"><ChevronRight/></button>
                </div>
            </div>
            
            {/* Planejador de Intenções (código inalterado) */}
            <div className="relative"> ... </div>

            <div className="grid grid-cols-7 gap-1 text-center font-semibold text-gray-400 mb-2">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => <div key={day}>{day}</div>)}
            </div>

            <div className="grid grid-cols-7 gap-2">
                {daysInMonth.map(day => (
                    day.empty ? <div key={day.key}></div> : (
                        <div 
                            key={day.key} 
                            className={`
                                h-28 rounded-lg p-2 flex flex-col items-start relative border transition-all duration-300 cursor-pointer
                                hover:scale-105 hover:border-white/50
                                ${day.isHighlighted ? 'border-yellow-400 shadow-lg shadow-yellow-400/20' : ''}
                                ${day.isToday ? 'border-purple-500 bg-gray-700/50' : 'border-gray-700 bg-gray-800/50'}
                                ${selectedDay?.key === day.key ? 'scale-105 border-white' : ''}
                            `}
                            onClick={() => handleDayClick(day)}
                        >
                            <span className={`font-bold ${day.isToday ? 'text-purple-300' : ''}`}>{day.date.getDate()}</span>
                            <div className="absolute bottom-2 left-2 right-2">
                                <div className={`px-2 py-1 rounded text-xs font-bold text-white text-center ${energyColors[day.personalDay] || energyColors.default}`}>
                                    Vibração {day.personalDay}
                                </div>
                            </div>
                             {selectedDay?.key === day.key && (
                                <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 z-20 animate-fade-in-up">
                                    <button 
                                        onClick={() => onAddNoteForDate(selectedDay.date)}
                                        className="bg-purple-600 text-white font-semibold text-xs px-3 py-2 rounded-lg shadow-lg hover:bg-purple-500 flex items-center gap-2"
                                    >
                                        <BookIcon className="h-4 w-4" />
                                        Anotação
                                    </button>
                                </div>
                            )}
                        </div>
                    )
                ))}
            </div>
        </div>
    );
};

export default Calendar;