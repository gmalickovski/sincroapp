// src/components/ui/TaskSheet.jsx

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { PlusIcon, TrashIcon, CheckIcon, CheckAllIcon, ChevronDownIcon, IconTarget } from './Icons';
import VibrationPill from './VibrationPill';

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => { clearTimeout(timeout); func(...args); };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ### ATUALIZAÇÃO PRINCIPAL: TaskItem agora usa <textarea> com auto-resize ###
const TaskItem = ({ task, onUpdate, onDelete, onToggle, onEnter }) => {
    const [text, setText] = useState(task.text);
    const textareaRef = useRef(null);

    const debouncedUpdate = useCallback(debounce((newText) => { if (newText !== task.text) { onUpdate(task.id, { text: newText }); } }, 400), [task.id, task.text, onUpdate]);

    // Ajusta a altura do textarea dinamicamente
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [text]);

    useEffect(() => {
        setText(task.text);
    }, [task.text]);

    const handleChange = (e) => {
        setText(e.target.value);
        debouncedUpdate(e.target.value);
    };

    const handleBlur = () => {
        if (text !== task.text) {
            onUpdate(task.id, { text });
        }
    };

    // Enter foca no próximo campo; Shift+Enter cria nova linha
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onEnter();
        }
    };

    const CustomCheckbox = () => (
        <button onClick={() => onToggle(task.id, !task.completed)} className={`w-5 h-5 flex-shrink-0 rounded-full border-2 transition-all flex items-center justify-center self-start mt-1 ${task.completed ? 'bg-green-500 border-green-500' : 'border-gray-500 group-hover:border-purple-400'}`}>
            {task.completed && <CheckIcon className="w-3 h-3 text-white" />}
        </button>
    );

    return (
        <div className="flex items-start group bg-gray-800/50 hover:bg-gray-800/90 rounded-lg p-2 transition-colors">
            <CustomCheckbox />
            
            {task.goalId && (
                <div title={`Meta: ${task.goalTitle || ''}`} className="ml-2 text-purple-400 cursor-help flex-shrink-0 mt-1">
                    <IconTarget className="w-4 h-4" />
                </div>
            )}

            <textarea
                ref={textareaRef}
                value={text}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                placeholder="Escreva uma tarefa..."
                rows="1"
                className={`flex-1 mx-3 bg-transparent focus:outline-none text-sm leading-tight resize-none overflow-hidden ${task.completed ? 'line-through text-gray-500' : 'text-gray-200'}`}
            />
            
            <button onClick={() => onDelete(task.id)} className="flex-shrink-0 text-gray-600 hover:text-red-400 opacity-50 lg:opacity-0 group-hover:opacity-100 transition-opacity self-start mt-1" title="Excluir tarefa"><TrashIcon className="w-4 h-4" /></button>
        </div>
    );
};

export const TaskListBody = ({ tasks, taskUpdater, dateForNewTasks }) => {
    const [newTaskText, setNewTaskText] = useState('');
    const newTaskInputRef = useRef(null);
    const sortedTasks = useMemo(() => tasks.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0)), [tasks]);
    
    const handleAddTask = () => { if (newTaskText.trim() === '') return; taskUpdater({ type: 'ADD', payload: { date: dateForNewTasks, text: newTaskText } }); setNewTaskText(''); };
    
    const handleEnterOnNew = (e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTask(); } };
    const handleEnterOnItem = () => { newTaskInputRef.current?.focus(); };

    return (
        <div className="p-4 space-y-2">
            {sortedTasks.map(task => (
                <TaskItem key={task.id} task={task}
                    onUpdate={(id, updates) => taskUpdater({ type: 'UPDATE', payload: { id, ...updates } })}
                    onDelete={(id) => taskUpdater({ type: 'DELETE', payload: { id } })}
                    onToggle={(id, completed) => taskUpdater({ type: 'UPDATE', payload: { id, completed } })}
                    onEnter={handleEnterOnItem}
                />
            ))}
            <div className="flex items-center group bg-transparent p-2">
                <PlusIcon className="w-5 h-5 flex-shrink-0 text-gray-500 group-focus-within:text-purple-400" />
                <input ref={newTaskInputRef} type="text" value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} onKeyDown={handleEnterOnNew} onBlur={handleAddTask} placeholder="Adicionar tarefa..." className="flex-1 mx-3 bg-transparent focus:outline-none text-sm text-gray-300 placeholder-gray-500" />
            </div>
        </div>
    );
};

