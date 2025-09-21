// /src/pages/Dashboard.jsx

import React from 'react';
import DashboardCard from '../components/ui/DashboardCard';
import InfoCard from '../components/ui/InfoCard'; // Usando nosso componente padrão
import { BookIcon, CheckSquareIcon, SunIcon, CompassIcon, MoonIcon, StarIcon, RepeatIcon, TarotIcon } from '../components/ui/Icons';
import { textosDescritivos, textosArcanos, bussolaAtividades, textosTooltips, textosCiclosDeVida } from '../data/content';
import Spinner from '../components/ui/Spinner';
import { db } from '../services/firebase';
import { collection, query, where, onSnapshot, Timestamp, orderBy, limit, addDoc } from "firebase/firestore";
import numerologyEngine from '../services/numerologyEngine';
import UpgradeCard from '../components/ui/UpgradeCard';

// --- Subcomponentes (mantidos do seu código original para preservar a funcionalidade) ---
const DailyTasksCard = ({ user, setActiveView }) => {
    const [tasks, setTasks] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);
    React.useEffect(() => {
        if (!user) { setIsLoading(false); return; }
        const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
        const q = query( collection(db, 'users', user.uid, 'tasks'), where('createdAt', '>=', Timestamp.fromDate(todayStart)), where('createdAt', '<=', Timestamp.fromDate(todayEnd)), orderBy('createdAt', 'desc'), limit(3));
        const unsubscribe = onSnapshot(q, (snapshot) => { setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))); setIsLoading(false); }, (err) => { console.error("Erro:", err); setIsLoading(false); });
        return () => unsubscribe();
    }, [user]);
    return (<DashboardCard title="Diário de Tarefas (Hoje)" icon={<CheckSquareIcon />}><div className="flex-1">{isLoading ? <div className="flex items-center justify-center h-full"><Spinner /></div> : tasks.length === 0 ? <p className="text-sm text-gray-400">Nenhuma tarefa para hoje.</p> : <div className="space-y-2 mt-2">{tasks.map(task => (<div key={task.id} className={`flex items-center text-sm ${task.completed ? 'text-gray-500 line-through' : 'text-gray-300'}`}><span className={`mr-2 h-2 w-2 rounded-full ${task.completed ? 'bg-green-500' : 'bg-purple-500'}`}></span>{task.text}</div>))}</div>}</div><button onClick={() => setActiveView('tasks')} className="mt-4 w-full text-center text-sm text-purple-400 hover:text-purple-300 font-semibold">Ver todas as tarefas</button></DashboardCard>);
};
const QuickJournalCard = ({ user, userData, setActiveView }) => {
    const [note, setNote] = React.useState('');
    const [isSaving, setIsSaving] = React.useState(false);
    const [latestEntry, setLatestEntry] = React.useState(null);
    const [isLoadingLatest, setIsLoadingLatest] = React.useState(true);
    React.useEffect(() => {
        if (!user) { setIsLoadingLatest(false); return; }
        const q = query(collection(db, 'users', user.uid, 'journalEntries'), orderBy('createdAt', 'desc'), limit(1));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) { setLatestEntry({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() }); } else { setLatestEntry(null); }
            setIsLoadingLatest(false);
        });
        return () => unsubscribe();
    }, [user]);
    const handleSaveNote = async () => {
        if (note.trim() === '' || !user?.uid || !userData?.dataNasc) return;
        setIsSaving(true);
        try {
            const dateForNote = new Date();
            const personalDayForNote = numerologyEngine.calculatePersonalDayForDate(dateForNote, userData.dataNasc);
            await addDoc(collection(db, 'users', user.uid, 'journalEntries'), { content: note, createdAt: Timestamp.fromDate(dateForNote), personalDay: personalDayForNote });
            setNote('');
        } catch (error) { console.error("Erro:", error); } 
        finally { setIsSaving(false); }
    };
    return (<DashboardCard title="Anotação Rápida" icon={<BookIcon />}><p className="text-sm text-gray-400 mb-3">Algum insight sobre a vibração de hoje? Anote aqui!</p><textarea className="w-full h-24 bg-gray-900 border border-gray-600 rounded-lg p-3 text-sm" placeholder="Digite suas reflexões..." value={note} onChange={(e) => setNote(e.target.value)} /><button onClick={handleSaveNote} disabled={isSaving || note.trim() === ''} className="mt-4 w-full bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-500 flex justify-center items-center h-10">{isSaving ? <Spinner /> : 'Salvar Anotação'}</button>{!isLoadingLatest && latestEntry && (<div className="mt-4 pt-4 border-t border-gray-700"><h4 className="text-sm font-bold text-gray-400 mb-2">Última Anotação:</h4><button onClick={() => setActiveView('journal')} className="w-full text-left bg-gray-900/50 p-3 rounded-lg hover:bg-gray-700/50 transition-colors"><p className="text-xs text-purple-300 font-semibold">{new Date(latestEntry.createdAt.seconds * 1000).toLocaleDateString('pt-BR', {day:'2-digit', month:'long'})}</p><p className="text-sm text-gray-300 truncate mt-1">{latestEntry.content}</p></button></div>)}</DashboardCard>);
};
const Tooltip = ({ text, children }) => (
    <div className="relative group flex items-center cursor-help">
        {children}
        <div className="absolute bottom-full mb-2 w-max max-w-xs p-3 text-xs bg-gray-900 border border-gray-700 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            {text}
        </div>
    </div>
);

