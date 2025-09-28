import React, { useState } from 'react';
import DashboardCard from '../components/ui/DashboardCard';
import InfoCard from '../components/ui/InfoCard';
import { BookIcon, CheckSquareIcon, SunIcon, CompassIcon, MoonIcon, StarIcon, RepeatIcon, TarotIcon } from '../components/ui/Icons';
import { textosDescritivos, textosArcanos, bussolaAtividades, textosCiclosDeVida, textosExplicativos } from '../data/content';
import Spinner from '../components/ui/Spinner';
import { db } from '../services/firebase';
import { collection, query, where, onSnapshot, Timestamp, orderBy, limit } from "firebase/firestore";
import numerologyEngine from '../services/numerologyEngine';
import UpgradeCard from '../components/ui/UpgradeCard';
import InspirationModal from '../components/ui/InspirationModal';
import FloatingActionButton from '../components/ui/FloatingActionButton';
import TaskModal from '../components/ui/TaskModal';         // Importa o modal de Tarefas existente
import NewNoteEditor from '../components/ui/NewNoteEditor'; // Importa o editor de Anotações existente

// Card de Tarefas (Apenas Visualização)
const DailyTasksCard = React.memo(({ user, setActiveView }) => {
    const [tasks, setTasks] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        if (!user) { setIsLoading(false); return; }
        const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
        const q = query(collection(db, 'users', user.uid, 'tasks'), where('createdAt', '>=', Timestamp.fromDate(todayStart)), where('createdAt', '<=', Timestamp.fromDate(todayEnd)), orderBy('createdAt', 'desc'), limit(3));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [user]);

    const completedTasks = tasks.filter(task => task.completed).length;

    return (
        <DashboardCard title={`Foco do Dia (${completedTasks}/${tasks.length})`} icon={<CheckSquareIcon />}>
            <div className="flex-1">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full"><Spinner /></div>
                ) : tasks.length === 0 ? (
                    <p className="text-sm text-gray-400">Nenhuma tarefa para hoje.</p>
                ) : (
                    <div className="space-y-2 mt-2">
                        {tasks.map(task => (
                            <div key={task.id} className={`flex items-center text-sm ${task.completed ? 'text-gray-500 line-through' : 'text-gray-300'}`}>
                                <span className={`mr-2 h-2 w-2 rounded-full ${task.completed ? 'bg-green-500' : 'bg-purple-500'}`}></span>
                                {task.text}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <button onClick={() => setActiveView('tasks')} className="mt-4 w-full text-center text-sm text-purple-400 hover:text-purple-300 font-semibold">
                Ver todas as tarefas
            </button>
        </DashboardCard>
    );
});

// Card de Anotações (Apenas Visualização)
const QuickJournalCard = React.memo(({ user, setActiveView }) => {
    const [latestEntry, setLatestEntry] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        if (!user) { setIsLoading(false); return; }
        const q = query(collection(db, 'users', user.uid, 'journalEntries'), orderBy('createdAt', 'desc'), limit(1));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                setLatestEntry({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
            } else {
                setLatestEntry(null);
            }
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [user]);

    return (
        <DashboardCard title="Último Insight" icon={<BookIcon />}>
            <div className="flex-1">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full"><Spinner /></div>
                ) : latestEntry ? (
                    <button onClick={() => setActiveView('journal')} className="w-full text-left bg-gray-900/50 p-3 rounded-lg hover:bg-gray-700/50 transition-colors">
                        <p className="text-xs text-purple-300 font-semibold">
                            {new Date(latestEntry.createdAt.seconds * 1000).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
                        </p>
                        <p className="text-sm text-gray-300 truncate mt-1">{latestEntry.content}</p>
                    </button>
                ) : (
                    <p className="text-sm text-gray-400">Nenhuma anotação recente.</p>
                )}
            </div>
            <button onClick={() => setActiveView('journal')} className="mt-4 w-full text-center text-sm text-purple-400 hover:text-purple-300 font-semibold">
                Ver todas as anotações
            </button>
        </DashboardCard>
    );
});


function Dashboard({ user, userData, data, setActiveView, taskUpdater, onInfoClick }) {
    const [inspirationModalData, setInspirationModalData] = useState(null);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isNoteEditorOpen, setIsNoteEditorOpen] = useState(false);

    if (!data || !data.estruturas || !data.estruturas.cicloDeVidaAtual) {
        return <div className="p-4 md:p-6 text-white flex justify-center items-center h-full"><Spinner /></div>;
    }
    
    const isPremium = userData?.plano !== 'gratuito';
    const { diaPessoal, mesPessoal, anoPessoal } = data.numeros;
    const { arcanoRegente, arcanoAtual, cicloDeVidaAtual } = data.estruturas;
    
    const infoDia = textosDescritivos.diaPessoal[diaPessoal] || textosDescritivos.diaPessoal.default;
    const infoMes = textosDescritivos.mesPessoal[mesPessoal] || textosDescritivos.mesPessoal.default;
    const infoAno = textosDescritivos.anoPessoal[anoPessoal] || textosDescritivos.anoPessoal.default;
    const atividadesDoDia = bussolaAtividades[diaPessoal] || bussolaAtividades.default;
    
    const infoArcanoRegenteRaw = textosArcanos[arcanoRegente] || textosArcanos.default;
    const infoArcanoRegente = { ...infoArcanoRegenteRaw, titulo: infoArcanoRegenteRaw.tituloTradicional ? `${infoArcanoRegenteRaw.titulo} - ${infoArcanoRegenteRaw.tituloTradicional}` : infoArcanoRegenteRaw.titulo };
    const infoArcanoAtualRaw = textosArcanos[arcanoAtual?.numero] || textosArcanos.default;
    const infoArcanoAtual = { ...infoArcanoAtualRaw, titulo: infoArcanoAtualRaw.tituloTradicional ? `${infoArcanoAtualRaw.titulo} - ${infoArcanoAtualRaw.tituloTradicional}` : infoArcanoAtualRaw.titulo };
    const infoCicloAtualRaw = textosCiclosDeVida[cicloDeVidaAtual.regente] || textosCiclosDeVida.default;
    const infoCicloAtual = { ...infoCicloAtualRaw, periodo: `Período: ${cicloDeVidaAtual.periodo}` };
    
    const today = new Date();
    const todayTaskData = { date: today, tasks: [] }; // Passa a data de hoje para o TaskModal

    return (
        <>
            <InspirationModal 
                data={inspirationModalData}
                onClose={() => setInspirationModalData(null)}
            />
            {isTaskModalOpen && (
                <TaskModal 
                    isOpen={isTaskModalOpen}
                    onClose={() => setIsTaskModalOpen(false)}
                    dayData={todayTaskData}
                    userData={userData}
                    taskUpdater={taskUpdater}
                    onInfoClick={onInfoClick}
                />
            )}
            {isNoteEditorOpen && (
                <NewNoteEditor
                    entryData={{ date: today }}
                    user={user}
                    userData={userData}
                    onClose={() => setIsNoteEditorOpen(false)}
                    onInfoClick={onInfoClick}
                />
            )}

            <div className="p-4 md:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in text-gray-300">
                    
                    <InfoCard title="Vibração do Dia" number={diaPessoal} info={infoDia} icon={<SunIcon/>} colorClass={{text: 'text-cyan-300'}}
                        onCardClick={() => setInspirationModalData({ title: "Vibração do Dia", number: diaPessoal, info: infoDia, icon: <SunIcon/>, explicacao: textosExplicativos.vibracaoDia })}
                    />
                    <InfoCard title="Vibração do Mês" number={mesPessoal} info={infoMes} icon={<MoonIcon/>} colorClass={{text: 'text-indigo-300'}}
                        onCardClick={() => setInspirationModalData({ title: "Vibração do Mês", number: mesPessoal, info: infoMes, icon: <MoonIcon/>, explicacao: textosExplicativos.mesPessoal })}
                    />
                    <InfoCard title="Vibração do Ano" number={anoPessoal} info={infoAno} icon={<StarIcon/>} colorClass={{text: 'text-amber-300'}}
                        onCardClick={() => setInspirationModalData({ title: "Vibração do Ano", number: anoPessoal, info: infoAno, icon: <StarIcon/>, explicacao: textosExplicativos.anoPessoal })}
                    />
                    
                    <div className="lg:col-span-3">
                        {isPremium ? (
                            <InfoCard title={cicloDeVidaAtual.nome} number={cicloDeVidaAtual.regente} info={infoCicloAtual} icon={<RepeatIcon />} colorClass={{text: 'text-green-300'}}
                                onCardClick={() => setInspirationModalData({ title: cicloDeVidaAtual.nome, number: cicloDeVidaAtual.regente, info: infoCicloAtual, icon: <RepeatIcon/>, explicacao: textosExplicativos.cicloDeVida })}
                            />
                        ) : (
                            <UpgradeCard title="Desbloqueie seus Ciclos de Vida" featureText="Entenda os grandes temas da sua jornada com o plano Premium." />
                        )}
                    </div>

                    <InfoCard title="Arcano Regente" number={arcanoRegente} info={infoArcanoRegente} icon={<TarotIcon />}
                         onCardClick={() => setInspirationModalData({ title: "Arcano Regente", number: arcanoRegente, info: infoArcanoRegente, icon: <TarotIcon/>, explicacao: textosExplicativos.arcanoRegente })}
                    />
                    <InfoCard title="Arcano Vigente" number={arcanoAtual?.numero} info={infoArcanoAtual} icon={<TarotIcon />}
                         onCardClick={() => setInspirationModalData({ title: "Arcano Vigente", number: arcanoAtual?.numero, info: infoArcanoAtual, icon: <TarotIcon/>, explicacao: textosExplicativos.arcanoVigente })}
                    />
                    
                     <InfoCard 
                        title="Bússola de Atividades"
                        icon={<CompassIcon />}
                        onCardClick={() => setInspirationModalData({
                            title: "Bússola de Atividades",
                            icon: <CompassIcon />,
                            explicacao: textosExplicativos.bussolaAtividades,
                            customBody: (
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-bold text-green-400 mb-2">Potencializar</h4>
                                        <ul className="list-disc list-inside space-y-2 text-sm text-gray-300">{atividadesDoDia.potencializar.map((item, index) => (<li key={`pot-${index}`}>{item}</li>))}</ul>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-red-400 mb-2">Atenção</h4>
                                        <ul className="list-disc list-inside space-y-2 text-sm text-gray-300">{atividadesDoDia.atencao.map((item, index) => (<li key={`atn-${index}`}>{item}</li>))}</ul>
                                    </div>
                                </div>
                            )
                        })}
                    >
                        <div className="flex flex-col gap-4 h-full">
                            <div>
                                <h4 className="font-bold text-green-400 mb-1">Potencializar</h4>
                                <ul className="list-disc list-inside space-y-1 text-sm text-gray-400">{atividadesDoDia.potencializar.map((item, index) => (<li key={`pot-${index}`}>{item}</li>))}</ul>
                            </div>
                            <div>
                                <h4 className="font-bold text-red-400 mb-1">Atenção</h4>
                                <ul className="list-disc list-inside space-y-1 text-sm text-gray-400">{atividadesDoDia.atencao.map((item, index) => (<li key={`atn-${index}`}>{item}</li>))}</ul>
                            </div>
                        </div>
                    </InfoCard>
                    
                    {isPremium ? (
                        <DailyTasksCard user={user} setActiveView={setActiveView} />
                    ) : (
                        <UpgradeCard title="Acesse o Diário de Tarefas" featureText="Organize seu dia e alinhe suas ações com a energia do momento." />
                    )}
                    
                    <QuickJournalCard user={user} setActiveView={setActiveView} />
                </div>
            </div>
            
            <FloatingActionButton 
                onNewTask={() => setIsTaskModalOpen(true)}
                onNewNote={() => setIsNoteEditorOpen(true)}
            />
        </>
    );
}

export default Dashboard;