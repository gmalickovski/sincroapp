// src/pages/GoalDetail.jsx (VERSÃO FINAL COM IA)

import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../services/firebase';
import { collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc, query, orderBy, where, Timestamp, writeBatch } from 'firebase/firestore';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination } from 'swiper/modules';
import DicaDoDiaCard from '../components/ui/DicaDoDiaCard';
import { ArrowLeftIcon, TrashIcon, CheckIcon, ChevronUpIcon, ChevronDownIcon, ClipboardCheckIcon, CalendarIcon, SparklesIcon } from '../components/ui/Icons';
import ScheduleMilestoneModal from '../components/ui/ScheduleMilestoneModal';
import AISuggestionsModal from '../components/ui/AISuggestionsModal';

// COMPONENTES (sem alterações)
const GoalInfoCard = ({ goal, formatDate, className = '' }) => ( <div className={`bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col ${className}`.trim()}><h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">{goal.title}</h1><p className="text-gray-400 text-sm lg:text-base mb-4 flex-grow">{goal.description}</p><div><div className="flex justify-between items-center text-sm text-gray-300 mb-2"><span>Progresso</span><span className="font-bold text-purple-400">{goal.progress}%</span></div><div className="w-full bg-gray-700 rounded-full h-3 mb-4"><div className="bg-purple-600 h-3 rounded-full transition-all duration-500" style={{ width: `${goal.progress}%` }}></div></div><div className="flex items-center justify-end text-sm"><CalendarIcon className="w-4 h-4 mr-2 text-gray-400" /><span className="text-gray-400 mr-1">Alvo:</span><span className="font-semibold text-purple-300">{formatDate(goal.targetDate)}</span></div></div></div> );
const MilestonesList = ({ milestones, onToggle, onDelete }) => { const formatDate = (timestamp) => { if (!timestamp) return ''; const date = timestamp.toDate(); const day = String(date.getDate()).padStart(2, '0'); const month = String(date.getMonth() + 1).padStart(2, '0'); return `${day}/${month}`; }; return ( <div className="space-y-2 px-1 pb-4">{milestones.map(milestone => (<div key={milestone.id} className="flex items-center group rounded-lg p-2 transition-colors hover:bg-gray-800/50"><button onClick={() => onToggle(milestone)} className={`w-5 h-5 flex-shrink-0 rounded-full border-2 transition-all flex items-center justify-center ${milestone.completed ? 'bg-green-500 border-green-500' : 'border-gray-500 group-hover:border-purple-400'}`}>{milestone.completed && <CheckIcon className="w-3 h-3 text-white" />}</button><span className={`flex-1 mx-3 text-sm leading-tight ${milestone.completed ? 'line-through text-gray-500' : 'text-gray-200'}`}>{milestone.text}</span><span className="text-xs text-gray-500 mr-3">{formatDate(milestone.createdAt)}</span><button onClick={() => onDelete(milestone.id)} className="flex-shrink-0 text-gray-600 hover:text-red-400 opacity-50 lg:opacity-0 group-hover:opacity-100 transition-opacity" title="Excluir marco"><TrashIcon className="w-4 h-4" /></button></div>))}</div> );};

// =================================================================================
// Componente principal
// =================================================================================
const GoalDetail = ({ goal: initialGoal, onBack, data }) => {
  const [currentGoal, setCurrentGoal] = useState(initialGoal);
  const [milestones, setMilestones] = useState([]);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isTopSectionVisible, setIsTopSectionVisible] = useState(true);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  
  const [milestonesToSchedule, setMilestonesToSchedule] = useState([]);

  const user = auth.currentUser;
  const diaPessoalNumero = data?.numeros?.diaPessoal;

  useEffect(() => { if (user && initialGoal.id) { const unsub = onSnapshot(doc(db, 'users', user.uid, 'goals', initialGoal.id), (doc) => { if (doc.exists()) { setCurrentGoal({ id: doc.id, ...doc.data() }); } }); return () => unsub(); } }, [user, initialGoal.id]);
  useEffect(() => { if (user && currentGoal.id) { const q = query(collection(db, 'users', user.uid, 'tasks'), where('goalId', '==', currentGoal.id), orderBy('createdAt', 'asc')); const unsub = onSnapshot(q, (snapshot) => { setMilestones(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))); }); return () => unsub(); } }, [user, currentGoal.id]);
  useEffect(() => { if (user && currentGoal.id) { if (milestones.length > 0) { const c = milestones.filter(m => m.completed).length; const p = Math.round((c / milestones.length) * 100); if (p !== currentGoal.progress) { updateDoc(doc(db, 'users', user.uid, 'goals', currentGoal.id), { progress: p }); } } else if (currentGoal.progress !== 0) { updateDoc(doc(db, 'users', user.uid, 'goals', currentGoal.id), { progress: 0 }); } } }, [milestones, user, currentGoal]);

  const handleOpenScheduleModal = () => {
    setMilestonesToSchedule(['']); 
    setIsScheduleModalOpen(true);
  };
  
  // ### ALTERAÇÃO PRINCIPAL: FUNÇÃO AGORA LIDA COM MÚLTIPLOS MARCOS ###
  const handleScheduleMilestone = async (scheduleData) => {
    if (!user || !currentGoal.id) return;
    const { titles, startDate, isRecurrent, endDate, weekdays } = scheduleData;
    if (!titles || titles.length === 0 || !titles[0]) {
      alert("O título do marco não pode estar vazio.");
      return;
    }
  
    const tasksColRef = collection(db, 'users', user.uid, 'tasks');
    const batch = writeBatch(db);
  
    titles.forEach(title => {
      if (!isRecurrent) {
        const sDate = new Date(startDate.replace(/-/g, '/'));
        const newDocRef = doc(tasksColRef);
        batch.set(newDocRef, { text: title, completed: false, createdAt: Timestamp.fromDate(sDate), goalId: currentGoal.id, goalTitle: currentGoal.title });
      } else {
        let currentDate = new Date(startDate.replace(/-/g, '/'));
        const finalDate = new Date(endDate.replace(/-/g, '/'));
        const dayMap = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
        const selectedDays = weekdays.map(d => dayMap[d]);
  
        while (currentDate <= finalDate) {
          if (selectedDays.includes(currentDate.getDay())) {
            const newDocRef = doc(tasksColRef);
            batch.set(newDocRef, { text: title, completed: false, createdAt: Timestamp.fromDate(currentDate), goalId: currentGoal.id, goalTitle: currentGoal.title });
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }
    });
  
    try {
      await batch.commit();
    } catch (e) {
      console.error("Erro ao agendar marcos:", e);
    }
  };

  const handleAiSuggestions = (suggestions) => {
    setMilestonesToSchedule(suggestions);
    setIsScheduleModalOpen(true); 
  };

  const handleToggleMilestone = async (m) => { if (user) { await updateDoc(doc(db, 'users', user.uid, 'tasks', m.id), { completed: !m.completed }); } };
  const handleDeleteMilestone = async (id) => { if (user) { await deleteDoc(doc(db, 'users', user.uid, 'tasks', id)); } };
  const formatDate = (dStr) => { if (!dStr) return ''; const date = new Date(dStr + 'T00:00:00'); return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }); };

  return (
    <>
      <ScheduleMilestoneModal 
        isOpen={isScheduleModalOpen} 
        onClose={() => setIsScheduleModalOpen(false)} 
        onSchedule={handleScheduleMilestone} 
        milestoneTitles={milestonesToSchedule} // Passa a lista de títulos
      />
      <AISuggestionsModal 
        isOpen={isAiModalOpen} 
        onClose={() => setIsAiModalOpen(false)} 
        onAddSuggestions={handleAiSuggestions}
        goalTitle={currentGoal.title}
        goalDescription={currentGoal.description}
      />
      
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in h-full lg:h-auto lg:py-8">
        {/* ... O restante do seu JSX (layouts mobile e desktop) continua o mesmo ... */}
        {/* Layout Mobile */}
        <div className="lg:hidden flex flex-col h-full">
            <div className="flex-shrink-0 pt-4"><button onClick={onBack} className="flex items-center text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors mb-4"><ArrowLeftIcon className="h-5 w-5 mr-2" />Voltar</button></div>
            <div className={`flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${isTopSectionVisible ? 'max-h-96' : 'max-h-0 opacity-0'}`}>
                <Swiper modules={[Pagination]} spaceBetween={16} slidesPerView={1} pagination={{ clickable: true }} className="pb-4 equal-height-swiper">
                    <SwiperSlide className="h-full pb-4"><GoalInfoCard goal={currentGoal} formatDate={formatDate} className="h-full" /></SwiperSlide>
                    <SwiperSlide className="h-full pb-4"><DicaDoDiaCard personalDayNumber={diaPessoalNumero} className="h-full" /></SwiperSlide>
                </Swiper>
            </div>
            <div className="flex-1 flex flex-col min-h-0">
                <div className="flex justify-between items-center mb-2 flex-shrink-0 px-1">
                    <div className="flex items-center space-x-2">
                        <h2 className="text-2xl font-semibold text-white">Marcos</h2>
                        <button onClick={() => setIsAiModalOpen(true)} className="p-1 rounded-full text-purple-400 hover:bg-purple-900/50 transition-colors" title="Sugerir marcos com IA">
                           <SparklesIcon className="w-5 h-5"/>
                        </button>
                    </div>
                    <button onClick={() => setIsTopSectionVisible(!isTopSectionVisible)} className="p-2 text-gray-400 hover:text-white">{isTopSectionVisible ? <ChevronUpIcon className="w-6 h-6"/> : <ChevronDownIcon className="w-6 h-6" />}</button>
                </div>
                <div className="overflow-y-auto custom-scrollbar flex-grow">
                    <MilestonesList milestones={milestones} onToggle={handleToggleMilestone} onDelete={handleDeleteMilestone} />
                </div>
            </div>
        </div>
        
        {/* Layout do Desktop */}
        <div className="hidden lg:grid lg:grid-cols-5 lg:gap-8">
            <div className="flex-shrink-0 col-span-5"><button onClick={onBack} className="flex items-center text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors mb-6"><ArrowLeftIcon className="h-5 w-5 mr-2" />Voltar</button></div>
            <div className="lg:col-span-2 space-y-8"><GoalInfoCard goal={currentGoal} formatDate={formatDate} /><DicaDoDiaCard personalDayNumber={diaPessoalNumero} /></div>
            <div className="lg:col-span-3">
                <div className="flex items-center space-x-3 mb-4">
                  <h2 className="text-2xl font-semibold text-white">Marcos da Jornada</h2>
                  <button onClick={() => setIsAiModalOpen(true)} className="p-2 rounded-full text-purple-400 hover:bg-purple-900/50 transition-colors" title="Sugerir marcos com IA">
                      <SparklesIcon className="w-6 h-6"/>
                  </button>
                </div>
                <MilestonesList milestones={milestones} onToggle={handleToggleMilestone} onDelete={handleDeleteMilestone} />
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