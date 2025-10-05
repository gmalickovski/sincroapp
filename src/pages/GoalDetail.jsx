import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../services/firebase';
import { collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc, query, orderBy, where, Timestamp, writeBatch } from 'firebase/firestore';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination } from 'swiper/modules';
import DicaDoDiaCard from '../components/ui/DicaDoDiaCard';
import { ArrowLeftIcon, PlusIcon, TrashIcon, CheckIcon, ChevronUpIcon, ChevronDownIcon } from '../components/ui/Icons';
import ScheduleMilestoneModal from '../components/ui/ScheduleMilestoneModal';

// COMPONENTES COM AJUSTES
const GoalInfoCard = ({ goal, formatDate, className = '' }) => (
    <div className={`bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col ${className}`.trim()}>
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">{goal.title}</h1>
        <p className="text-gray-400 text-sm lg:text-base mb-4 flex-grow">{goal.description}</p>
        <div className="flex justify-between items-center text-sm text-gray-300 mb-2">
            <span>Progresso</span>
            <span className="font-bold text-purple-400">{goal.progress}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
            <div className="bg-purple-600 h-3 rounded-full transition-all duration-500" style={{ width: `${goal.progress}%` }}></div>
        </div>
        <p className="text-right text-xs text-gray-500 mt-2">Data Alvo: {formatDate(goal.targetDate)}</p>
    </div>
);

