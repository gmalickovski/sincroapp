// src/pages/Tasks.jsx

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { db, auth } from '../services/firebase';
import { collection, onSnapshot, query, orderBy, doc, deleteDoc, updateDoc, Timestamp, writeBatch, addDoc } from "firebase/firestore";
import Spinner from '../components/ui/Spinner';
import numerologyEngine from '../services/numerologyEngine';
import { CheckboxIcon, XIcon, CalendarIcon, PlusIcon, CheckAllIcon, ChevronDownIcon, AlertTriangleIcon } from '../components/ui/Icons';
import VibrationPill from '../components/ui/VibrationPill';

// --- Função Utilitária para debounce ---
function useDebounce(callback, delay) {
    const timeoutRef = useRef(null);
    return useCallback((...args) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => callback(...args), delay);
    }, [callback, delay]);
}

// --- Subcomponente TaskItem (Layout Corrigido) ---
const TaskItem = ({ task, onUpdate, onEnter, onBackspace, onFocus, onToggle, isFirst }) => {
    const [text, setText] = useState(task.text);
    const inputRef = useRef(null);

    useEffect(() => {
        if (task.focus && inputRef.current) {
            inputRef.current.focus();
            const cursorPos = task.cursorPos === 'end' ? text.length : 0;
            inputRef.current.setSelectionRange(cursorPos, cursorPos);
        }
    }, [task.focus]);

    useEffect(() => { setText(task.text); }, [task.text]);

    const debouncedUpdate = useDebounce((newText) => {
        // Só salva se o texto realmente mudou
        if (newText !== task.text) {
            onUpdate(task.id, { text: newText });
        }
    }, 500);

    const handleChange = (e) => {
        setText(e.target.value);
        debouncedUpdate(e.target.value);
    };
    
    // Salva no "blur" (quando o usuário clica fora), se o texto mudou
    const handleBlur = () => {
      if (text !== task.text) {
        onUpdate(task.id, { text: text });
      }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            onEnter(task.order, e.target.selectionStart);
        } else if (e.key === 'Backspace' && e.target.selectionStart === 0 && e.target.selectionEnd === 0) {
            e.preventDefault();
            onBackspace(task.id, task.order, isFirst, task.text);
        } else if (e.key === 'ArrowUp' && e.target.selectionStart === 0) {
            e.preventDefault();
            onFocus(task.order - 1, 'end');
        } else if (e.key === 'ArrowDown' && e.target.selectionStart === text.length) {
            e.preventDefault();
            onFocus(task.order + 1, 'start');
        }
    };

    return (
        <div className="flex items-start group py-1">
            <button onClick={() => onToggle(task)} className="flex-shrink-0 mt-1 p-1">
                <CheckboxIcon checked={task.completed} />
            </button>
            <textarea
                ref={inputRef}
                value={text}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onFocus={() => onFocus(task.order)}
                onBlur={handleBlur}
                placeholder="Escreva uma tarefa..."
                className={`flex-1 ml-2 bg-transparent focus:outline-none focus:bg-gray-800/50 rounded-md px-2 py-1 transition-all text-sm resize-none overflow-hidden leading-tight ${task.completed ? 'line-through text-gray-500' : 'text-gray-300'}`}
                rows={1}
                onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = `${e.target.scrollHeight}px`; }}
            />
        </div>
    );
};

