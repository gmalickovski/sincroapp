// src/components/ui/TaskModal.jsx

import React from 'react';
import { XIcon } from './Icons';
import { TaskSheet } from './TaskSheet';
import numerologyEngine from '../../services/numerologyEngine';

const TaskModal = ({ isOpen, onClose, dayData, userData, taskUpdater, onInfoClick }) => {
    if (!isOpen || !dayData) return null;

    const personalDay = numerologyEngine.calculatePersonalDayForDate(dayData.date, userData.dataNasc);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4" onClick={onClose}>
            <div className="w-full max-w-2xl relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute -top-3 -right-3 p-2 rounded-full text-gray-300 bg-gray-800 hover:bg-gray-700 z-10">
                    <XIcon className="w-5 h-5" />
                </button>
                <TaskSheet
                    date={dayData.date.toISOString().split('T')[0]}
                    tasks={dayData.tasks}
                    personalDay={personalDay}
                    onInfoClick={onInfoClick}
                    taskUpdater={taskUpdater}
                />
            </div>
        </div>
    );
};

export default TaskModal;