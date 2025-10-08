import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { useNavigate, useOutletContext } from 'react-router-dom';
import DashboardCard from '../components/ui/DashboardCard';
import InfoCard from '../components/ui/InfoCard';
import { BookIcon, CheckSquareIcon, SunIcon, CompassIcon, MoonIcon, StarIcon, RepeatIcon, TarotIcon, CheckIcon, TrashIcon, EditIcon } from '../components/ui/Icons';
import { textosDescritivos, textosArcanos, bussolaAtividades, textosCiclosDeVida, textosExplicativos } from '../data/content';
import Spinner from '../components/ui/Spinner';
import { db } from '../services/firebase';
import { doc, getDoc, setDoc, collection, query, where, onSnapshot, Timestamp, orderBy, limit } from "firebase/firestore";
import UpgradeCard from '../components/ui/UpgradeCard';
import InspirationModal from '../components/ui/InspirationModal';
import FloatingActionButton from '../components/ui/FloatingActionButton';
import TaskModal from '../components/ui/TaskModal';
import SortableCard from '../components/ui/SortableCard';
import GoalsProgressCard from '../components/ui/GoalsProgressCard';

function debounce(func, wait) { let timeout; return function executedFunction(...args) { const later = () => { clearTimeout(timeout); func(...args); }; clearTimeout(timeout); timeout = setTimeout(later, wait); }; }

const DailyTasksCard = React.memo(({ user, navigate }) => { 
    const { taskUpdater } = useOutletContext();
    const [tasks, setTasks] = React.useState([]); 
    const [isLoading, setIsLoading] = React.useState(true); 

    React.useEffect(() => { 
        if (!user) { setIsLoading(false); return; } 
        const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0); 
        const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999); 
        const q = query(collection(db, 'users', user.uid, 'tasks'), where('createdAt', '>=', Timestamp.fromDate(todayStart)), where('createdAt', '<=', Timestamp.fromDate(todayEnd)), orderBy('createdAt', 'desc')); 
        const unsubscribe = onSnapshot(q, (snapshot) => { 
            setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))); 
            setIsLoading(false); 
        }); 
        return () => unsubscribe(); 
    }, [user]); 
    
    const completedTasks = tasks.filter(task => task.completed).length; 
    
    const TaskItem = ({ task }) => { 
        const [text, setText] = useState(task.text);
        const textareaRef = useRef(null);

        const adjustHeight = () => {
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
                textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
            }
        };

        useEffect(() => { adjustHeight(); }, [text]);

        const debouncedUpdate = useCallback(debounce((newText) => { 
            if (newText.trim() !== task.text) { 
                taskUpdater({ type: 'UPDATE', payload: { id: task.id, text: newText.trim() }}); 
            } 
        }, 500), [task.id, task.text, taskUpdater]); 
        
        useEffect(() => { setText(task.text); }, [task.text]); 
        
        const handleChange = (e) => { 
            setText(e.target.value); 
            debouncedUpdate(e.target.value); 
        }; 
        
        const handleToggle = () => { 
            taskUpdater({ type: 'UPDATE', payload: { id: task.id, completed: !task.completed }}); 
        }; 
        
        const handleDelete = () => { 
            if(window.confirm(`Tem certeza que deseja excluir a tarefa "${task.text}"?`)) { 
                taskUpdater({ type: 'DELETE', payload: { id: task.id }}); 
            } 
        }; 
        
        return ( 
            <div className="flex items-start group text-sm">
                <button onClick={handleToggle} className={`mt-1 w-5 h-5 flex-shrink-0 rounded-full border-2 transition-all flex items-center justify-center ${task.completed ? 'bg-green-500 border-green-500' : 'border-gray-500 group-hover:border-purple-400'}`}>
                    {task.completed && <CheckIcon className="w-3 h-3 text-white" />}
                </button> 
                <textarea 
                    ref={textareaRef}
                    value={text} 
                    onChange={handleChange} 
                    rows="1"
                    className={`flex-1 mx-2 bg-transparent focus:outline-none focus:bg-gray-700/50 rounded px-1 py-0.5 resize-none overflow-hidden ${task.completed ? 'line-through text-gray-500' : 'text-gray-300'}`} 
                />
                <button onClick={handleDelete} className="mt-1 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <TrashIcon className="w-4 h-4" />
                </button> 
            </div> 
        ); 
    }; 
    
    return ( 
        <DashboardCard title={`Foco do Dia (${completedTasks}/${tasks.length})`} icon={<CheckSquareIcon />} className="flex flex-col h-full"> 
            <div className="flex-1 flex flex-col min-h-0"> 
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {isLoading ? ( <div className="flex items-center justify-center h-full"><Spinner /></div> ) 
                    : tasks.length === 0 ? ( <div className="flex items-center justify-center h-full"><p className="text-sm text-gray-400">Nenhuma tarefa para hoje.</p></div> ) 
                    : ( <div className="space-y-3 mt-2">{tasks.map(task => <TaskItem key={task.id} task={task} />)}</div> )}
                </div> 
                <button onClick={() => navigate('/app/tasks')} className="mt-4 w-full text-center text-sm text-purple-400 hover:text-purple-300 font-semibold flex-shrink-0">
                    Ver todas as tarefas
                </button> 
            </div> 
        </DashboardCard> 
    ); 
});

