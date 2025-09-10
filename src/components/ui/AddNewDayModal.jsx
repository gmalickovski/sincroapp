import React, { useState, useRef, useEffect } from 'react';
import { db, auth } from '../../services/firebase';
import { collection, doc, writeBatch, Timestamp } from "firebase/firestore";
import numerologyEngine from '../../services/numerologyEngine';
import Spinner from './Spinner';
import { CheckboxIcon, XIcon, CalendarIcon } from './Icons';

const AddNewDayModal = ({ isOpen, onClose, userData }) => {
    if (!isOpen) return null;

    const [selectedDate, setSelectedDate] = useState('');
    const [tasks, setTasks] = useState([]); 
    const [nextId, setNextId] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    
    const taskInputRefs = useRef([]);
    const dateInputRef = useRef(null);

    useEffect(() => {
        taskInputRefs.current = taskInputRefs.current.slice(0, tasks.length);
    }, [tasks]);

    const personalDay = selectedDate ? numerologyEngine.calculatePersonalDayForDate(new Date(selectedDate.replace(/-/g, '/')), userData.dataNasc) : null;
    const energyColors = { 1: 'bg-red-500 text-white', 2: 'bg-orange-500 text-white', 3: 'bg-yellow-500 text-black', 4: 'bg-lime-500 text-black', 5: 'bg-cyan-500 text-black', 6: 'bg-blue-500 text-white', 7: 'bg-purple-500 text-white', 8: 'bg-pink-500 text-white', 9: 'bg-teal-500 text-white', default: 'bg-gray-700 text-white' };
    const energyBorderColors = { 1: 'border-red-500', 2: 'border-orange-500', 3: 'border-yellow-500', 4: 'border-lime-500', 5: 'border-cyan-500', 6: 'border-blue-500', 7: 'border-purple-500', 8: 'border-pink-500', 9: 'border-teal-500', default: 'border-gray-700' };

    const handleUpdateTaskText = (id, text) => {
        setTasks(currentTasks => currentTasks.map(task => task.id === id ? { ...task, text } : task));
    };

    const handleDeleteTask = (idToDelete) => {
        setTasks(currentTasks => currentTasks.filter(task => task.id !== idToDelete));
    };
    
    const handleTaskKeyDown = (e, index) => {
        const { key } = e;
        const text = e.target.value;

        if (key === 'Enter') {
            e.preventDefault();
            const newTasks = [...tasks.slice(0, index + 1), { id: nextId, text: '' }, ...tasks.slice(index + 1)];
            setTasks(newTasks);
            setNextId(prevId => prevId + 1);
            setTimeout(() => taskInputRefs.current[index + 1]?.focus(), 0);
        } else if (key === 'Backspace' && text === '' && tasks.length > 0) {
            e.preventDefault();
            const taskToFocus = taskInputRefs.current[index - 1];
            const textToMerge = tasks[index - 1]?.text || '';
            handleDeleteTask(tasks[index].id);
            if(taskToFocus) {
                setTimeout(() => {
                    taskToFocus.focus();
                    taskToFocus.setSelectionRange(textToMerge.length, textToMerge.length);
                }, 0);
            }
        } else if (key === 'ArrowUp' && index > 0) {
            e.preventDefault();
            taskInputRefs.current[index - 1]?.focus();
        } else if (key === 'ArrowDown' && index < tasks.length - 1) {
            e.preventDefault();
            taskInputRefs.current[index + 1]?.focus();
        }
    };
    
    const handleSave = async () => {
        const validTasks = tasks.filter(t => t.text.trim() !== '');
        if (selectedDate && validTasks.length > 0) {
            setIsSaving(true);
            const user = auth.currentUser;
            if (!user) { setIsSaving(false); return; }
            const date = new Date(selectedDate.replace(/-/g, '/'));
            const batch = writeBatch(db);
            
            validTasks.forEach(task => {
                const newTaskRef = doc(collection(db, 'users', user.uid, 'tasks'));
                batch.set(newTaskRef, { text: task.text, completed: false, createdAt: Timestamp.fromDate(date) });
            });
            
            try { await batch.commit(); } catch (error) { console.error("Erro ao salvar tarefas:", error); } 
            finally { setIsSaving(false); onClose(); }
        }
    };
    
    const addFirstTask = () => {
        if(tasks.length === 0) {
            setTasks([{ id: 0, text: '' }]);
            setNextId(1);
        }
    };

    const openDatePicker = () => {
        try { dateInputRef.current?.showPicker(); } 
        catch (error) { console.error("Este navegador não suporta showPicker().", error); }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className={`relative bg-gray-800 text-white p-6 rounded-2xl shadow-2xl w-full max-w-lg transition-all border-t-4 ${energyBorderColors[personalDay] || energyBorderColors.default}`} onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-3 right-3 p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"><XIcon className="w-5 h-5" /></button>
                <h2 className="text-xl font-bold mb-4">Nova Lista de Tarefas</h2>
                
                <div className="flex items-center gap-2 mb-4">
                    <div className="relative w-full">
                        <div onClick={openDatePicker} className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 cursor-pointer z-10" title="Selecionar data">
                           <CalendarIcon className="w-full h-full text-gray-400" />
                        </div>
                        <input ref={dateInputRef} type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="custom-date-input bg-gray-700 border border-gray-600 rounded-lg p-2 text-sm w-full pl-10"/>
                    </div>
                    {personalDay && <div className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${energyColors[personalDay] || energyColors.default}`}>Vibração {personalDay}</div>}
                </div>
                
                <div className="min-h-[150px] space-y-2 pt-2" onClick={addFirstTask}>
                    {tasks.map((task, index) => (
                        <div key={task.id} className="flex items-center group">
                            <CheckboxIcon checked={false} />
                            <input ref={el => taskInputRefs.current[index] = el} type="text" placeholder="Digite uma tarefa" value={task.text} onChange={e => handleUpdateTaskText(task.id, e.target.value)} onKeyDown={e => handleTaskKeyDown(e, index)} className="w-full bg-transparent focus:outline-none placeholder-gray-500 ml-3 text-sm" autoFocus={index === tasks.length -1} />
                            <button onClick={() => handleDeleteTask(task.id)} className="ml-2 p-1 rounded-md text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-colors" title="Excluir tarefa">
                                <XIcon className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                    {tasks.length === 0 && <p className="text-gray-500 text-center pt-10 cursor-pointer">Clique aqui para começar a adicionar tarefas</p>}
                </div>

                <div className="flex justify-end mt-6">
                    <button onClick={handleSave} disabled={!selectedDate || tasks.filter(t => t.text.trim() !== '').length === 0 || isSaving} className="bg-purple-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-purple-700 disabled:bg-gray-600 flex items-center justify-center w-32">
                        {isSaving ? <Spinner/> : 'Salvar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddNewDayModal;