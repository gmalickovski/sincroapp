// src/pages/Tasks.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { db, auth } from '../services/firebase';
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import Spinner from '../components/ui/Spinner';
import numerologyEngine from '../services/numerologyEngine';
// --- CORREÇÃO DO CAMINHO DA IMPORTAÇÃO ---
import { CalendarIcon } from '../components/ui/Icons';
import { TaskSheet } from '../components/ui/TaskSheet';
import EditableTaskCard from '../components/ui/EditableTaskCard';

const Tasks = ({ userData, setActiveView, onInfoClick, taskUpdater }) => {
    const [allTasks, setAllTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const user = auth.currentUser;

    useEffect(() => {
        if (!user) { setIsLoading(false); return; }
        const q = query(collection(db, 'users', user.uid, 'tasks'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const tasksFromDb = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setAllTasks(tasksFromDb);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [user]);

    const { todayData, otherDays, todayKey } = useMemo(() => {
        const today = new Date();
        const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        const groups = allTasks.reduce((acc, task) => {
            if (!task.createdAt) return acc;
            const date = task.createdAt.toDate();
            const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            
            if (!acc[dateKey]) acc[dateKey] = [];
            acc[dateKey].push(task);
            return acc;
        }, {});
        
        const todayTasks = groups[todayKey] || [];
        delete groups[todayKey];

        const otherTaskGroups = Object.entries(groups);

        return { todayData: todayTasks, otherDays: otherTaskGroups, todayKey };
    }, [allTasks]);

    if (isLoading) {
        return <div className="flex justify-center mt-16"><Spinner /></div>;
    }
    
    return (
        <div className="p-4 md:p-8 text-white w-full max-w-7xl mx-auto h-full flex flex-col">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 flex-shrink-0">Tarefas</h1>

            {/* Layout Desktop */}
            <div className="hidden lg:grid grid-cols-2 gap-12 flex-1 overflow-hidden">
                <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
                    <TaskSheet 
                        date={todayKey}
                        tasks={todayData}
                        personalDay={numerologyEngine.calculatePersonalDayForDate(new Date(), userData.dataNasc)}
                        onInfoClick={onInfoClick}
                        taskUpdater={taskUpdater}
                    />
                </div>
                <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
                    {otherDays.length > 0 ? (
                        <div className="space-y-4">
                            {otherDays.map(([dateKey, tasks]) => (
                                <EditableTaskCard
                                    key={dateKey}
                                    date={dateKey}
                                    tasks={tasks}
                                    personalDay={numerologyEngine.calculatePersonalDayForDate(new Date(dateKey.replace(/-/g, '/')), userData.dataNasc)}
                                    onInfoClick={onInfoClick}
                                    taskUpdater={taskUpdater}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-gray-800/50 border-2 border-dashed border-gray-700 rounded-xl p-8 h-48 flex items-center justify-center">
                            <p className="text-gray-400 text-center">Seu histórico de listas aparecerá aqui.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Layout Mobile */}
            <div className="lg:hidden flex-1 flex flex-col overflow-hidden">
                <div className="flex-shrink-0 z-10 p-1">
                    <TaskSheet 
                        date={todayKey}
                        tasks={todayData}
                        personalDay={numerologyEngine.calculatePersonalDayForDate(new Date(), userData.dataNasc)}
                        onInfoClick={onInfoClick}
                        taskUpdater={taskUpdater}
                        isMobile={true}
                    />
                </div>
                <div className="flex-1 overflow-y-auto pt-4 space-y-4 pr-2 custom-scrollbar">
                    {otherDays.length > 0 && (
                        otherDays.map(([dateKey, tasks]) => (
                            <EditableTaskCard
                                key={dateKey}
                                date={dateKey}
                                tasks={tasks}
                                personalDay={numerologyEngine.calculatePersonalDayForDate(new Date(dateKey.replace(/-/g, '/')), userData.dataNasc)}
                                onInfoClick={onInfoClick}
                                taskUpdater={taskUpdater}
                            />
                        ))
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