// --- Subcomponente TaskCard ---
const TaskCard = ({ date, tasks, personalDay, onInfoClick, onUpdateTasks }) => {
    const [localTasks, setLocalTasks] = useState([]);
    const [focusedTask, setFocusedTask] = useState(null);

    useEffect(() => {
        const sortedTasks = [...tasks].sort((a, b) => a.order - b.order);
        setLocalTasks(sortedTasks.map(t => ({...t, focus: t.order === focusedTask?.order, cursorPos: focusedTask?.cursorPos })));
    }, [tasks, focusedTask]);
    
    const handleFocus = (order, cursorPos = 'start') => setFocusedTask({ order, cursorPos });
    const handleUpdate = (taskId, updates) => onUpdateTasks({ type: 'UPDATE', payload: { id: taskId, ...updates } });
    const handleToggle = (task) => handleUpdate(task.id, { completed: !task.completed });

    const handleEnter = (currentOrder, cursorPosition) => {
        const currentTask = localTasks.find(t => t.order === currentOrder);
        if(!currentTask) return;
        
        const textBeforeCursor = currentTask.text.substring(0, cursorPosition);
        const textAfterCursor = currentTask.text.substring(cursorPosition);
        
        handleUpdate(currentTask.id, { text: textBeforeCursor });
        const newOrder = currentOrder + 0.5;
        onUpdateTasks({ type: 'ADD', payload: { date: new Date(date), order: newOrder, text: textAfterCursor } });
        handleFocus(newOrder, 'start');
    };

    const handleBackspace = (taskId, taskOrder, isFirst, currentText) => {
        if (isFirst && currentText === '') return; // Não apaga a primeira tarefa se estiver vazia
        const prevTask = localTasks.slice().reverse().find(t => t.order < taskOrder);
        
        if (prevTask) {
            const cursorPos = prevTask.text.length;
            handleFocus(prevTask.order, 'end');
            onUpdateTasks({ type: 'MERGE_DELETE', payload: { fromTaskId: taskId, fromTaskText: currentText, toTaskId: prevTask.id } });
        } else {
            onUpdateTasks({ type: 'DELETE', payload: { id: taskId } });
        }
    };
    
    const handleAddNewTask = () => {
        const newOrder = localTasks.length > 0 ? Math.max(...localTasks.map(t => t.order)) + 1 : 1;
        onUpdateTasks({ type: 'ADD', payload: { date: new Date(date), order: newOrder, text: '' } });
        handleFocus(newOrder);
    }

    const handleCompleteAll = () => onUpdateTasks({ type: 'COMPLETE_ALL', payload: { tasks } });
    const handleDeleteCard = () => {
        if (window.confirm("Apagar todas as tarefas deste dia?")) {
            onUpdateTasks({ type: 'DELETE_ALL', payload: { tasks } });
        }
    };

    const dateObj = new Date(date);
    dateObj.setMinutes(dateObj.getMinutes() + dateObj.getTimezoneOffset());
    const formattedDate = dateObj.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
    const isToday = getLocalDateKey(new Date()) === getLocalDateKey(dateObj);
    const allTasksCompleted = tasks.length > 0 && tasks.every(task => task.completed);

    return (
        <div className={`relative bg-gray-800/50 border rounded-2xl p-4 md:p-6 w-full animate-fade-in transition-opacity duration-500 ${isToday ? 'border-purple-500' : 'border-gray-700'} ${allTasksCompleted ? 'opacity-60' : ''}`}>
            <div className="flex justify-between items-start mb-4">
                <h2 className={`text-lg font-bold capitalize ${isToday ? 'text-purple-300' : 'text-white'}`}>{formattedDate}</h2>
                <div className="flex items-center gap-3 flex-shrink-0">
                    <VibrationPill vibrationNumber={personalDay} onClick={onInfoClick} />
                    <button onClick={handleCompleteAll} className="text-gray-400 hover:text-green-400 transition-colors" title="Finalizar todas"><CheckAllIcon className="w-5 h-5"/></button>
                    <button onClick={handleDeleteCard} className="text-gray-400 hover:text-red-400 transition-colors" title="Excluir card"><XIcon className="w-5 h-5"/></button>
                </div>
            </div>
            <div className="space-y-1">
                {localTasks.map((task, index) => (
                    <TaskItem 
                        key={task.id} 
                        task={task} 
                        isFirst={index === 0}
                        onToggle={handleToggle}
                        onUpdate={handleUpdate}
                        onEnter={handleEnter}
                        onBackspace={handleBackspace}
                        onFocus={handleFocus}
                    />
                ))}
            </div>
             <button onClick={handleAddNewTask} className="w-full text-left flex items-center gap-3 text-gray-500 hover:text-white transition-colors mt-3 pl-1 py-1">
                <PlusIcon className="w-5 h-5" /> <span className="text-sm">Adicionar tarefa</span>
            </button>
        </div>
    );
};

// --- Função Utilitária ---
const getLocalDateKey = (date) => date.toISOString().split('T')[0];

