import React, { useState, useEffect } from 'react';
import DashboardCard from '../components/ui/DashboardCard';
import { StarIcon, BookIcon, CheckSquareIcon } from '../components/ui/Icons';
import { textosDescritivos, textosArcanos, bussolaAtividades } from '../data/content';
import Spinner from '../components/ui/Spinner';
import { db } from '../services/firebase';
import { collection, query, where, onSnapshot, Timestamp, orderBy, limit, addDoc } from "firebase/firestore";
import numerologyEngine from '../services/numerologyEngine';

// --- Subcomponentes do Dashboard (Lógica interna inalterada) ---
const DailyTasksCard = ({ user, setActiveView }) => {
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    useEffect(() => {
        if (!user) { setIsLoading(false); return; }
        const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
        const q = query( collection(db, 'users', user.uid, 'tasks'), where('createdAt', '>=', Timestamp.fromDate(todayStart)), where('createdAt', '<=', Timestamp.fromDate(todayEnd)), orderBy('createdAt', 'desc'), limit(3));
        const unsubscribe = onSnapshot(q, (snapshot) => { setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))); setIsLoading(false); setError(''); },
            (err) => { console.error("Erro:", err); setError("Não foi possível carregar."); setIsLoading(false); }
        );
        return () => unsubscribe();
    }, [user]);
    return (
        <DashboardCard title="Tarefas de Hoje" icon={<CheckSquareIcon />} className="h-full flex flex-col">
            {isLoading ? <div className="flex-1 flex items-center justify-center"><Spinner /></div>
            : error ? <p className="text-sm text-red-400">{error}</p>
            : tasks.length === 0 ? <p className="text-sm text-gray-400 flex-1 flex items-center justify-center">Nenhuma tarefa para hoje.</p>
            : <div className="space-y-2 mt-2">{tasks.map(task => (<div key={task.id} className={`flex items-center text-sm ${task.completed ? 'text-gray-500 line-through' : 'text-gray-300'}`}><span className={`mr-2 h-2 w-2 rounded-full ${task.completed ? 'bg-green-500' : 'bg-purple-500'}`}></span>{task.text}</div>))}</div>}
            <button onClick={() => setActiveView('tasks')} className="mt-auto pt-4 w-full text-center text-sm text-purple-400 hover:text-purple-300 font-semibold">Ver todas as tarefas</button>
        </DashboardCard>
    );
};
const QuickJournalCard = ({ user, userData }) => {
    const [note, setNote] = useState('');
    const [isSaving, setIsSaving] = useState(false);
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
    return (
        <DashboardCard title="Diário de Bordo Rápido" icon={<BookIcon />} className="h-full flex flex-col">
            <p className="text-sm text-gray-400 mb-3">Algum insight sobre a energia de hoje? Anote aqui!</p>
            <textarea className="w-full flex-1 bg-gray-900 border border-gray-600 rounded-lg p-3 text-sm" placeholder="Digite suas reflexões..." value={note} onChange={(e) => setNote(e.target.value)} />
            <button onClick={handleSaveNote} disabled={isSaving || note.trim() === ''} className="mt-4 w-full bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-500 flex justify-center items-center h-10">{isSaving ? <Spinner /> : 'Salvar Anotação'}</button>
        </DashboardCard>
    );
};
const Tooltip = ({ text, children }) => (<div className="relative group flex items-center">{children}<div className="absolute bottom-full mb-2 w-max max-w-xs p-3 text-xs bg-gray-900 border border-gray-700 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">{text}</div></div>);