const QuickJournalCard = React.memo(({ user, onNewNote, onEditNote, diaPessoal }) => {
    const [latestEntry, setLatestEntry] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    useEffect(() => {
        if (!user) { setIsLoading(false); return; }
        const q = query(
            collection(db, 'users', user.uid, 'journalEntries'),
            where('createdAt', '>=', Timestamp.fromDate(todayStart)),
            orderBy('createdAt', 'desc'),
            limit(1)
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                setLatestEntry({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
            } else {
                setLatestEntry(null);
            }
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [user, todayStart]);

    const inspirationalPrompt = `Como você sentiu a vibração do dia ${diaPessoal} hoje?`;

    return (
        <DashboardCard title="Diário de Bordo" icon={<BookIcon />} className="flex flex-col h-full">
            <div className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 p-1">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full"><Spinner /></div>
                    ) : latestEntry ? (
                        <button onClick={() => onEditNote(latestEntry)} className="w-full h-full text-left bg-gray-900/50 p-4 rounded-lg hover:bg-gray-700/50 transition-colors flex flex-col">
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-sm font-semibold text-gray-300">Seu insight de hoje</p>
                                <p className="text-xs text-purple-300">{new Date(latestEntry.createdAt.seconds * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                            <p className="text-sm text-gray-400 line-clamp-3 whitespace-pre-wrap break-words flex-1">
                                {latestEntry.content}
                            </p>
                            <div className="text-right text-xs text-gray-500 mt-2">Clique para editar</div>
                        </button>
                    ) : (
                        <button onClick={onNewNote} className="w-full h-full text-center bg-purple-500/10 border-2 border-dashed border-purple-500/30 p-4 rounded-lg hover:bg-purple-500/20 transition-colors flex flex-col justify-center items-center">
                            <p className="text-purple-200 font-semibold">{inspirationalPrompt}</p>
                            <div className="flex items-center gap-2 mt-3 text-sm text-white font-bold bg-purple-600 px-4 py-2 rounded-lg">
                                <EditIcon className="w-4 h-4" />
                                Registrar Insight
                            </div>
                        </button>
                    )}
                </div>
            </div>
        </DashboardCard>
    );
});


function Dashboard() {
    // ### CORREÇÃO APLICADA AQUI ###
    // Os dados agora são corretamente extraídos do contexto do Outlet.
    const { user, userData, data, taskUpdater, onInfoClick, isEditMode, setIsEditMode, handleOpenNewNote, handleEditNote } = useOutletContext();
    const navigate = useNavigate();
    const [cardOrder, setCardOrder] = useState(null);
    const [isLoadingOrder, setIsLoadingOrder] = useState(true);
    const longPressTimer = useRef();
    const touchMoveRef = useRef(false);

    const handleSelectGoal = (goal) => {
        if (goal && goal.id) {
            navigate(`/app/goaldetails/${goal.id}`);
        }
    };

    const handlePressStart = useCallback(() => {
        if (window.innerWidth >= 1024) return;
        if (isEditMode) return;
        touchMoveRef.current = false;
        longPressTimer.current = setTimeout(() => {
            if (!touchMoveRef.current) { setIsEditMode(true); }
        }, 800);
    }, [isEditMode, setIsEditMode]);

    const handlePressEnd = useCallback(() => { clearTimeout(longPressTimer.current); }, []);
    const handleTouchMove = useCallback(() => { touchMoveRef.current = true; clearTimeout(longPressTimer.current); }, []);

    const defaultOrder = useMemo(() => [
        'vibracaoDia', 'goalsProgress', 'vibracaoMes', 'vibracaoAno', 'cicloVida', 'arcanoRegente', 'arcanoVigente',
        'bussola', 'tarefas', 'anotacoes'
    ], []);

    useEffect(() => {
        const fetchCardOrder = async () => {
            if (!user) return;
            const userPrefsRef = doc(db, 'users', user.uid, 'preferences', 'dashboard');
            try {
                const docSnap = await getDoc(userPrefsRef);
                if (docSnap.exists() && docSnap.data().cardOrder) {
                    const savedOrder = docSnap.data().cardOrder;
                    const fullOrder = [...new Set([...savedOrder, ...defaultOrder])];
                    setCardOrder(fullOrder);
                } else {
                    setCardOrder(defaultOrder);
                }
            } catch (error) {
                console.error("Erro ao buscar a ordem dos cards:", error);
                setCardOrder(defaultOrder);
            } finally {
                setIsLoadingOrder(false);
            }
        };
        fetchCardOrder();
    }, [user, defaultOrder]);

    const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }));
    
    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setCardOrder((items) => {
                const oldIndex = items.indexOf(active.id);
                const newIndex = items.indexOf(over.id);
                const newOrder = arrayMove(items, oldIndex, newIndex);
                saveCardOrder(newOrder);
                return newOrder;
            });
        }
    };
    
    const saveCardOrder = async (newOrder) => {
        if (!user) return;
        try {
            const userPrefsRef = doc(db, 'users', user.uid, 'preferences', 'dashboard');
            await setDoc(userPrefsRef, { cardOrder: newOrder });
        } catch (error) {
            console.error("Erro ao salvar a ordem dos cards:", error);
        }
    };

    const [inspirationModalData, setInspirationModalData] = useState(null);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    
    if (!data || !data.estruturas || !data.estruturas.cicloDeVidaAtual || isLoadingOrder || !cardOrder) {
        return <div className="p-4 md:p-6 text-white flex justify-center items-center h-full"><Spinner /></div>;
    }
    
    const isPremium = userData?.plano !== 'gratuito';
    const { diaPessoal, mesPessoal, anoPessoal } = data.numeros;
    const { arcanoRegente, arcanoAtual, cicloDeVidaAtual } = data.estruturas;
    
    const infoDia=textosDescritivos.diaPessoal[diaPessoal]||textosDescritivos.diaPessoal.default;const infoMes=textosDescritivos.mesPessoal[mesPessoal]||textosDescritivos.mesPessoal.default,infoAno=textosDescritivos.anoPessoal[anoPessoal]||textosDescritivos.anoPessoal.default,atividadesDoDia=bussolaAtividades[diaPessoal]||bussolaAtividades.default,infoArcanoRegenteRaw=textosArcanos[arcanoRegente]||textosArcanos.default,infoArcanoRegente={...infoArcanoRegenteRaw,titulo:infoArcanoRegenteRaw.tituloTradicional?`${infoArcanoRegenteRaw.titulo} - ${infoArcanoRegenteRaw.tituloTradicional}`:infoArcanoRegenteRaw.titulo},infoArcanoAtualRaw=textosArcanos[arcanoAtual?.numero]||textosArcanos.default,infoArcanoAtual={...infoArcanoAtualRaw,titulo:infoArcanoAtualRaw.tituloTradicional?`${infoArcanoAtualRaw.titulo} - ${infoArcanoAtualRaw.tituloTradicional}`:infoArcanoAtualRaw.titulo},infoCicloAtualRaw=textosCiclosDeVida[cicloDeVidaAtual.regente]||textosCiclosDeVida.default,infoCicloAtual={...infoCicloAtualRaw,periodo:`Período: ${cicloDeVidaAtual.periodo}`};

    const cardComponents = {
        vibracaoDia: <InfoCard title="Vibração do Dia" number={diaPessoal} info={infoDia} icon={<SunIcon/>} colorClass={{text: 'text-cyan-300'}} onCardClick={() => !isEditMode && setInspirationModalData({ title: "Vibração do Dia", number: diaPessoal, info: infoDia, icon: <SunIcon/>, explicacao: textosExplicativos.vibracaoDia })} />,
        goalsProgress: <GoalsProgressCard onSelectGoal={handleSelectGoal} />,
        vibracaoMes: <InfoCard title="Vibração do Mês" number={mesPessoal} info={infoMes} icon={<MoonIcon/>} colorClass={{text: 'text-indigo-300'}} onCardClick={() => !isEditMode && setInspirationModalData({ title: "Vibração do Mês", number: mesPessoal, info: infoMes, icon: <MoonIcon/>, explicacao: textosExplicativos.mesPessoal })} />,
        vibracaoAno: <InfoCard title="Vibração do Ano" number={anoPessoal} info={infoAno} icon={<StarIcon/>} colorClass={{text: 'text-amber-300'}} onCardClick={() => !isEditMode && setInspirationModalData({ title: "Vibração do Ano", number: anoPessoal, info: infoAno, icon: <StarIcon/>, explicacao: textosExplicativos.anoPessoal })} />,
        cicloVida: <div className="lg:col-span-3 h-full">{isPremium ? <InfoCard title={cicloDeVidaAtual.nome} number={cicloDeVidaAtual.regente} info={infoCicloAtual} icon={<RepeatIcon />} colorClass={{text: 'text-green-300'}} onCardClick={() => !isEditMode && setInspirationModalData({ title: cicloDeVidaAtual.nome, number: cicloDeVidaAtual.regente, info: infoCicloAtual, icon: <RepeatIcon/>, explicacao: textosExplicativos.cicloDeVida })} /> : <UpgradeCard title="Desbloqueie seus Ciclos de Vida" featureText="Entenda os grandes temas da sua jornada com o plano Premium." />}</div>,
        arcanoRegente: <InfoCard title="Arcano Regente" number={arcanoRegente} info={infoArcanoRegente} icon={<TarotIcon />} onCardClick={() => !isEditMode && setInspirationModalData({ title: "Arcano Regente", number: arcanoRegente, info: infoArcanoRegente, icon: <TarotIcon/>, explicacao: textosExplicativos.arcanoRegente })} />,
        arcanoVigente: <InfoCard title="Arcano Vigente" number={arcanoAtual?.numero} info={infoArcanoAtual} icon={<TarotIcon />} onCardClick={() => !isEditMode && setInspirationModalData({ title: "Arcano Vigente", number: arcanoAtual?.numero, info: infoArcanoAtual, icon: <TarotIcon/>, explicacao: textosExplicativos.arcanoVigente })} />,
        bussola: <InfoCard title="Bússola de Atividades" icon={<CompassIcon />} onCardClick={() => !isEditMode && setInspirationModalData({ title: "Bússola de Atividades", icon: <CompassIcon />, explicacao: textosExplicativos.bussolaAtividades, customBody: (<div className="space-y-4"><div><h4 className="font-bold text-green-400 mb-2">Potencializar</h4><ul className="list-disc list-inside space-y-2 text-sm text-gray-300">{atividadesDoDia.potencializar.map((item, index) => (<li key={`pot-${index}`}>{item}</li>))}</ul></div><div><h4 className="font-bold text-red-400 mb-2">Atenção</h4><ul className="list-disc list-inside space-y-2 text-sm text-gray-300">{atividadesDoDia.atencao.map((item, index) => (<li key={`atn-${index}`}>{item}</li>))}</ul></div></div>)})}><div className="flex flex-col gap-4 h-full"><div><h4 className="font-bold text-green-400 mb-1">Potencializar</h4><ul className="list-disc list-inside space-y-1 text-sm text-gray-400">{atividadesDoDia.potencializar.map((item, index) => (<li key={`pot-${index}`}>{item}</li>))}</ul></div><div><h4 className="font-bold text-red-400 mb-1">Atenção</h4><ul className="list-disc list-inside space-y-1 text-sm text-gray-400">{atividadesDoDia.atencao.map((item, index) => (<li key={`atn-${index}`}>{item}</li>))}</ul></div></div></InfoCard>,
        tarefas: isPremium ? <DailyTasksCard user={user} navigate={navigate} /> : <UpgradeCard title="Acesse o Foco do Dia" featureText="Organize seu dia e alinhe suas ações com a energia do momento." />,
        anotacoes: <QuickJournalCard user={user} onNewNote={handleOpenNewNote} onEditNote={handleEditNote} diaPessoal={diaPessoal} />
    };

    return (
        <div className="relative min-h-screen">
            <InspirationModal data={inspirationModalData} onClose={() => setInspirationModalData(null)} />
            {isTaskModalOpen && <TaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} dayData={{ date: new Date(), tasks: [] }} userData={userData} taskUpdater={taskUpdater} onInfoClick={onInfoClick} />}
            
            <div 
                className="p-4 md:p-6"
                onTouchStart={handlePressStart}
                onTouchEnd={handlePressEnd}
                onTouchMove={handleTouchMove}
                onMouseDown={handlePressStart}
                onMouseUp={handlePressEnd}
                onMouseLeave={handlePressEnd}
            >
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={cardOrder} strategy={rectSortingStrategy}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in text-gray-300 items-stretch">
                            {cardOrder.map(id => (
                                cardComponents[id] && (
                                    <SortableCard key={id} id={id} isEditMode={isEditMode}>
                                        {cardComponents[id]}
                                    </SortableCard>
                                )
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            </div>
            
            <div className="fixed bottom-6 right-6 z-20">
                {isEditMode ? (
                    <button
                        onClick={() => setIsEditMode(false)}
                        className="flex lg:hidden items-center justify-center w-14 h-14 bg-green-500 text-white rounded-full shadow-lg transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-green-400 animate-fade-in"
                        title="Concluir Edição"
                    >
                        <CheckIcon className="w-7 h-7" />
                    </button>
                ) : (
                    <FloatingActionButton 
                        page="dashboard"
                        onNewTask={() => setIsTaskModalOpen(true)}
                        onNewNote={handleOpenNewNote}
                    />
                )}
            </div>
        </div>
    );
}

export default Dashboard;