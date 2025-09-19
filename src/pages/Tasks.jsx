// src/pages/Tasks.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { db, auth } from '../services/firebase';
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import Spinner from '../components/ui/Spinner';
import numerologyEngine from '../services/numerologyEngine';
import { CalendarIcon, ChevronDownIcon } from '../components/ui/Icons';
import { TaskSheet } from '../components/ui/TaskSheet';
import EditableTaskCard from '../components/ui/EditableTaskCard';

const TASKS_INITIAL_LOAD = 5;
const TASKS_PER_LOAD = 10;

const Tasks = ({ userData, setActiveView, onInfoClick, taskUpdater }) => {
    const [allTasks, setAllTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [visibleCount, setVisibleCount] = useState(TASKS_INITIAL_LOAD);
    const user = auth.currentUser;

    useEffect(() => {
        if (!user) { setIsLoading(false); return; }
        const q = query(collection(db, 'users', user.uid, 'tasks'), orderBy('createdAt', 'asc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const tasksFromDb = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setAllTasks(tasksFromDb);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [user]);

    const { todayData, otherDays } = useMemo(() => {
        const groups = allTasks.reduce((acc, task) => {
            const dateKey = task.createdAt.toDate().toISOString().split('T')[0];
            if (!acc[dateKey]) acc[dateKey] = [];
            acc[dateKey].push(task);
            return acc;
        }, {});
        
        const todayKey = new Date().toISOString().split('T')[0];
        const todayTasks = groups[todayKey] || [];
        delete groups[todayKey];

        const otherTaskGroups = Object.entries(groups)
            .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA));

        return { todayData: todayTasks, otherDays: otherTaskGroups };
    }, [allTasks]);

    const todayKey = new Date().toISOString().split('T')[0];
    const visibleDays = otherDays.slice(0, visibleCount);
    const loadMore = () => setVisibleCount(prevCount => prevCount + TASKS_PER_LOAD);

    if (isLoading) {
        return <div className="flex justify-center mt-16"><Spinner /></div>;
    }
    
    return (
        <div className="p-4 md:p-8 text-white w-full max-w-7xl mx-auto h-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-12">
                
                {/* Coluna da Esquerda: Foco no Dia Atual */}
                <div className="lg:col-span-1">
                    <div className="lg:sticky lg:top-8">
                         {/* TÍTULO AJUSTADO */}
                         <h2 className="text-lg font-semibold text-gray-400 mb-4">Lista de Hoje</h2>
                        <TaskSheet 
                            date={todayKey}
                            tasks={todayData}
                            personalDay={numerologyEngine.calculatePersonalDayForDate(new Date(), userData.dataNasc)}
                            onInfoClick={onInfoClick}
                            taskUpdater={taskUpdater}
                        />
                    </div>
                </div>

                {/* Coluna da Direita: Arquivo Vivo */}
                <div className="lg:col-span-1 mt-12 lg:mt-0">
                    {/* TÍTULO AJUSTADO */}
                    <h2 className="text-lg font-semibold text-gray-400 mb-4">Listas Anteriores e Futuras</h2>
                    {visibleDays.length > 0 ? (
                        <div className="space-y-4">
                            {visibleDays.map(([dateKey, tasks]) => (
                                <EditableTaskCard
                                    key={dateKey}
                                    date={dateKey}
                                    tasks={tasks}
                                    personalDay={numerologyEngine.calculatePersonalDayForDate(new Date(dateKey.replace(/-/g, '/')), userData.dataNasc)}
                                    onInfoClick={onInfoClick}
                                    taskUpdater={taskUpdater}
                                />
                            ))}
                            {otherDays.length > visibleCount && (
                                <button 
                                    onClick={loadMore} 
                                    className="w-full mt-4 text-center text-sm text-purple-400 hover:text-purple-300 font-semibold p-3 bg-gray-800/50 rounded-lg flex items-center justify-center gap-2"
                                >
                                    <ChevronDownIcon className="w-5 h-5" /> Carregar mais antigos
                                </button>
                            )}
                        </div>
                    ) : (
                         <div className="bg-gray-800/50 border-2 border-dashed border-gray-700 rounded-xl p-8 h-48 flex items-center justify-center">
                            <p className="text-gray-400 text-center">Seu histórico de listas aparecerá aqui.</p>
                        </div>
                    )}
                </div>
            </div>

            <button onClick={() => setActiveView('calendar')} className="fixed bottom-6 right-6 bg-purple-600 text-white rounded-full p-4 shadow-lg hover:bg-purple-700 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-purple-500 z-20" aria-label="Planejar no Calendário">
                <CalendarIcon className="w-6 h-6" />
            </button>
        </div>
    );
};

export default Tasks;