const MilestonesList = ({ milestones, onToggle, onDelete }) => {
    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate();
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `${day}/${month}`;
    };

    return (
        <div className="space-y-2 px-1 pb-4">
            {milestones.map(milestone => (
                <div key={milestone.id} className="flex items-center group rounded-lg p-2 transition-colors hover:bg-gray-800/50">
                    <button onClick={() => onToggle(milestone)} className={`w-5 h-5 flex-shrink-0 rounded-full border-2 transition-all flex items-center justify-center ${milestone.completed ? 'bg-green-500 border-green-500' : 'border-gray-500 group-hover:border-purple-400'}`}>
                        {milestone.completed && <CheckIcon className="w-3 h-3 text-white" />}
                    </button>
                    <span className={`flex-1 mx-3 text-sm leading-tight ${milestone.completed ? 'line-through text-gray-500' : 'text-gray-200'}`}>{milestone.text}</span>
                    <span className="text-xs text-gray-500 mr-3">{formatDate(milestone.createdAt)}</span>
                    <button onClick={() => onDelete(milestone.id)} className="flex-shrink-0 text-gray-600 hover:text-red-400 opacity-50 lg:opacity-0 group-hover:opacity-100 transition-opacity" title="Excluir marco">
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
    );
};

const AddMilestoneInput = ({ value, onChange, onKeyDown, inputRef }) => ( <div className="flex items-center group bg-gray-900 p-3 border-t-2 border-purple-800/30" onClick={() => inputRef.current?.focus()}><PlusIcon className="w-5 h-5 flex-shrink-0 text-gray-500 group-focus-within:text-purple-400" /><input ref={inputRef} type="text" value={value} onChange={onChange} onKeyDown={onKeyDown} placeholder="Adicionar novo marco..." className="flex-1 mx-3 bg-transparent focus:outline-none text-sm text-gray-300 placeholder-gray-500" /></div> );

// =================================================================================
// Componente principal
// =================================================================================
const GoalDetail = ({ goal: initialGoal, onBack, data }) => {
  const [currentGoal, setCurrentGoal] = useState(initialGoal);
  const [milestones, setMilestones] = useState([]);
  const [newMilestoneText, setNewMilestoneText] = useState('');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [milestoneToSchedule, setMilestoneToSchedule] = useState('');
  const [isTopSectionVisible, setIsTopSectionVisible] = useState(true);
  
  const user = auth.currentUser;
  const inputRef = useRef(null);
  const diaPessoalNumero = data?.numeros?.diaPessoal;

  // EFEITO 1: Ouve as atualizações da META em tempo real
  useEffect(() => {
    if (user && initialGoal.id) {
        const goalDocRef = doc(db, 'users', user.uid, 'goals', initialGoal.id);
        const unsubscribe = onSnapshot(goalDocRef, (doc) => {
            if (doc.exists()) {
                setCurrentGoal({ id: doc.id, ...doc.data() });
            }
        });
        return () => unsubscribe();
    }
  }, [user, initialGoal.id]);

  // EFEITO 2: Ouve as atualizações dos MARCOS (tarefas)
  useEffect(() => { 
    if (user && currentGoal.id) { 
        const tasksColRef = collection(db, 'users', user.uid, 'tasks'); 
        const q = query(tasksColRef, where('goalId', '==', currentGoal.id), orderBy('createdAt', 'asc')); 
        const unsubscribe = onSnapshot(q, (snapshot) => { setMilestones(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))); }); return () => unsubscribe(); 
    } 
  }, [user, currentGoal.id]);

  // EFEITO 3: Atualiza o progresso da meta (agora está correto e reativo)
  useEffect(() => { 
    if (user && currentGoal.id) { 
        if (milestones.length > 0) { 
            const c = milestones.filter(m => m.completed).length; 
            const p = Math.round((c / milestones.length) * 100); 
            if (p !== currentGoal.progress) { 
                updateDoc(doc(db, 'users', user.uid, 'goals', currentGoal.id), { progress: p }); 
            } 
        } else if (currentGoal.progress !== 0) { 
            updateDoc(doc(db, 'users', user.uid, 'goals', currentGoal.id), { progress: 0 }); 
        } 
    } 
  }, [milestones, user, currentGoal]);

  const handleOpenScheduleModal = () => { const text = newMilestoneText.trim(); if (text === '') return; setMilestoneToSchedule(text); setIsScheduleModalOpen(true); setNewMilestoneText(''); };
  
  // NOVA LÓGICA DE AGENDAMENTO (SIMPLES E RECORRENTE)
  const handleScheduleMilestone = async (scheduleData) => {
    if (!user || !currentGoal.id) return;

    const { title, startDate, isRecurrent, endDate, weekdays } = scheduleData;
    const tasksColRef = collection(db, 'users', user.uid, 'tasks');
    
    // Agendamento simples
    if (!isRecurrent) {
        const sDate = new Date(startDate.replace(/-/g, '/'));
        try {
            await addDoc(tasksColRef, { text: title, completed: false, createdAt: Timestamp.fromDate(sDate), goalId: currentGoal.id, goalTitle: currentGoal.title });
        } catch (e) { console.error("Erro ao criar tarefa:", e); }
        return;
    }

    // Agendamento recorrente
    const batch = writeBatch(db);
    let currentDate = new Date(startDate.replace(/-/g, '/'));
    const finalDate = new Date(endDate.replace(/-/g, '/'));
    const dayMap = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
    const selectedDays = weekdays.map(d => dayMap[d]);

    while (currentDate <= finalDate) {
        if (selectedDays.includes(currentDate.getDay())) {
            const newDocRef = doc(tasksColRef); // Cria uma referência para um novo documento
            batch.set(newDocRef, {
                text: title,
                completed: false,
                createdAt: Timestamp.fromDate(currentDate),
                goalId: currentGoal.id,
                goalTitle: currentGoal.title
            });
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }

    try {
        await batch.commit();
    } catch (e) {
        console.error("Erro ao criar tarefas recorrentes:", e);
    }
  };

  const handleNewMilestoneKeyDown = (e) => { if (e.key === 'Enter') { e.preventDefault(); handleOpenScheduleModal(); } };
  const handleToggleMilestone = async (m) => { if (user) { await updateDoc(doc(db, 'users', user.uid, 'tasks', m.id), { completed: !m.completed }); } };
  const handleDeleteMilestone = async (id) => { if (user) { await deleteDoc(doc(db, 'users', user.uid, 'tasks', id)); } };
  const formatDate = (dStr) => { if (!dStr) return ''; const date = new Date(dStr + 'T00:00:00'); return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }); };

  return (
    <>
      <ScheduleMilestoneModal isOpen={isScheduleModalOpen} onClose={() => setIsScheduleModalOpen(false)} onSchedule={handleScheduleMilestone} milestoneTitle={milestoneToSchedule} />
      
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in h-full lg:h-auto lg:py-8">
        <div className="lg:hidden flex flex-col h-full">
            <div className="flex-shrink-0 pt-4">
              <button onClick={onBack} className="flex items-center text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors mb-4">
                  <ArrowLeftIcon className="h-5 w-5 mr-2" />
                  Voltar para todas as metas
              </button>
            </div>
            <div className={`flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${isTopSectionVisible ? 'max-h-96' : 'max-h-0 opacity-0'}`}>
                <Swiper modules={[Pagination]} spaceBetween={16} slidesPerView={1} pagination={{ clickable: true }} className="pb-4 equal-height-swiper">
                    <SwiperSlide className="h-full pb-4">
                        <GoalInfoCard goal={currentGoal} formatDate={formatDate} className="h-full" />
                    </SwiperSlide>
                    <SwiperSlide className="h-full pb-4">
                        <DicaDoDiaCard personalDayNumber={diaPessoalNumero} className="h-full" />
                    </SwiperSlide>
                </Swiper>
            </div>
            <div className="flex-1 flex flex-col min-h-0">
                <div className="flex justify-between items-center mb-2 flex-shrink-0 px-1">
                    <h2 className="text-2xl font-semibold text-white">Marcos da Jornada</h2>
                    <button onClick={() => setIsTopSectionVisible(!isTopSectionVisible)} className="p-2 text-gray-400 hover:text-white">
                        {isTopSectionVisible ? <ChevronUpIcon className="w-6 h-6"/> : <ChevronDownIcon className="w-6 h-6" />}
                    </button>
                </div>
                <div className="overflow-y-auto custom-scrollbar flex-grow">
                    <MilestonesList milestones={milestones} onToggle={handleToggleMilestone} onDelete={handleDeleteMilestone} />
                </div>
            </div>
            <div className="flex-shrink-0 mt-auto">
              <AddMilestoneInput value={newMilestoneText} onChange={(e) => setNewMilestoneText(e.target.value)} onKeyDown={handleNewMilestoneKeyDown} inputRef={inputRef} />
            </div>
        </div>
        
        <div className="hidden lg:grid lg:grid-cols-5 lg:gap-8">
            <div className="flex-shrink-0 col-span-5">
              <button onClick={onBack} className="flex items-center text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors mb-6">
                  <ArrowLeftIcon className="h-5 w-5 mr-2" />
                  Voltar para todas as metas
              </button>
            </div>
            <div className="lg:col-span-2 space-y-8">
                <GoalInfoCard goal={currentGoal} formatDate={formatDate} />
                <DicaDoDiaCard personalDayNumber={diaPessoalNumero} />
            </div>
            <div className="lg:col-span-3">
                <h2 className="text-2xl font-semibold text-white mb-4">Marcos da Jornada</h2>
                <MilestonesList milestones={milestones} onToggle={handleToggleMilestone} onDelete={handleDeleteMilestone} />
                <AddMilestoneInput value={newMilestoneText} onChange={(e) => setNewMilestoneText(e.target.value)} onKeyDown={handleNewMilestoneKeyDown} inputRef={inputRef} />
            </div>
        </div>
      </div>
    </>
  );
};

export default GoalDetail;