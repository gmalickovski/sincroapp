// src/pages/GoalDetail.jsx

import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../services/firebase';
import { collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc, query, orderBy, where, Timestamp, writeBatch, getDocs } from 'firebase/firestore';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination } from 'swiper/modules';
import DicaDoDiaCard from '../components/ui/DicaDoDiaCard';
import { ArrowLeftIcon, TrashIcon, CheckIcon, ChevronUpIcon, ChevronDownIcon, ClipboardCheckIcon, SparklesIcon, EditIcon, CalendarIcon } from '../components/ui/Icons';
import ScheduleMilestoneModal from '../components/ui/ScheduleMilestoneModal';
import AISuggestionsModal from '../components/ui/AISuggestionsModal';

// --- Componentes Internos (Completos e Funcionais) ---
const GoalInfoCard = ({ goal, formatDate, onSaveDescription, onDeleteGoal, className = '' }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [description, setDescription] = useState(goal.description);
    useEffect(() => { setDescription(goal.description); }, [goal.description]);
    const handleSave = () => { if (description.trim() !== goal.description) { onSaveDescription(description.trim()); } setIsEditing(false); };
    return (
        <div className={`bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col ${className}`.trim()}>
            <div className="flex justify-between items-start"><h1 className="text-2xl lg:text-3xl font-bold text-white mb-2 flex-grow pr-4">{goal.title}</h1><button onClick={onDeleteGoal} className="flex-shrink-0 text-gray-500 hover:text-red-400 p-1" title="Excluir meta"><TrashIcon className="w-5 h-5" /></button></div>
            <div className="text-gray-400 text-sm lg:text-base mb-4 flex-grow relative group">{isEditing ? (<><textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-gray-700 rounded p-2 text-white h-24 resize-none" autoFocus /><div className="flex gap-2 mt-2"><button onClick={handleSave} className="bg-green-600 text-white px-3 py-1 text-xs rounded">Salvar</button><button onClick={() => { setIsEditing(false); setDescription(goal.description); }} className="bg-gray-600 text-white px-3 py-1 text-xs rounded">Cancelar</button></div></>) : (<><p>{goal.description}</p><button onClick={() => setIsEditing(true)} className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white" title="Editar descrição"><EditIcon className="w-4 h-4" /></button></>)}</div>
            <div><div className="flex justify-between items-center text-sm text-gray-300 mb-2"><span>Progresso</span><span className="font-bold text-purple-400">{goal.progress}%</span></div><div className="w-full bg-gray-700 rounded-full h-3 mb-4"><div className="bg-purple-600 h-3 rounded-full transition-all duration-500" style={{ width: `${goal.progress}%` }}></div></div><div className="flex items-center justify-end text-sm"><CalendarIcon className="w-4 h-4 mr-2 text-gray-400" /><span className="text-gray-400 mr-1">Alvo:</span><span className="font-semibold text-purple-300">{formatDate(goal.targetDate)}</span></div></div>
        </div>
    );
};

const MilestonesList = ({ milestones, onToggle, onDelete, onUpdate }) => {
    const EditableMilestone = ({ milestone }) => {
        const [isEditing, setIsEditing] = useState(false);
        const [text, setText] = useState(milestone.text);
        const inputRef = useRef(null);
        useEffect(() => { if (isEditing) { inputRef.current?.focus(); inputRef.current?.select(); } }, [isEditing]);
        const handleSave = () => { if (text.trim() && text.trim() !== milestone.text) { onUpdate(milestone.id, { text: text.trim() }); } setIsEditing(false); };
        const handleKeyDown = (e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') { setText(milestone.text); setIsEditing(false); }};
        const formatDate = (timestamp) => { if (!timestamp) return ''; const date = timestamp.toDate(); return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }); };
        return (
            <div className="flex items-center group rounded-lg p-2 transition-colors hover:bg-gray-800/50">
                <button onClick={() => onToggle(milestone)} className={`w-5 h-5 flex-shrink-0 rounded-full border-2 transition-all flex items-center justify-center ${milestone.completed ? 'bg-green-500 border-green-500' : 'border-gray-500 group-hover:border-purple-400'}`}>{milestone.completed && <CheckIcon className="w-3 h-3 text-white" />}</button>
                {isEditing ? (<input ref={inputRef} type="text" value={text} onChange={(e) => setText(e.target.value)} onBlur={handleSave} onKeyDown={handleKeyDown} className="flex-1 mx-3 text-sm bg-gray-700 rounded px-1 py-0.5 text-white" />) : (<span onClick={() => setIsEditing(true)} className={`flex-1 mx-3 text-sm leading-tight cursor-pointer ${milestone.completed ? 'line-through text-gray-500' : 'text-gray-200'}`}>{milestone.text}</span>)}
                <span className="text-xs text-gray-500 mr-3">{formatDate(milestone.createdAt)}</span>
                <button onClick={() => onDelete(milestone.id)} className="flex-shrink-0 text-gray-600 hover:text-red-400 opacity-50 lg:opacity-0 group-hover:opacity-100 transition-opacity" title="Excluir marco"><TrashIcon className="w-4 h-4" /></button>
            </div>
        );
    };
    return ( <div className="space-y-2 px-1 pb-4"> {milestones.map(milestone => <EditableMilestone key={milestone.id} milestone={milestone} />)} </div> );
};

