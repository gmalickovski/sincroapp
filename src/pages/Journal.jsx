import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, addDoc, onSnapshot, query, where, orderBy, serverTimestamp, doc, deleteDoc } from "firebase/firestore";
import numerologyEngine from '../services/numerologyEngine';
import Spinner from '../components/ui/Spinner';
import UpgradeModal from '../components/ui/UpgradeModal';

// Ícone de lixeira para a função de excluir
const TrashIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M3 6h18" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
);


const Journal = ({ user, userData }) => {
    const [newNote, setNewNote] = useState('');
    const [entries, setEntries] = useState([]);
    const [filter, setFilter] = useState('all');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    const NOTE_LIMIT = 5;
    const isFreePlan = userData?.plano === 'gratuito';
    const hasReachedLimit = isFreePlan && entries.length >= NOTE_LIMIT;

    useEffect(() => {
        if (!user?.uid) {
             setIsLoading(false);
             return;
        }

        const entriesCollectionRef = collection(db, 'users', user.uid, 'journalEntries');
        
        let q;
        if (filter === 'all') {
            q = query(entriesCollectionRef, orderBy('createdAt', 'desc'));
        } else {
            // IMPORTANTE: Para esta consulta funcionar, o Firestore pode exigir um índice.
            // Se o filtro não funcionar, verifique o console de depuração do seu navegador (F12).
            // O Firebase geralmente exibe um erro com um link para criar o índice automaticamente com um clique.
            q = query(entriesCollectionRef, where('personalDay', '==', filter), orderBy('createdAt', 'desc'));
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const entriesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setEntries(entriesData);
            setIsLoading(false);
        }, (error) => {
            console.error("Erro ao buscar anotações (verifique os índices do Firestore):", error);
            setIsLoading(false);
        });

        return () => unsubscribe();

    }, [user, filter]);

    const handleSaveNote = async () => {
        if (hasReachedLimit) {
            setShowUpgradeModal(true);
            return;
        }

        if (newNote.trim() === '' || !user?.uid || !userData?.dataNasc) return;
        setIsSaving(true);

        try {
            const todayPersonalDay = numerologyEngine.calculatePersonalDayForDate(new Date(), userData.dataNasc);
            const entriesCollectionRef = collection(db, 'users', user.uid, 'journalEntries');
            await addDoc(entriesCollectionRef, {
                content: newNote,
                createdAt: serverTimestamp(),
                personalDay: todayPersonalDay
            });
            setNewNote('');
        } catch (error) {
            console.error("Erro ao salvar anotação:", error);
        } finally {
            setIsSaving(false);
        }
    };

    // NOVA FUNÇÃO PARA EXCLUIR UMA ANOTAÇÃO
    const handleDeleteNote = async (entryId) => {
        if (!user?.uid || !entryId) return;
        
        // Pede confirmação antes de excluir (usando o confirm do navegador)
        const isConfirmed = window.confirm("Tem certeza que deseja excluir esta anotação permanentemente?");
        
        if (isConfirmed) {
            try {
                const noteDocRef = doc(db, 'users', user.uid, 'journalEntries', entryId);
                await deleteDoc(noteDocRef);
            } catch (error) {
                console.error("Erro ao excluir anotação:", error);
            }
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'Salvando...';
        return new Date(timestamp.seconds * 1000).toLocaleDateString('pt-BR', {
            day: '2-digit', month: 'long', year: 'numeric'
        });
    }

    const filterOptions = ['all', 1, 2, 3, 4, 5, 6, 7, 8, 9];

    return (
        <>
            {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} />}

            <div className="p-8 text-white max-w-4xl mx-auto w-full">
                <h1 className="text-3xl font-bold mb-6">Diário de Bordo</h1>

                <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 mb-8">
                     <h2 className="text-xl font-semibold text-purple-300 mb-4">Nova Anotação</h2>
                     <textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder={hasReachedLimit ? "Você atingiu o limite de anotações do plano gratuito." : "Como você se sentiu hoje? Quais insights a energia do dia te trouxe?"}
                        disabled={hasReachedLimit}
                        className="w-full h-32 bg-gray-900 border border-gray-600 rounded-lg p-3 text-sm text-gray-200 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all disabled:opacity-50"
                     />
                     <button
                        onClick={handleSaveNote}
                        disabled={isSaving || newNote.trim() === '' || hasReachedLimit}
                        className="mt-4 w-full bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center h-10"
                     >
                        {isSaving ? <Spinner /> : 'Salvar Anotação'}
                     </button>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-semibold">Minhas Anotações</h2>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400">Filtrar por:</span>
                            <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-1 flex gap-1">
                                {filterOptions.map(option => (
                                    <button 
                                        key={option} 
                                        onClick={() => setFilter(option)}
                                        className={`px-3 py-1 text-sm rounded-md transition-colors ${filter === option ? 'bg-purple-600 text-white' : 'hover:bg-gray-700'}`}
                                    >
                                        {option === 'all' ? 'Todos' : option}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    {isLoading ? (
                        <div className="flex justify-center mt-8"><Spinner /></div>
                    ) : entries.length === 0 ? (
                        <p className="text-gray-400 text-center py-8">{filter === 'all' ? 'Você ainda não tem nenhuma anotação.' : `Nenhuma anotação encontrada para a vibração ${filter}.`}</p>
                    ) : (
                        <div className="space-y-4">
                            {entries.map(entry => (
                                <div key={entry.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 animate-fade-in group relative">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-sm font-semibold text-purple-300">{formatDate(entry.createdAt)}</p>
                                        <div className="flex items-center gap-4">
                                            <span className="text-xs font-bold bg-gray-700 px-2 py-1 rounded-full">Vibração {entry.personalDay}</span>
                                            {/* BOTÃO DE EXCLUIR */}
                                            <button 
                                                onClick={() => handleDeleteNote(entry.id)}
                                                className="text-gray-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                                title="Excluir anotação"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-gray-300 whitespace-pre-wrap">{entry.content}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Journal;