// --- Componente Principal ---
const Tasks = ({ userData, setActiveView, onInfoClick }) => {
    const [allTasks, setAllTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showPastTasks, setShowPastTasks] = useState(false);
    const user = auth.currentUser;

    useEffect(() => {
        if (!user) { setIsLoading(false); return; }
        const q = query(collection(db, 'users', user.uid, 'tasks'), orderBy('createdAt', 'asc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const tasksFromDb = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                order: doc.data().order || new Date(doc.data().createdAt.seconds * 1000).getTime(),
            }));
            setAllTasks(tasksFromDb);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [user]);

    const taskUpdater = useCallback(async (action) => {
        if (!user) return;
        const { type, payload } = action;
        const tasksRef = collection(db, 'users', user.uid, 'tasks');

        if (type === 'ADD') {
            await addDoc(tasksRef, { text: payload.text || '', completed: false, createdAt: Timestamp.fromDate(payload.date), order: payload.order });
        } else if (type === 'UPDATE') {
            const { id, ...updates } = payload;
            await updateDoc(doc(tasksRef, id), updates);
        } else if (type === 'DELETE') {
            await deleteDoc(doc(tasksRef, payload.id));
        } else if (type === 'MERGE_DELETE') {
            const { fromTaskId, fromTaskText, toTaskId } = payload;
            const toTaskRef = doc(tasksRef, toTaskId);
            const toTaskSnap = await getDoc(toTaskRef);
            if (toTaskSnap.exists()) {
                const toTaskData = toTaskSnap.data();
                const newText = toTaskData.text + fromTaskText;
                const batch = writeBatch(db);
                batch.update(toTaskRef, { text: newText });
                batch.delete(doc(tasksRef, fromTaskId));
                await batch.commit();
            }
        } else if (type === 'COMPLETE_ALL' || type === 'DELETE_ALL') {
            const batch = writeBatch(db);
            payload.tasks.forEach(task => {
                const taskRef = doc(tasksRef, task.id);
                if (type === 'COMPLETE_ALL') batch.update(taskRef, { completed: true });
                else batch.delete(taskRef);
            });
            await batch.commit();
        }
    }, [user]);

    const { pastDates, todayDate, futureDates, hasIncompletePastTasks } = useMemo(() => {
        const groups = allTasks.reduce((acc, task) => {
            const dateKey = getLocalDateKey(task.createdAt.toDate());
            if (!acc[dateKey]) acc[dateKey] = [];
            acc[dateKey].push(task);
            return acc;
        }, {});
        
        const todayKey = getLocalDateKey(new Date());
        const sortedDates = Object.keys(groups).sort((a, b) => new Date(a) - new Date(b));
        
        let incompletePast = false;
        const past = sortedDates.filter(date => {
            if (date < todayKey) {
                if (groups[date].some(task => !task.completed)) {
                    incompletePast = true;
                }
                return true;
            }
            return false;
        });

        return {
            pastDates: past.reverse(),
            todayDate: sortedDates.find(date => date === todayKey),
            futureDates: sortedDates.filter(date => date > todayKey),
            hasIncompletePastTasks: incompletePast,
        };
    }, [allTasks]);

    const renderTaskCard = (dateKey) => {
        const dateObj = new Date(dateKey);
        const personalDay = numerologyEngine.calculatePersonalDayForDate(dateObj, userData.dataNasc);
        return <TaskCard key={dateKey} date={dateKey} tasks={allTasks.filter(t => getLocalDateKey(t.createdAt.toDate()) === dateKey)} personalDay={personalDay} onInfoClick={onInfoClick} onUpdateTasks={taskUpdater} />;
    }

    return (
        <div className="p-4 md:p-8 text-white max-w-3xl mx-auto w-full">
            {isLoading ? <div className="flex justify-center mt-16"><Spinner /></div> : (
                <div className="space-y-6 md:space-y-8">
                    {hasIncompletePastTasks && (
                        <div className="bg-yellow-500/10 border border-yellow-400/50 text-yellow-300 text-sm font-semibold p-4 rounded-lg flex items-center gap-3">
                            <AlertTriangleIcon className="h-5 w-5" />
                            Você possui tarefas não finalizadas em dias anteriores.
                        </div>
                    )}

                    {pastDates.length > 0 && (
                        <div className="text-center border-b border-gray-700 pb-6">
                            <button onClick={() => setShowPastTasks(!showPastTasks)} className="text-sm font-semibold text-gray-400 hover:text-white transition-colors flex items-center gap-2 mx-auto">
                                <span>{showPastTasks ? 'Esconder dias anteriores' : `Mostrar ${pastDates.length} dias anteriores`}</span>
                                <ChevronDownIcon className={`w-5 h-5 transition-transform ${showPastTasks ? 'rotate-180' : ''}`} />
                            </button>
                        </div>
                    )}
                    
                    {showPastTasks && pastDates.map(dateKey => renderTaskCard(dateKey))}

                    {!todayDate && (
                         <div className="border-2 border-dashed border-gray-700 rounded-2xl p-4 w-full">
                            <button onClick={() => taskUpdater({ type: 'ADD', payload: { date: new Date(), order: 1 } })} className="w-full flex items-center justify-center gap-2 text-gray-400 h-16 hover:text-white transition-colors">
                                <PlusIcon className="w-6 h-6" />
                                <span className="font-semibold">Adicionar lista de tarefas para hoje</span>
                            </button>
                        </div>
                    )}
                    
                    {todayDate && renderTaskCard(todayDate)}
                    
                    {futureDates.map(dateKey => renderTaskCard(dateKey))}
                </div>
            )}
             <button onClick={() => setActiveView('calendar')} className="fixed bottom-6 right-6 bg-purple-600 text-white rounded-full p-4 shadow-lg hover:bg-purple-700 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-purple-500 z-20" aria-label="Planejar no Calendário">
                <CalendarIcon className="w-6 h-6" />
            </button>
        </div>
    );
};
export default Tasks;