// --- Componente Principal do Dashboard ---
function Dashboard({ user, userData, data, setActiveView }) {
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
    
    // ### AJUSTE FINAL E CORRETO AQUI ###
    // A lógica agora constrói o título formatado ANTES de passá-lo para o InfoCard.
    const infoArcanoRegenteRaw = textosArcanos[arcanoRegente] || textosArcanos.default;
    const infoArcanoRegente = {
        ...infoArcanoRegenteRaw,
        titulo: infoArcanoRegenteRaw.tituloTradicional 
            ? `${infoArcanoRegenteRaw.titulo} - ${infoArcanoRegenteRaw.tituloTradicional}` 
            : infoArcanoRegenteRaw.titulo,
    };

    const infoArcanoAtualRaw = textosArcanos[arcanoAtual?.numero] || textosArcanos.default;
    const infoArcanoAtual = {
        ...infoArcanoAtualRaw,
        titulo: infoArcanoAtualRaw.tituloTradicional 
            ? `${infoArcanoAtualRaw.titulo} - ${infoArcanoAtualRaw.tituloTradicional}`
            : infoArcanoAtualRaw.titulo,
    };
    
    const infoCicloAtualRaw = textosCiclosDeVida[cicloDeVidaAtual.regente] || textosCiclosDeVida.default;
    const infoCicloAtual = {
        ...infoCicloAtualRaw,
        periodo: `Período: ${cicloDeVidaAtual.periodo}`
    };

    const BussolaCard = () => (
        <DashboardCard title={<Tooltip text={textosTooltips.bussolaAtividades}><span>Bússola de Atividades</span><span className="ml-2 h-4 w-4 flex items-center justify-center text-xs bg-gray-600 rounded-full">?</span></Tooltip>} icon={<CompassIcon />} className="row-span-1 md:row-span-2">
            <div className="flex flex-col gap-6 h-full">
                <div>
                    <h4 className="font-bold text-green-400 mb-2">Potencializar</h4>
                    <ul className="list-disc list-inside space-y-2 text-sm text-gray-400">{atividadesDoDia.potencializar.map((item, index) => (<li key={`pot-${index}`}>{item}</li>))}</ul>
                </div>
                <div>
                    <h4 className="font-bold text-red-400 mb-2">Atenção</h4>
                    <ul className="list-disc list-inside space-y-2 text-sm text-gray-400">{atividadesDoDia.atencao.map((item, index) => (<li key={`atn-${index}`}>{item}</li>))}</ul>
                </div>
            </div>
        </DashboardCard>
    );

    return (
        <div className="p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in text-gray-300">
                <InfoCard title="Vibração do Dia" tooltipText={textosTooltips.vibracaoDia} number={diaPessoal} info={infoDia} icon={<SunIcon/>} colorClass={{text: 'text-cyan-300', border: 'border-cyan-400', bg: 'bg-cyan-500'}} />
                <InfoCard title="Vibração do Mês" tooltipText={textosTooltips.mesPessoal} number={mesPessoal} info={infoMes} icon={<MoonIcon/>} colorClass={{text: 'text-indigo-300', border: 'border-indigo-400', bg: 'bg-indigo-500'}} />
                <InfoCard title="Vibração do Ano" tooltipText={textosTooltips.anoPessoal} number={anoPessoal} info={infoAno} icon={<StarIcon/>} colorClass={{text: 'text-amber-300', border: 'border-amber-400', bg: 'bg-amber-500'}} />
                
                <div className="lg:col-span-3">
                    {isPremium ? (
                        <InfoCard title={cicloDeVidaAtual.nome} tooltipText={textosTooltips.cicloDeVida} number={cicloDeVidaAtual.regente} info={infoCicloAtual} icon={<RepeatIcon />} colorClass={{text: 'text-green-300', border: 'border-green-400', bg: 'bg-green-500'}} />
                    ) : (
                        <UpgradeCard title="Desbloqueie seus Ciclos de Vida" featureText="Entenda os grandes temas da sua jornada com o plano Premium." />
                    )}
                </div>

                <InfoCard title="Arcano Regente" tooltipText={textosTooltips.arcanoRegente} number={arcanoRegente} info={infoArcanoRegente} icon={<TarotIcon />} />
                <InfoCard title="Arcano Vigente" tooltipText={textosTooltips.arcanoVigente} number={arcanoAtual?.numero} info={infoArcanoAtual} icon={<TarotIcon />} />
                
                <BussolaCard/>

                {isPremium ? (
                    <DailyTasksCard user={user} setActiveView={setActiveView} />
                ) : (
                     <UpgradeCard title="Acesse o Diário de Tarefas" featureText="Organize seu dia e alinhe suas ações com a energia do momento." />
                )}

                <QuickJournalCard user={user} userData={userData} setActiveView={setActiveView} />

            </div>
        </div>
    );
}

export default Dashboard;