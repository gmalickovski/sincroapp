import React, { useState, useEffect } from 'react';
import numerologyEngine from '../services/numerologyEngine';
import { intencoes } from '../data/content';
import { ChevronLeft, ChevronRight, StarIcon } from '../components/ui/Icons';

const Calendar = ({ userData }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [daysInMonth, setDaysInMonth] = useState([]);
    const [selectedIntention, setSelectedIntention] = useState('none');

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
        
        const days = [];
        const firstDayOfMonth = new Date(year, month, 1);
        for (let i = 0; i < firstDayOfMonth.getDay(); i++) { days.push({ key: `empty-${i}`, empty: true }); }

        const intentionData = intencoes[selectedIntention];
        // CORREÇÃO: Usamos uma data consistente (o dia 15 do mês) para garantir que o cálculo do Ano Pessoal
        // (que depende se o aniversário já passou) seja o mesmo para todo o mês.
        const midMonthDate = new Date(year, month, 15);
        const personalMonth = numerologyEngine.calculatePersonalMonthForDate(midMonthDate, userData.dataNasc);

        const lastDayOfMonth = new Date(year, month + 1, 0);
        for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
            const date = new Date(year, month, i);
            const personalDay = numerologyEngine.calculatePersonalDayForDate(date, userData.dataNasc);
            
            let isHighlighted = false;
            if (isPremium && intentionData) {
                const isFavorableDay = intentionData.dias.includes(personalDay);
                const isFavorableMonth = intentionData.meses.includes(personalMonth);
                if (isFavorableDay && isFavorableMonth) {
                    isHighlighted = true;
                }
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
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + amount, 1));
    };

    const monthName = currentDate.toLocaleString('pt-BR', { month: 'long' });
    const year = currentDate.getFullYear();

    if (!userData) {
        return <div className="p-8 text-white">Carregando dados do usuário...</div>
    }

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

            <div className="relative">
                <div className={`bg-gray-800/50 border border-gray-700 rounded-2xl p-6 mb-8 transition-all duration-300 ${!isPremium ? 'blur-sm pointer-events-none' : ''}`}>
                    <h2 className="text-xl font-semibold text-purple-300 mb-4">Planejador de Intenções</h2>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-400">Minha intenção é:</span>
                        <select 
                            value={selectedIntention}
                            onChange={(e) => setSelectedIntention(e.target.value)}
                            className="bg-gray-900 border border-gray-600 rounded-lg p-2 text-sm text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        >
                            <option value="none">Nenhuma</option>
                            {Object.entries(intencoes).map(([key, value]) => (
                                <option key={key} value={key}>{value.label}</option>
                            ))}
                        </select>
                    </div>
                    {selectedIntention !== 'none' && isPremium && (
                         <p className="text-xs text-gray-500 mt-3">Os dias destacados em dourado são energeticamente favoráveis para esta intenção neste mês.</p>
                    )}
                </div>
                
                {!isPremium && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10 p-4 -mt-8">
                        <StarIcon className="h-10 w-10 text-yellow-400 mb-2"/>
                        <h3 className="text-xl font-bold text-white">Este é um recurso Premium</h3>
                        <p className="text-gray-400">Faça o upgrade para desbloquear o Planejador de Intenções.</p>
                        <button className="mt-4 bg-purple-600 text-white font-bold py-2 px-6 rounded-full hover:bg-purple-700">Seja Premium</button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-7 gap-1 text-center font-semibold text-gray-400 mb-2">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => <div key={day}>{day}</div>)}
            </div>

            <div className="grid grid-cols-7 gap-2">
                {daysInMonth.map(day => (
                    day.empty ? <div key={day.key}></div> : (
                        <div key={day.key} className={`h-28 rounded-lg p-2 flex flex-col items-start relative border transition-all duration-300 ${day.isHighlighted ? 'border-yellow-400 shadow-lg shadow-yellow-400/20' : (day.isToday ? 'border-purple-500 bg-gray-700/50' : 'border-gray-700 bg-gray-800/50')}`}>
                            <span className={`font-bold ${day.isToday ? 'text-purple-300' : ''}`}>{day.date.getDate()}</span>
                            <div className="absolute bottom-2 left-2 right-2">
                                <div className={`px-2 py-1 rounded text-xs font-bold text-white text-center ${energyColors[day.personalDay] || energyColors.default}`}>
                                    Dia {day.personalDay}
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

