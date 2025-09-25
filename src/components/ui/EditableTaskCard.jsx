// src/components/ui/EditableTaskCard.jsx

import React, { useState } from 'react';
import { ChevronDownIcon, CheckAllIcon } from './Icons';
import VibrationPill from './VibrationPill';
import { TaskListBody } from './TaskSheet';

const EditableTaskCard = ({ date, tasks, personalDay, onInfoClick, taskUpdater }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const energyClasses = {
        1: { bg: 'bg-red-500/20', text: 'text-red-300', border: 'border-red-500' },
        // ... (resto das suas classes de energia)
        default: { bg: 'bg-gray-800/50', text: 'text-gray-300', border: 'border-gray-700' }
    };

    const currentEnergy = energyClasses[personalDay] || energyClasses.default;
    const dateObj = new Date(date.replace(/-/g, '/'));
    const formattedDate = dateObj.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
    const completedCount = tasks.filter(t => t.completed).length;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isPast = dateObj < today;
    const allCompleted = tasks.length > 0 && completedCount === tasks.length;

    const handleMarkAllComplete = () => {
        tasks.forEach(task => {
            if (!task.completed) {
                taskUpdater({ type: 'UPDATE', payload: { id: task.id, completed: true } });
            }
        });
    };

    return (
        // --- LÓGICA DE OPACIDADE ATUALIZADA ---
        // Agora fica opaco sempre que todas as tarefas estiverem completas
        <div className={`border rounded-xl w-full animate-fade-in transition-all duration-300 overflow-hidden ${isExpanded ? `${currentEnergy.border} bg-gray-800/60` : 'border-gray-700 bg-gray-800/50'} ${allCompleted ? 'opacity-50' : ''}`}>
            <div 
                onClick={() => setIsExpanded(!isExpanded)} 
                className={`w-full p-4 flex items-center text-left gap-4 cursor-pointer ${isExpanded ? currentEnergy.bg : 'hover:bg-gray-700/50'}`}
            >
                <span className={`font-bold flex-1 min-w-0 ${isExpanded ? currentEnergy.text : (isPast && !allCompleted ? 'text-red-400' : 'text-white')}`}>
                    {formattedDate}
                </span>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-sm text-gray-400 font-medium whitespace-nowrap">{completedCount} / {tasks.length}</span>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleMarkAllComplete(); }}
                        className="text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                        disabled={allCompleted}
                        title="Marcar todas como concluídas"
                    >
                        <CheckAllIcon className="w-5 h-5"/>
                    </button>
                    <div onClick={(e) => e.stopPropagation()}>
                        <VibrationPill vibrationNumber={personalDay} onClick={() => onInfoClick(personalDay)}/>
                    </div>
                    <ChevronDownIcon className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
            </div>
            
            {isExpanded && (
                 <TaskListBody tasks={tasks} taskUpdater={taskUpdater} dateForNewTasks={dateObj} />
            )}
        </div>
    );
}

export default EditableTaskCard;