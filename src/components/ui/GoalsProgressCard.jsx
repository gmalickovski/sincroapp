import React, { useState, useEffect } from 'react';
// ATUALIZAÇÃO 1: Importar 'useNavigate' para lidar com a navegação
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../../services/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import DashboardCard from './DashboardCard';
import CircularProgressBar from './CircularProgressBar';
import { IconTarget, CalendarIcon, ClipboardCheckIcon } from './Icons';
import Spinner from './Spinner';

// ATUALIZAÇÃO 2: A prop 'setActiveView' foi removida, pois a navegação agora é feita pelo 'navigate'
const GoalsProgressCard = ({ onSelectGoal }) => {
    // ATUALIZAÇÃO 3: Instanciar o hook de navegação
    const navigate = useNavigate();

    const [goals, setGoals] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = auth.currentUser;

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }
        const goalsQuery = query(collection(db, 'users', user.uid, 'goals'));
        const goalsUnsub = onSnapshot(goalsQuery, (snapshot) => {
            setGoals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        const tasksQuery = query(collection(db, 'users', user.uid, 'tasks'));
        const tasksUnsub = onSnapshot(tasksQuery, (snapshot) => {
            setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });

        return () => { goalsUnsub(); tasksUnsub(); };
    }, [user]);

    const activeGoals = goals.filter(g => g.progress < 100);
    const completedGoals = goals.length - activeGoals.length;
    const overallProgress = activeGoals.length > 0 ? activeGoals.reduce((acc, goal) => acc + goal.progress, 0) / activeGoals.length : 0;

    const getMilestoneCounts = (goalId) => {
        const goalTasks = tasks.filter(task => task.goalId === goalId);
        const completedCount = goalTasks.filter(task => task.completed).length;
        return { total: goalTasks.length, completed: completedCount };
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Não definida';
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const SlideWrapper = ({ onClick, children }) => (
        <div onClick={onClick} className="h-full w-full flex flex-col items-center justify-center gap-3 px-4 cursor-pointer">
            {children}
        </div>
    );

    if (loading) {
        return <DashboardCard title="Jornadas" icon={<IconTarget />} className="min-h-[220px] flex flex-col justify-center items-center"><Spinner /></DashboardCard>;
    }

    if (goals.length === 0) {
        return (
             <DashboardCard title="Jornadas" icon={<IconTarget />} className="min-h-[220px] flex flex-col justify-center items-center">
                 <div className="flex flex-col items-center text-center">
                     <p className="text-sm text-gray-400 mb-3">Você ainda não criou nenhuma meta.</p>
                     {/* ATUALIZAÇÃO 4: O botão agora navega para a página de metas */}
                     <button onClick={() => navigate('/app/goals')} className="text-sm font-semibold text-purple-400 hover:text-purple-300">Criar minha primeira meta</button>
                 </div>
             </DashboardCard>
        );
    }

    return (
        <DashboardCard title="Jornadas" icon={<IconTarget />} className="h-full flex flex-col">
            <div className="flex-1 flex flex-col min-h-0">
                <div className="flex-grow w-full min-h-0 flex flex-col justify-center pt-1 pb-6">
                     <Swiper
                         modules={[Pagination]}
                         spaceBetween={0}
                         slidesPerView={1}
                         pagination={{ el: '.goals-swiper-pagination', clickable: true }}
                         className="w-full"
                         autoHeight={true}
                     >
                         <SwiperSlide>
                             {/* ATUALIZAÇÃO 5: O clique no slide geral agora navega para a lista de metas */}
                             <SlideWrapper onClick={() => navigate('/app/goals')}>
                                 <h4 className="font-bold text-white text-xl">Progresso Geral</h4>
                                 <CircularProgressBar progress={overallProgress} size={180} strokeWidth={12}>
                                     <div className="text-sm font-semibold text-gray-300 mt-2 space-y-1">
                                         <div className="flex items-center justify-center gap-1.5">
                                             <IconTarget className="w-5 h-5 text-purple-400" />
                                             <span>{activeGoals.length} ativas / {completedGoals} concl.</span>
                                         </div>
                                     </div>
                                 </CircularProgressBar>
                             </SlideWrapper>
                         </SwiperSlide>
                         {activeGoals.map(goal => {
                             const milestoneCounts = getMilestoneCounts(goal.id);
                             return (
                                 <SwiperSlide key={goal.id}>
                                     {/* ATUALIZAÇÃO 6: O clique no slide específico continua usando a função 'onSelectGoal' que já funciona corretamente */}
                                     <SlideWrapper onClick={() => onSelectGoal(goal)}>
                                         <h4 className="font-bold text-white text-lg leading-tight text-center px-4" title={goal.title}>{goal.title}</h4>
                                         <CircularProgressBar progress={goal.progress} size={180} strokeWidth={12}>
                                             <div className="text-sm font-semibold text-gray-300 mt-2 space-y-1">
                                                 <div className="flex items-center justify-center gap-1.5">
                                                     <ClipboardCheckIcon className="w-4 h-4 text-purple-400" />
                                                     <span>{milestoneCounts.completed} / {milestoneCounts.total}</span>
                                                 </div>
                                                 <div className="flex items-center justify-center gap-1.5">
                                                     <CalendarIcon className="w-4 h-4 text-purple-400" />
                                                     <span>{formatDate(goal.targetDate)}</span>
                                                 </div>
                                             </div>
                                         </CircularProgressBar>
                                     </SlideWrapper>
                                 </SwiperSlide>
                             );
                         })}
                     </Swiper>
                </div>
                <div className="goals-swiper-pagination swiper-pagination flex-shrink-0 pb-2 pt-2"></div>
            </div>
        </DashboardCard>
    );
};

export default GoalsProgressCard;