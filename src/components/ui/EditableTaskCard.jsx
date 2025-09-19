// src/components/ui/EditableTaskCard.jsx

import React, { useState } from 'react';
import { ChevronDownIcon } from './Icons';
import VibrationPill from './VibrationPill';
import { TaskListBody } from './TaskSheet';

const EditableTaskCard = ({ date, tasks, personalDay, onInfoClick, taskUpdater }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const energyClasses = {
        1: { bg: 'bg-red-500/20', text: 'text-red-300', border: 'border-red-500' },
        2: { bg: 'bg-orange-500/20', text: 'text-orange-300', border: 'border-orange-500' },
        3: { bg: 'bg-yellow-500/20', text: 'text-yellow-300', border: 'border-yellow-500' },
        4: { bg: 'bg-lime-500/20', text: 'text-lime-300', border: 'border-lime-500' },
        5: { bg: 'bg-cyan-500/20', text: 'text-cyan-300', border: 'border-cyan-500' },
        6: { bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-500' },
        7: { bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-500' },
        8: { bg: 'bg-pink-500/20', text: 'text-pink-300', border: 'border-pink-500' },
        9: { bg: 'bg-teal-500/20', text: 'text-teal-300', border: 'border-teal-500' },
        11: { bg: 'bg-violet-400/20', text: 'text-violet-300', border: 'border-violet-400' },
        22: { bg: 'bg-indigo-400/20', text: 'text-indigo-300', border: 'border-indigo-400' },
        default: { bg: 'bg-gray-800/50', text: 'text-gray-300', border: 'border-gray-700' }
    };

    const currentEnergy = energyClasses[personalDay] || energyClasses.default;
    
    // CORREÇÃO DA DATA: Garante que a string seja interpretada no fuso horário local
    const dateObj = new Date(date.replace(/-/g, '/'));
    
    const formattedDate = dateObj.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
    const completedCount = tasks.filter(t => t.completed).length;
    const isPast = dateObj < new Date(new Date().toISOString().split('T')[0]);
    const allCompleted = tasks.length > 0 && completedCount === tasks.length;

    return (
        <div className={`border rounded-xl w-full animate-fade-in transition-all duration-300 overflow-hidden ${isExpanded ? `${currentEnergy.border} bg-gray-800/60` : 'border-gray-700 bg-gray-800/50'}`}>
            {/* Cabeçalho colorido e clicável */}
            <button 
                onClick={() => setIsExpanded(!isExpanded)} 
                className={`w-full p-4 flex justify-between items-center text-left transition-colors ${isExpanded ? currentEnergy.bg : 'hover:bg-gray-700/50'}`}
            >
                <span className={`font-bold ${isExpanded ? currentEnergy.text : (isPast && allCompleted ? 'text-gray-500' : 'text-white')}`}>
                    {formattedDate}
                </span>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-400 font-medium">{completedCount} / {tasks.length}</span>
                    <VibrationPill vibrationNumber={personalDay} onClick={onInfoClick}/>
                    <ChevronDownIcon className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
            </button>
            
            {/* Corpo da lista, que aparece sem redundância */}
            {isExpanded && (
                 <TaskListBody tasks={tasks} taskUpdater={taskUpdater} dateForNewTasks={dateObj} />
            )}
        </div>
    );
}

export default EditableTaskCard;