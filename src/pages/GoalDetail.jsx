import React, { useState, useEffect, useCallback } from 'react';
// CORREÇÃO: useOutletContext vem de 'react-router-dom'
import { useParams, useNavigate, useOutletContext } from 'react-router-dom'; 
import { db, auth } from '../services/firebase';
import { collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc, query, orderBy, where, Timestamp, writeBatch, getDocs, limit } from 'firebase/firestore';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination } from 'swiper/modules';
import DicaDoDiaCard from '../components/ui/DicaDoDiaCard';
import { ArrowLeftIcon, TrashIcon, CheckIcon, ChevronUpIcon, ChevronDownIcon, EditIcon, CalendarIcon } from '../components/ui/Icons';
import ScheduleMilestoneModal from '../components/ui/ScheduleMilestoneModal';
import AISuggestionsModal from '../components/ui/AISuggestionsModal';
import EditGoalModal from '../components/ui/EditGoalModal';
import FloatingActionButton from '../components/ui/FloatingActionButton'; 
import Spinner from '../components/ui/Spinner';

// O restante do arquivo permanece exatamente o mesmo
function debounce(func, wait) { let timeout; return function executedFunction(...args) { const later = () => { clearTimeout(timeout); func(...args); }; clearTimeout(timeout); timeout = setTimeout(later, wait); }; }

const GoalInfoCard = ({ goal, formatDate, onEdit, className = '' }) => (
    <div className={`bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col ${className}`.trim()}>
        <div className="flex justify-between items-start">
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2 flex-grow pr-4">{goal.title}</h1>
            <button onClick={onEdit} className="flex-shrink-0 text-gray-500 hover:text-purple-400 p-1" title="Editar meta">
                <EditIcon className="w-5 h-5" />
            </button>
        </div>
        <p className="text-gray-400 text-sm lg:text-base mb-4 flex-grow">{goal.description}</p>
        <div>
            <div className="flex justify-between items-center text-sm text-gray-300 mb-2"><span>Progresso</span><span className="font-bold text-purple-400">{goal.progress}%</span></div>
            <div className="w-full bg-gray-700 rounded-full h-3 mb-4"><div className="bg-purple-600 h-3 rounded-full transition-all duration-500" style={{ width: `${goal.progress}%` }}></div></div>
            <div className="flex items-center justify-end text-sm"><CalendarIcon className="w-4 h-4 mr-2 text-gray-400" /><span className="text-gray-400 mr-1">Alvo:</span><span className="font-semibold text-purple-300">{formatDate(goal.targetDate)}</span></div>
        </div>
    </div>
);

const MilestonesList = ({ milestones, onToggle, onDelete, onUpdate }) => { 
    const MilestoneItem = ({ milestone }) => { 
        const [text, setText] = useState(milestone.text); 
        const debouncedUpdate = useCallback(debounce((newText) => { if (newText !== milestone.text) { onUpdate(milestone.id, { text: newText }); } }, 400), [milestone.id, milestone.text, onUpdate]); 
        useEffect(() => { setText(milestone.text); }, [milestone.text]); 
        const handleChange = (e) => { setText(e.target.value); debouncedUpdate(e.target.value); }; 
        const handleBlur = () => { if (text.trim() !== milestone.text) { onUpdate(milestone.id, { text: text.trim() }); }}; 
        const handleKeyDown = (e) => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); }}; 
        const formatDate = (timestamp) => { if (!timestamp) return ''; return timestamp.toDate().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }); }; 
        return ( <div className="flex items-center group rounded-lg p-2 transition-colors hover:bg-gray-800/50"> <button onClick={() => onToggle(milestone)} className={`w-5 h-5 flex-shrink-0 rounded-full border-2 transition-all flex items-center justify-center ${milestone.completed ? 'bg-green-500 border-green-500' : 'border-gray-500 group-hover:border-purple-400'}`}>{milestone.completed && <CheckIcon className="w-3 h-3 text-white" />}</button> <input type="text" value={text} onChange={handleChange} onBlur={handleBlur} onKeyDown={handleKeyDown} placeholder="Escreva um marco..." className={`flex-1 mx-3 bg-transparent focus:outline-none text-sm leading-tight ${milestone.completed ? 'line-through text-gray-500' : 'text-gray-200'}`} /> <span className="text-xs text-gray-500 mr-3">{formatDate(milestone.createdAt)}</span> <button onClick={() => onDelete(milestone.id)} className="flex-shrink-0 text-gray-600 hover:text-red-400 opacity-50 lg:opacity-0 group-hover:opacity-100 transition-opacity" title="Excluir marco"> <TrashIcon className="w-4 h-4" /> </button> </div> ); 
    }; 
    return ( <div className="space-y-2 px-1 pb-4"> {milestones.map(milestone => <MilestoneItem key={milestone.id} milestone={milestone} />)} </div> ); 
};

