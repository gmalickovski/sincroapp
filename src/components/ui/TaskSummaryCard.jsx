// src/components/ui/TaskSummaryCard.jsx

import React, { useState } from 'react';
import { CheckCircleIcon, ChevronDownIcon, CheckIcon } from './Icons';
import VibrationPill from './VibrationPill';

const TaskSummaryCard = ({ date, tasks, personalDay, onInfoClick }) => {
    const [isOpen, setIsOpen] = useState(false);

    const dateObj = new Date(date);
    dateObj.setMinutes(dateObj.getMinutes() + dateObj.getTimezoneOffset());
    const formattedDate = dateObj.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
    
    const completedCount = tasks.filter(t => t.completed).length;
    const allCompleted = tasks.length > 0 && completedCount === tasks.length;
    const isPast = new Date(date) < new Date(new Date().toISOString().split('T')[0]);

    return (
        <div className={`bg-gray-800/50 border border-gray-700 rounded-lg w-full animate-fade-in transition-all ${isPast && allCompleted ? 'opacity-60' : ''}`}>
            <button onClick={() => setIsOpen(!isOpen)} className="w-full p-3 flex justify-between items-center text-left">
                <div className="flex items-center gap-3">
                    {allCompleted && <CheckCircleIcon className="w-5 h-5 text-green-500"/>}
                    <span className={`font-semibold ${allCompleted && isPast ? 'text-gray-500' : 'text-white'}`}>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">{completedCount} / {tasks.length}</span>
                    <VibrationPill vibrationNumber={personalDay} onClick={onInfoClick}/>
                    <ChevronDownIcon className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </button>
            {isOpen && (
                <div className="p-3 border-t border-gray-700 space-y-2">
                    {tasks.sort((a, b) => a.createdAt.seconds - b.createdAt.seconds).map(task => (
                         <div key={task.id} className="flex items-center text-sm text-gray-400 pl-4">
                             <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                                 {task.completed ? <CheckCircleIcon className="w-4 h-4 text-green-500" /> : <div className="w-4 h-4 rounded-full border-2 border-gray-600"></div>}
                             </div>
                             <span className={`ml-3 ${task.completed ? 'line-through' : ''}`}>{task.text}</span>
                         </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default TaskSummaryCard;