import React, { useState, useEffect } from 'react';
import DashboardCard from '../components/ui/DashboardCard';
import { BookIcon, CheckSquareIcon, SunIcon, CompassIcon } from '../components/ui/Icons'; // Importação corrigida
import { textosDescritivos, textosArcanos, bussolaAtividades } from '../data/content';
import Spinner from '../components/ui/Spinner';
import { db } from '../services/firebase';
import { collection, query, where, onSnapshot, Timestamp, orderBy, limit, addDoc } from "firebase/firestore";
import numerologyEngine from '../services/numerologyEngine';

// --- Subcomponentes do Dashboard ---
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
        <DashboardCard title="Diário de Tarefas (Hoje)" icon={<CheckSquareIcon />}>
            <div className="flex-1">
                {isLoading ? <div className="flex items-center justify-center h-full"><Spinner /></div>
                : error ? <p className="text-sm text-red-400">{error}</p>
                : tasks.length === 0 ? <p className="text-sm text-gray-400">Nenhuma tarefa para hoje.</p>
                : <div className="space-y-2 mt-2">{tasks.map(task => (<div key={task.id} className={`flex items-center text-sm ${task.completed ? 'text-gray-500 line-through' : 'text-gray-300'}`}><span className={`mr-2 h-2 w-2 rounded-full ${task.completed ? 'bg-green-500' : 'bg-purple-500'}`}></span>{task.text}</div>))}</div>}
            </div>
            <button onClick={() => setActiveView('tasks')} className="mt-4 w-full text-center text-sm text-purple-400 hover:text-purple-300 font-semibold">Ver todas as tarefas</button>
        </DashboardCard>
    );
};
const QuickJournalCard = ({ user, userData, setActiveView }) => {
    const [note, setNote] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [latestEntry, setLatestEntry] = useState(null);
    const [isLoadingLatest, setIsLoadingLatest] = useState(true);

    useEffect(() => {
        if (!user) {
            setIsLoadingLatest(false);
            return;
        }
        const q = query(collection(db, 'users', user.uid, 'journalEntries'), orderBy('createdAt', 'desc'), limit(1));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                setLatestEntry({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
            } else {
                setLatestEntry(null);
            }
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

    return (
        <DashboardCard title="Anotação Rápida" icon={<BookIcon />}>
            <p className="text-sm text-gray-400 mb-3">Algum insight sobre a vibração de hoje? Anote aqui!</p>
            <textarea className="w-full h-24 bg-gray-900 border border-gray-600 rounded-lg p-3 text-sm" placeholder="Digite suas reflexões..." value={note} onChange={(e) => setNote(e.target.value)} />
            <button onClick={handleSaveNote} disabled={isSaving || note.trim() === ''} className="mt-4 w-full bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-500 flex justify-center items-center h-10">{isSaving ? <Spinner /> : 'Salvar Anotação'}</button>
            
            {!isLoadingLatest && latestEntry && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                    <h4 className="text-sm font-bold text-gray-400 mb-2">Última Anotação:</h4>
                    <button onClick={() => setActiveView('journal')} className="w-full text-left bg-gray-900/50 p-3 rounded-lg hover:bg-gray-700/50 transition-colors">
                        <p className="text-xs text-purple-300 font-semibold">{new Date(latestEntry.createdAt.seconds * 1000).toLocaleDateString('pt-BR', {day:'2-digit', month:'long'})}</p>
                        <p className="text-sm text-gray-300 truncate mt-1">{latestEntry.content}</p>
                    </button>
                </div>
            )}
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

    const ArcanoCard = ({ number, info, title, tooltipText }) => (
        <DashboardCard title={<Tooltip text={tooltipText}><span>{title}</span><span className="ml-2 h-4 w-4 flex items-center justify-center text-xs bg-gray-600 rounded-full">?</span></Tooltip>}>
            <div className="flex flex-col md:flex-row items-center text-center md:text-left gap-4">
                <div className="flex-shrink-0 w-24 h-24 bg-gray-700/50 border border-gray-600 rounded-lg flex items-center justify-center">
                    <span className="text-5xl font-bold text-purple-300">{number || '?'}</span>
                </div>
                <div>
                    <h4 className="font-bold text-white text-lg">{info.nomeTradicional || info.nome}</h4>
                    <p className="mt-1 text-sm text-gray-400">{info.descricao}</p>
                </div>
            </div>
        </DashboardCard>
    );

    const BussolaCard = () => (
        <DashboardCard title="Bússola de Atividades" icon={<CompassIcon />} className="row-span-1 md:row-span-2">
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

    const VibracaoDiaCard = () => (
        <DashboardCard title="Vibração do Dia" icon={<SunIcon />}>
             <div className="flex items-center text-center gap-4">
                <div className="flex-shrink-0 w-24 h-24 bg-cyan-500/10 border border-cyan-400/50 rounded-lg flex items-center justify-center">
                    <span className="text-5xl font-bold text-cyan-300">{diaPessoal}</span>
                </div>
                <div className="text-left">
                    <h4 className="font-bold text-white text-lg">{infoDia.titulo}</h4>
                    <p className="mt-1 text-sm text-gray-400">{infoDia.desc}</p>
                </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">{infoDia.tags.map(tag => (<span key={tag} className="bg-purple-500/30 text-purple-300 text-xs font-semibold px-3 py-1 rounded-full">{tag}</span>))}</div>
        </DashboardCard>
    );

    return (
        <div className="p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in text-gray-300">
                <div className="lg:col-span-2"><VibracaoDiaCard /></div>
                <div className="md:row-span-2"><BussolaCard/></div>
                <ArcanoCard number={arcanoRegente} info={infoArcanoRegente} title="Arcano Regente" tooltipText="Seu arcano fundamental, sua essência." />
                <ArcanoCard number={arcanoAtual} info={infoArcanoAtual} title="Arcano Vigente" tooltipText="A energia que te influencia neste ciclo atual da sua vida."/>
                <div className="h-full flex flex-col"><DailyTasksCard user={user} setActiveView={setActiveView} /></div>
                <div className="md:col-span-2 lg:col-span-1"><QuickJournalCard user={user} userData={userData} setActiveView={setActiveView} /></div>
            </div>
        </div>
    );
}

export default Dashboard;