const GoalDetail = () => {
    const { goalId } = useParams();
    const navigate = useNavigate();
    const { data, userData } = useOutletContext();

    const [currentGoal, setCurrentGoal] = useState(null);
    const [milestones, setMilestones] = useState([]);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [isTopSectionVisible, setIsTopSectionVisible] = useState(true);
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [userTasks, setUserTasks] = useState(null);
    const user = auth.currentUser;
    const diaPessoalNumero = data?.numeros?.diaPessoal;

    useEffect(() => { 
        if (!user || !goalId) return;
        const unsub = onSnapshot(doc(db, 'users', user.uid, 'goals', goalId), (doc) => { 
            if (doc.exists()) { 
                setCurrentGoal({ id: doc.id, ...doc.data() }); 
            } else { 
                console.error("Meta não encontrada!");
                navigate('/app/goals');
            } 
        }); 
        return () => unsub(); 
    }, [user, goalId, navigate]);
    
    useEffect(() => { 
        if (!user || !goalId) return;
        const q = query(collection(db, 'users', user.uid, 'tasks'), where('goalId', '==', goalId), orderBy('createdAt', 'asc')); 
        const unsub = onSnapshot(q, (snapshot) => { setMilestones(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))); }); 
        return () => unsub(); 
    }, [user, goalId]);
    
    useEffect(() => { 
        if (!user || !goalId || !currentGoal) return;
        if (milestones.length > 0) { 
            const c = milestones.filter(m => m.completed).length; 
            const p = Math.round((c / milestones.length) * 100); 
            if (p !== currentGoal.progress) { updateDoc(doc(db, 'users', user.uid, 'goals', goalId), { progress: p }); } 
        } else if (currentGoal.progress !== 0) { 
            updateDoc(doc(db, 'users', user.uid, 'goals', goalId), { progress: 0 }); 
        } 
    }, [milestones, user, goalId, currentGoal]);

    const handleOpenAiModal=useCallback(()=>{if(!user)return;setIsScheduleModalOpen(!1),setIsAiModalOpen(!0),setUserTasks(null);const e=async()=>{try{const t=query(collection(db,"users",user.uid,"tasks"),orderBy("createdAt","desc"),limit(15)),s=await getDocs(t);setUserTasks(s.docs.map((e=>e.data())))}catch(t){console.error("Erro ao buscar dados para IA:",t),setUserTasks([])}};e()},[user]);const handleCloseAiModal=useCallback(()=>setIsAiModalOpen(!1),[]),handleReturnToSchedule=useCallback(()=>{setIsAiModalOpen(!1),setIsScheduleModalOpen(!0)},[]),handleSaveGoal=useCallback(async e=>{user&&await updateDoc(doc(db,"users",user.uid,"goals",currentGoal.id),e)},[user,currentGoal?.id]),handleOpenScheduleModal=useCallback(()=>setIsScheduleModalOpen(!0),[]),handleCloseScheduleModal=useCallback(()=>setIsScheduleModalOpen(!1),[]),handleOpenEditModal=useCallback(()=>setIsEditModalOpen(!0),[]),handleCloseEditModal=useCallback(()=>setIsEditModalOpen(!1),[]);const handleScheduleMilestone=useCallback(async e=>{if(!user||!currentGoal?.id)return;const{title:t,startDate:s,isRecurrent:a,endDate:n,weekdays:i}=e;if(!t.trim())return void alert("O título do marco não pode estar vazio.");const l=collection(db,"users",user.uid,"tasks");if(!a){const o=new Date(`${s}T00:00:00`);try{await addDoc(l,{text:t,completed:!1,createdAt:Timestamp.fromDate(o),goalId:currentGoal.id,goalTitle:currentGoal.title})}catch(r){console.error("Erro ao criar tarefa:",r)}return}const c=writeBatch(db);let d=new Date(`${s}T00:00:00`);const u=new Date(`${n}T00:00:00`),m={sun:0,mon:1,tue:2,wed:3,thu:4,fri:5,sat:6},p=i.map((e=>m[e]));for(;d<=u;){if(p.includes(d.getDay())){const g=doc(l);c.set(g,{text:t,completed:!1,createdAt:Timestamp.fromDate(d),goalId:currentGoal.id,goalTitle:currentGoal.title})}d.setDate(d.getDate()+1)}try{await c.commit()}catch(f){console.error("Erro ao criar tarefas recorrentes:",f)}},[user,currentGoal?.id,currentGoal?.title]);const handleAiSuggestions=useCallback(async e=>{if(!user||!currentGoal?.id||0===e.length)return;const t=collection(db,"users",user.uid,"tasks"),s=writeBatch(db);e.forEach((e=>{const{title:a,date:n}=e,i=new Date(`${n}T00:00:00`),l=doc(t);s.set(l,{text:a,completed:!1,createdAt:Timestamp.fromDate(i),goalId:currentGoal.id,goalTitle:currentGoal.title})}));try{await s.commit()}catch(a){console.error("Erro ao adicionar marcos da IA em lote:",a)}},[user,currentGoal?.id,currentGoal?.title]);const handleToggleMilestone=useCallback(async e=>{user&&await updateDoc(doc(db,"users",user.uid,"tasks",e.id),{completed:!e.completed})},[user]),handleDeleteMilestone=useCallback(async e=>{user&&await deleteDoc(doc(db,"users",user.uid,"tasks",e))},[user]),handleUpdateMilestone=useCallback(async(e,t)=>{user&&await updateDoc(doc(db,"users",user.uid,"tasks",e),t)},[user]),formatDate=useCallback((e=>{if(!e)return"";const t=new Date(e+"T00:00:00");return t.toLocaleDateString("pt-BR",{day:"2-digit",month:"long",year:"numeric"})}),[]);

    if (!currentGoal) {
        return <div className="h-full w-full flex justify-center items-center"><Spinner /></div>;
    }

    return (
        <>
            <ScheduleMilestoneModal isOpen={isScheduleModalOpen} onClose={handleCloseScheduleModal} onSchedule={handleScheduleMilestone} milestoneTitle="" onAiSuggest={handleOpenAiModal} />
            <AISuggestionsModal isOpen={isAiModalOpen} onClose={handleCloseAiModal} onAddSuggestions={handleAiSuggestions} goalTitle={currentGoal.title} goalDescription={currentGoal.description} userBirthDate={userData?.dataNasc} onBack={handleReturnToSchedule} userTasks={userTasks} existingMilestones={milestones} numerologyData={data} />
            <EditGoalModal isOpen={isEditModalOpen} onClose={handleCloseEditModal} onSave={handleSaveGoal} goal={currentGoal} />
            
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in h-full lg:h-auto lg:py-8">
                <div className="lg:hidden flex flex-col h-full">
                    <div className="flex-shrink-0 pt-4"><button onClick={() => navigate('/app/goals')} className="flex items-center text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors mb-4"><ArrowLeftIcon className="h-5 w-5 mr-2" />Voltar</button></div>
                    <div className={`flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${isTopSectionVisible ? 'max-h-[50vh]' : 'max-h-0 opacity-0'}`}>
                        <Swiper modules={[Pagination]} spaceBetween={16} slidesPerView={1} pagination={{ clickable: true }} className="pb-4 equal-height-swiper"><SwiperSlide className="h-full pb-4"><GoalInfoCard goal={currentGoal} formatDate={formatDate} className="h-full" onEdit={handleOpenEditModal} /></SwiperSlide><SwiperSlide className="h-full pb-4"><DicaDoDiaCard personalDayNumber={diaPessoalNumero} className="h-full" /></SwiperSlide></Swiper>
                    </div>
                    <div className="flex-1 flex flex-col min-h-0">
                        <div className="flex justify-between items-center mb-2 flex-shrink-0 px-1"><h2 className="text-2xl font-semibold text-white">Marcos</h2><button onClick={() => setIsTopSectionVisible(!isTopSectionVisible)} className="p-2 text-gray-400 hover:text-white">{isTopSectionVisible ? <ChevronUpIcon className="w-6 h-6"/> : <ChevronDownIcon className="w-6 h-6" />}</button></div>
                        <div className="overflow-y-auto custom-scrollbar flex-grow"><MilestonesList milestones={milestones} onToggle={handleToggleMilestone} onDelete={handleDeleteMilestone} onUpdate={handleUpdateMilestone} /></div>
                    </div>
                </div>
                
                <div className="hidden lg:grid lg:grid-cols-5 lg:gap-8">
                    <div className="flex-shrink-0 col-span-5"><button onClick={() => navigate('/app/goals')} className="flex items-center text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors mb-6"><ArrowLeftIcon className="h-5 w-5 mr-2" />Voltar</button></div>
                    <div className="lg:col-span-2 space-y-8"><GoalInfoCard goal={currentGoal} formatDate={formatDate} onEdit={handleOpenEditModal} /><DicaDoDiaCard personalDayNumber={diaPessoalNumero} /></div>
                    <div className="lg:col-span-3"><div className="flex justify-between items-center mb-4"><h2 className="text-2xl font-semibold text-white">Marcos da Jornada</h2></div><MilestonesList milestones={milestones} onToggle={handleToggleMilestone} onDelete={handleDeleteMilestone} onUpdate={handleUpdateMilestone} /></div>
                </div>
            </div>
            
            <FloatingActionButton
                page="goalDetail"
                onNewMilestone={handleOpenScheduleModal}
            />
        </>
    );
};

export default GoalDetail;