// =================================================================================
// Componente principal
// =================================================================================
const GoalDetail = ({ goal: initialGoal, onBack, data, userData }) => {
    const [currentGoal, setCurrentGoal] = useState(initialGoal);
    const [milestones, setMilestones] = useState([]);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [isTopSectionVisible, setIsTopSectionVisible] = useState(true);
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  
    const user = auth.currentUser;
    const diaPessoalNumero = data?.numeros?.diaPessoal;

    useEffect(() => { if (user && initialGoal.id) { const unsub = onSnapshot(doc(db, 'users', user.uid, 'goals', initialGoal.id), (doc) => { if (doc.exists()) { setCurrentGoal({ id: doc.id, ...doc.data() }); } else { onBack(); } }); return () => unsub(); } }, [user, initialGoal.id, onBack]);
    useEffect(() => { if (user && currentGoal.id) { const q = query(collection(db, 'users', user.uid, 'tasks'), where('goalId', '==', currentGoal.id), orderBy('createdAt', 'asc')); const unsub = onSnapshot(q, (snapshot) => { setMilestones(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))); }); return () => unsub(); } }, [user, currentGoal.id]);
    useEffect(() => { if (user && currentGoal.id) { if (milestones.length > 0) { const c = milestones.filter(m => m.completed).length; const p = Math.round((c / milestones.length) * 100); if (p !== currentGoal.progress) { updateDoc(doc(db, 'users', user.uid, 'goals', currentGoal.id), { progress: p }); } } else if (currentGoal.progress !== 0) { updateDoc(doc(db, 'users', user.uid, 'goals', currentGoal.id), { progress: 0 }); } } }, [milestones, user, currentGoal]);

    const handleOpenScheduleModal = () => setIsScheduleModalOpen(true);
    
    // SUA LÓGICA ANTIGA E FUNCIONAL - MANTIDA 100% INTACTA
    const handleScheduleMilestone = async (scheduleData) => {
        if (!user || !currentGoal.id) return;
        const { title, startDate, isRecurrent, endDate, weekdays } = scheduleData;
        if (!title) { alert("O título do marco não pode estar vazio."); return; }
        const tasksColRef = collection(db, 'users', user.uid, 'tasks');
        if (!isRecurrent) { const sDate = new Date(startDate.replace(/-/g, '/')); try { await addDoc(tasksColRef, { text: title, completed: false, createdAt: Timestamp.fromDate(sDate), goalId: currentGoal.id, goalTitle: currentGoal.title }); } catch (e) { console.error("Erro ao criar tarefa:", e); } return; }
        const batch = writeBatch(db);
        let currentDate = new Date(startDate.replace(/-/g, '/'));
        const finalDate = new Date(endDate.replace(/-/g, '/'));
        const dayMap = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
        const selectedDays = weekdays.map(d => dayMap[d]);
        while (currentDate <= finalDate) { if (selectedDays.includes(currentDate.getDay())) { const newDocRef = doc(tasksColRef); batch.set(newDocRef, { text: title, completed: false, createdAt: Timestamp.fromDate(currentDate), goalId: currentGoal.id, goalTitle: currentGoal.title }); } currentDate.setDate(currentDate.getDate() + 1); }
        try { await batch.commit(); } catch (e) { console.error("Erro ao criar tarefas recorrentes:", e); }
    };

    // ### CORREÇÃO PRINCIPAL APLICADA AQUI ###
    const handleAiSuggestions = async (suggestions) => {
        if (!user || !currentGoal.id || suggestions.length === 0) return;

        // Itera sobre cada sugestão da IA
        for (const suggestion of suggestions) {
            // Formata a sugestão para se parecer com os dados do modal manual
            const scheduleData = {
                title: suggestion.title,
                startDate: suggestion.date, // O formato 'YYYY-MM-DD' é aceito
                isRecurrent: false,
                endDate: '',
                weekdays: []
            };
            // Chama a MESMA função que a criação manual usa
            await handleScheduleMilestone(scheduleData);
        }
    };

    const handleToggleMilestone = async (m) => { if (user) { await updateDoc(doc(db, 'users', user.uid, 'tasks', m.id), { completed: !m.completed }); } };
    const handleDeleteMilestone = async (id) => { if (user) { await deleteDoc(doc(db, 'users', user.uid, 'tasks', id)); } };
    const handleUpdateMilestone = async (id, updates) => { if (user) await updateDoc(doc(db, 'users', user.uid, 'tasks', id), updates); };
    const handleSaveGoalDescription = async (newDescription) => { if (user) await updateDoc(doc(db, 'users', user.uid, 'goals', currentGoal.id), { description: newDescription }); };
    const handleDeleteGoal = async () => { if (window.confirm("Tem certeza que deseja excluir esta meta e todos os seus marcos? Esta ação é irreversível.")) { if (user) { const tasksQuery = query(collection(db, 'users', user.uid, 'tasks'), where('goalId', '==', currentGoal.id)); const tasksSnapshot = await getDocs(tasksQuery); const batch = writeBatch(db); tasksSnapshot.forEach(doc => batch.delete(doc.ref)); await batch.commit(); await deleteDoc(doc(db, 'users', user.uid, 'goals', currentGoal.id)); onBack(); }}};
    const formatDate = (dStr) => { if (!dStr) return ''; const date = new Date(dStr + 'T00:00:00'); return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }); };

    return (
        <>
            <ScheduleMilestoneModal isOpen={isScheduleModalOpen} onClose={() => setIsScheduleModalOpen(false)} onSchedule={handleScheduleMilestone} milestoneTitle="" />
            <AISuggestionsModal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} onAddSuggestions={handleAiSuggestions} goalTitle={currentGoal.title} goalDescription={currentGoal.description} userBirthDate={userData?.dataNasc} />
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in h-full lg:h-auto lg:py-8">
                {/* Layout Mobile */}
                <div className="lg:hidden flex flex-col h-full">
                    <div className="flex-shrink-0 pt-4"><button onClick={onBack} className="flex items-center text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors mb-4"><ArrowLeftIcon className="h-5 w-5 mr-2" />Voltar</button></div>
                    <div className={`flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${isTopSectionVisible ? 'max-h-[50vh]' : 'max-h-0 opacity-0'}`}>
                        <Swiper modules={[Pagination]} spaceBetween={16} slidesPerView={1} pagination={{ clickable: true }} className="pb-4 equal-height-swiper">
                            <SwiperSlide className="h-full pb-4"><GoalInfoCard goal={currentGoal} formatDate={formatDate} className="h-full" onSaveDescription={handleSaveGoalDescription} onDeleteGoal={handleDeleteGoal} /></SwiperSlide>
                            <SwiperSlide className="h-full pb-4"><DicaDoDiaCard personalDayNumber={diaPessoalNumero} className="h-full" /></SwiperSlide>
                        </Swiper>
                    </div>
                    <div className="flex-1 flex flex-col min-h-0">
                        <div className="flex justify-between items-center mb-2 flex-shrink-0 px-1">
                            <div className="flex items-center space-x-2"><h2 className="text-2xl font-semibold text-white">Marcos</h2><button onClick={() => setIsAiModalOpen(true)} className="p-1 rounded-full text-purple-400 hover:bg-purple-900/50 transition-colors" title="Sugerir marcos com IA"><SparklesIcon className="w-5 h-5"/></button></div>
                            <button onClick={() => setIsTopSectionVisible(!isTopSectionVisible)} className="p-2 text-gray-400 hover:text-white">{isTopSectionVisible ? <ChevronUpIcon className="w-6 h-6"/> : <ChevronDownIcon className="w-6 h-6" />}</button>
                        </div>
                        <div className="overflow-y-auto custom-scrollbar flex-grow">
                            <MilestonesList milestones={milestones} onToggle={handleToggleMilestone} onDelete={handleDeleteMilestone} onUpdate={handleUpdateMilestone} />
                        </div>
                    </div>
                </div>
                {/* Layout Desktop */}
                <div className="hidden lg:grid lg:grid-cols-5 lg:gap-8">
                    <div className="flex-shrink-0 col-span-5"><button onClick={onBack} className="flex items-center text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors mb-6"><ArrowLeftIcon className="h-5 w-5 mr-2" />Voltar</button></div>
                    <div className="lg:col-span-2 space-y-8"><GoalInfoCard goal={currentGoal} formatDate={formatDate} onSaveDescription={handleSaveGoalDescription} onDeleteGoal={handleDeleteGoal} /><DicaDoDiaCard personalDayNumber={diaPessoalNumero} /></div>
                    <div className="lg:col-span-3">
                        <div className="flex items-center space-x-3 mb-4"><h2 className="text-2xl font-semibold text-white">Marcos da Jornada</h2><button onClick={() => setIsAiModalOpen(true)} className="p-2 rounded-full text-purple-400 hover:bg-purple-900/50 transition-colors" title="Sugerir marcos com IA"><SparklesIcon className="w-6 h-6"/></button></div>
                        <MilestonesList milestones={milestones} onToggle={handleToggleMilestone} onDelete={handleDeleteMilestone} onUpdate={handleUpdateMilestone} />
                    </div>
                </div>
            </div>
            <button onClick={handleOpenScheduleModal} className="fixed bottom-6 right-6 bg-purple-600 text-white rounded-full p-4 shadow-lg hover:bg-purple-700 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-purple-500 z-20" aria-label="Adicionar Novo Marco">
                <ClipboardCheckIcon className="w-7 h-7" />
            </button>
        </>
    );
};

export default GoalDetail;