export const TaskSheet = ({ date, tasks, personalDay, onInfoClick, taskUpdater, isMobile = false }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    const energyClasses = {
        1: { bg: 'bg-red-500/20', text: 'text-red-300', border: 'border-red-500', progress: 'bg-red-500' },
        2: { bg: 'bg-orange-500/20', text: 'text-orange-300', border: 'border-orange-500', progress: 'bg-orange-500' },
        3: { bg: 'bg-yellow-500/20', text: 'text-yellow-300', border: 'border-yellow-500', progress: 'bg-yellow-500' },
        4: { bg: 'bg-lime-500/20', text: 'text-lime-300', border: 'border-lime-500', progress: 'bg-lime-500' },
        5: { bg: 'bg-cyan-500/20', text: 'text-cyan-300', border: 'border-cyan-500', progress: 'bg-cyan-500' },
        6: { bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-500', progress: 'bg-blue-500' },
        7: { bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-500', progress: 'bg-purple-500' },
        8: { bg: 'bg-pink-500/20', text: 'text-pink-300', border: 'border-pink-500', progress: 'bg-pink-500' },
        9: { bg: 'bg-teal-500/20', text: 'text-teal-300', border: 'border-teal-500', progress: 'bg-teal-500' },
        11: { bg: 'bg-violet-400/20', text: 'text-violet-300', border: 'border-violet-400', progress: 'bg-violet-400' },
        22: { bg: 'bg-indigo-400/20', text: 'text-indigo-300', border: 'border-indigo-400', progress: 'bg-indigo-400' },
        default: { bg: 'bg-gray-700/20', text: 'text-gray-300', border: 'border-gray-500', progress: 'bg-gray-400' }
    };
    
    const dateObj = useMemo(() => {
        if (!date) return new Date();
        if (typeof date === 'string') {
            return new Date(date.replace(/-/g, '/'));
        }
        return date;
    }, [date]);

    const currentEnergy = energyClasses[personalDay] || energyClasses.default;
    const formattedDate = dateObj.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
    const completedCount = tasks.filter(t => t.completed).length;
    const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;
    const allCompleted = tasks.length > 0 && completedCount === tasks.length;

    const handleMarkAllComplete = () => {
        tasks.forEach(task => {
            if (!task.completed) {
                taskUpdater({ type: 'UPDATE', payload: { id: task.id, completed: true } });
            }
        });
    };

    const HeaderContent = () => (
        <>
            <div className="flex-1 flex items-start gap-3">
                <div className="flex items-center gap-2 mt-1">
                    <button
                        onClick={(e) => { e.stopPropagation(); handleMarkAllComplete(); }}
                        className="text-gray-200 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                        disabled={allCompleted}
                        title="Marcar todas como concluídas"
                    >
                        <CheckAllIcon className="w-5 h-5"/>
                    </button>
                    <h2 className={`text-xl font-bold ${currentEnergy.text}`}>{formattedDate}</h2>
                </div>
            </div>
            <div className="flex-shrink-0 flex items-center gap-2">
                <div onClick={(e) => { e.stopPropagation(); onInfoClick(personalDay); }}>
                    <VibrationPill vibrationNumber={personalDay} />
                </div>
                {isMobile && <ChevronDownIcon className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />}
            </div>
        </>
    );

    return (
        <div className={`bg-gray-800/60 border ${currentEnergy.border} rounded-xl shadow-lg w-full transition-opacity ${allCompleted ? 'opacity-50' : ''}`}>
            {isMobile ? (
                <div onClick={() => setIsExpanded(!isExpanded)} className={`w-full text-left cursor-pointer ${currentEnergy.bg} p-4 rounded-t-xl flex justify-between items-start gap-3`}>
                    <HeaderContent />
                </div>
            ) : (
                <div className={`${currentEnergy.bg} p-4 rounded-t-xl flex justify-between items-start gap-3`}>
                    <HeaderContent />
                </div>
            )}
            
            <div className="mt-1">
                <div className="px-4">
                    <div className="flex justify-between text-xs font-semibold text-gray-300 mb-1">
                        <span>Progresso</span>
                        <span className="whitespace-nowrap">{completedCount} / {tasks.length}</span>
                    </div>
                    <div className="w-full bg-gray-900/50 rounded-full h-1.5"><div className={`${currentEnergy.progress} h-1.5 rounded-full transition-all duration-500`} style={{ width: `${progress}%` }}></div></div>
                </div>
            </div>
            
            {(!isMobile || isExpanded) && (
                <TaskListBody tasks={tasks} taskUpdater={taskUpdater} dateForNewTasks={dateObj} />
            )}
        </div>
    );
};