// --- Componente Principal do Dashboard ---
function Dashboard({ user, userData, data, setActiveView }) {
    if (!data || !data.estruturas) {
        return <div className="p-4 md:p-6 text-white flex justify-center items-center h-full"><Spinner /></div>;
    }
    
    const diaPessoal = data.numeros?.diaPessoal || 'default';
    const arcanoRegente = data.estruturas.arcanoRegente;
    const arcanoAtual = data.estruturas.arcanoAtual?.numero;
    const infoDia = textosDescritivos.diaPessoal[diaPessoal] || textosDescritivos.diaPessoal.default;
    const infoArcanoRegente = textosArcanos[arcanoRegente] || textosArcanos.default;
    const infoArcanoAtual = textosArcanos[arcanoAtual] || textosArcanos.default;
    const atividadesDoDia = bussolaAtividades[diaPessoal] || bussolaAtividades.default;

    const ArcanoRegenteCard = () => (
        <DashboardCard title={<Tooltip text="Seu arcano fundamental."><span>Arcano Regente</span><span className="ml-2 h-4 w-4 flex items-center justify-center text-xs bg-gray-600 rounded-full">?</span></Tooltip>}>
            <div className="flex flex-col md:flex-row items-center text-center md:text-left"><div className="flex-shrink-0 w-full h-20 md:w-20 md:h-28 bg-gray-700/50 border border-gray-600 rounded-lg flex items-center justify-center md:mr-6 mb-4 md:mb-0"><span className="text-5xl font-bold text-purple-300">{arcanoRegente || '?'}</span></div><div><h4 className="font-bold text-white text-lg">{infoArcanoRegente.nomeTradicional || infoArcanoRegente.nome}</h4><p className="mt-2 text-sm text-gray-400">{infoArcanoRegente.descricao}</p></div></div>
        </DashboardCard>
    );
    const ArcanoVigenteCard = () => (
        <DashboardCard title={<Tooltip text="A energia que te influencia neste ciclo."><span>Arcano Vigente</span><span className="ml-2 h-4 w-4 flex items-center justify-center text-xs bg-gray-600 rounded-full">?</span></Tooltip>}>
            <div className="flex flex-col md:flex-row items-center text-center md:text-left"><div className="flex-shrink-0 w-full h-20 md:w-20 md:h-28 bg-gray-700/50 border border-gray-600 rounded-lg flex items-center justify-center md:mr-6 mb-4 md:mb-0"><span className="text-5xl font-bold text-purple-300">{arcanoAtual || '?'}</span></div><div><h4 className="font-bold text-white text-lg">{infoArcanoAtual.nomeTradicional || infoArcanoAtual.nome}</h4><p className="mt-2 text-sm text-gray-400">{infoArcanoAtual.descricao}</p></div></div>
        </DashboardCard>
    );
    const BussolaCard = () => (
        <DashboardCard title="Bússola de Atividades" icon={<StarIcon />} className="h-full"><div className="grid grid-cols-1 sm:grid-cols-2 gap-6 h-full"><div><h4 className="font-bold text-green-400 mb-2">Potencializar</h4><ul className="list-disc list-inside space-y-2 text-sm text-gray-400">{atividadesDoDia.potencializar.map((item, index) => (<li key={`pot-${index}`}>{item}</li>))}</ul></div><div><h4 className="font-bold text-red-400 mb-2">Atenção</h4><ul className="list-disc list-inside space-y-2 text-sm text-gray-400">{atividadesDoDia.atencao.map((item, index) => (<li key={`atn-${index}`}>{item}</li>))}</ul></div></div></DashboardCard>
    );
    const EnergiaCard = () => (
        <DashboardCard title="Energia do Dia" icon={<StarIcon />} className="h-full"><h4 className="font-bold text-white text-lg">Dia Pessoal {diaPessoal}: {infoDia.titulo}</h4><p className="mt-2 text-sm text-gray-400">{infoDia.desc}</p><div className="mt-4 flex flex-wrap gap-2">{infoDia.tags.map(tag => (<span key={tag} className="bg-purple-500/30 text-purple-300 text-xs font-semibold px-3 py-1 rounded-full">{tag}</span>))}</div></DashboardCard>
    );

    return (
        <div className="p-4 md:p-6">
            {/* Layout para telas grandes (a partir de 1200px) */}
            <div className="hidden min-[1200px]:grid grid-cols-3 gap-6 animate-fade-in text-gray-300" style={{gridTemplateRows: 'auto 1fr auto'}}>
                <div className="col-span-1"><ArcanoRegenteCard /></div>
                <div className="col-span-1"><ArcanoVigenteCard /></div>
                <div className="col-span-1 row-span-3"><DailyTasksCard user={user} setActiveView={setActiveView} /></div>
                <div className="col-span-2"><BussolaCard /></div>
                <div className="col-span-1"><EnergiaCard /></div>
                <div className="col-span-1"><QuickJournalCard user={user} userData={userData} /></div>
            </div>

            {/* AQUI ESTÁ A MUDANÇA: Layout para telas pequenas e médias (abaixo de 1200px) */}
            <div className="grid grid-cols-1 md:grid-cols-2 min-[1200px]:hidden gap-6 animate-fade-in text-gray-300">
                <ArcanoRegenteCard />
                <ArcanoVigenteCard />
                {/* Bússola agora ocupa 2 colunas em telas médias */}
                <div className="md:col-span-2"><BussolaCard /></div>
                <EnergiaCard />
                {/* Tarefas sobe para ficar ao lado de Energia */}
                <DailyTasksCard user={user} setActiveView={setActiveView} />
                {/* Diário agora ocupa 2 colunas em telas médias */}
                <div className="md:col-span-2"><QuickJournalCard user={user} userData={userData} /></div>
            </div>
        </div>
    );
}

export default Dashboard;