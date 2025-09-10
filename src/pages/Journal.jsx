import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../services/firebase';
import { collection, addDoc, onSnapshot, query, where, orderBy, doc, deleteDoc, Timestamp } from "firebase/firestore";
import numerologyEngine from '../services/numerologyEngine';
import Spinner from '../components/ui/Spinner';
import UpgradeModal from '../components/ui/UpgradeModal';
import { CalendarIcon, EditIcon, ChevronDownIcon } from '../components/ui/Icons';
import JournalEntryModal from '../components/ui/JournalEntryModal';

const TrashIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M3 6h18" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
);

const Journal = ({ user, userData, preselectedDate, onJournalUpdated }) => {
    const [newNote, setNewNote] = useState('');
    const [entries, setEntries] = useState([]);
    const [vibrationFilter, setVibrationFilter] = useState('all');
    const [isVibrationFilterOpen, setIsVibrationFilterOpen] = useState(false);
    const [dateFilter, setDateFilter] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [isFullScreen, setIsFullScreen] = useState(false);
    
    const dateInputRef = useRef(null);
    const vibrationFilterRef = useRef(null);

    const NOTE_LIMIT = 5;
    const isFreePlan = userData?.plano === 'gratuito';
    const hasReachedLimit = isFreePlan && entries.length >= NOTE_LIMIT;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (vibrationFilterRef.current && !vibrationFilterRef.current.contains(event.target)) {
                setIsVibrationFilterOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
    
    useEffect(() => {
        if (!user?.uid) {
            setIsLoading(false);
            return;
        }
        const entriesCollectionRef = collection(db, 'users', user.uid, 'journalEntries');
        let q = query(entriesCollectionRef, orderBy('createdAt', 'desc'));

        if (vibrationFilter !== 'all') {
            q = query(q, where('personalDay', '==', parseInt(vibrationFilter)));
        }
        if (dateFilter) {
            const startOfDay = new Date(dateFilter.replace(/-/g, '/'));
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(dateFilter.replace(/-/g, '/'));
            endOfDay.setHours(23, 59, 59, 999);
            q = query(q, where('createdAt', '>=', Timestamp.fromDate(startOfDay)), where('createdAt', '<=', Timestamp.fromDate(endOfDay)));
        }
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setEntries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setIsLoading(false);
        }, (error) => {
            console.error("Erro ao buscar anotações:", error);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [user, vibrationFilter, dateFilter]);

    const handleSaveNote = async () => {
        if (hasReachedLimit) { setShowUpgradeModal(true); return; }
        if (newNote.trim() === '' || !user?.uid || !userData?.dataNasc) return;
        setIsSaving(true);
        try {
            const dateForNote = preselectedDate || new Date();
            const personalDayForNote = numerologyEngine.calculatePersonalDayForDate(dateForNote, userData.dataNasc);
            await addDoc(collection(db, 'users', user.uid, 'journalEntries'), {
                content: newNote,
                createdAt: Timestamp.fromDate(dateForNote),
                personalDay: personalDayForNote
            });
            setNewNote('');
            setIsFullScreen(false); 
            if (onJournalUpdated) onJournalUpdated();
        } catch (error) {
            console.error("Erro ao salvar anotação:", error);
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleDeleteNote = async (entryId) => {
        if (!user?.uid || !entryId) return;
        const isConfirmed = window.confirm("Tem certeza que deseja excluir esta anotação permanentemente?");
        if (isConfirmed) {
            try {
                await deleteDoc(doc(db, 'users', user.uid, 'journalEntries', entryId));
                if (selectedEntry && selectedEntry.id === entryId) {
                    setSelectedEntry(null);
                }
            } catch (error) {
                console.error("Erro ao excluir anotação:", error);
            }
        }
    };
    
    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        return new Date(timestamp.seconds * 1000).toLocaleString('pt-BR', {
            day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };
    
    const openDatePicker = () => {
        try { dateInputRef.current?.showPicker(); } 
        catch (error) { console.error("Este navegador não suporta showPicker().", error); }
    };

    const filterOptions = ['all', 1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22];
    
    const NewNoteEditor = () => {
        const dateForNote = preselectedDate || new Date();
        const personalDayForNote = numerologyEngine.calculatePersonalDayForDate(dateForNote, userData.dataNasc);

        return (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center z-50 animate-fade-in p-4" onClick={() => setIsFullScreen(false)}>
                <div className="w-full max-w-3xl relative" onClick={e => e.stopPropagation()}>
                    <div className="journal-paper shadow-2xl h-[70vh] flex flex-col">
                        <div className="flex justify-between items-start text-gray-600 border-b border-gray-300 pb-3 mb-3">
                            <h3 className="text-lg font-bold capitalize">
                                {dateForNote.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
                            </h3>
                            <span className="text-sm font-semibold bg-gray-200/80 px-3 py-1 rounded-full text-purple-800">Vibração {personalDayForNote}</span>
                        </div>
                        <textarea
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            className="w-full h-full bg-transparent focus:outline-none text-base resize-none"
                            autoFocus
                        />
                    </div>
                    <div className="flex justify-center mt-4">
                         <button
                            onClick={handleSaveNote}
                            disabled={isSaving || newNote.trim() === '' || hasReachedLimit}
                            className="text-white font-bold py-2 px-8 rounded-lg transition-colors hover:bg-white/10 disabled:text-gray-500 disabled:cursor-not-allowed"
                        >
                            {isSaving ? <Spinner /> : 'Salvar Anotação'}
                        </button>
                    </div>
                </div>
            </div>
        )
    };

    return (
        <>
            {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} />}
            {selectedEntry && <JournalEntryModal entry={selectedEntry} onClose={() => setSelectedEntry(null)} />}
            {isFullScreen && <NewNoteEditor />}
            
            <div className="p-4 md:p-8 text-white w-full">
                <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-8 max-w-7xl mx-auto">
                    <div className="lg:col-span-1 lg:sticky lg:top-8 self-start">
                         <button
                            onClick={() => setIsFullScreen(true)}
                            className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 mb-8"
                        >
                            <EditIcon className="w-5 h-5" />
                            Nova Anotação
                        </button>

                        <div className="space-y-4">
                            <div className="relative">
                                <label className="text-sm text-gray-400 mb-2 block">Filtrar por data:</label>
                                <div onClick={openDatePicker} className="absolute left-3 bottom-2.5 w-5 h-5 cursor-pointer z-10" title="Filtrar por data">
                                   <CalendarIcon className="w-full h-full text-gray-400" />
                                </div>
                                <input ref={dateInputRef} type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="custom-date-input bg-gray-700 border border-gray-600 rounded-lg p-2 text-sm w-full pl-10"/>
                            </div>
                            <div className="relative" ref={vibrationFilterRef}>
                                <label className="text-sm text-gray-400 mb-2 block">Filtrar por vibração:</label>
                                <button onClick={() => setIsVibrationFilterOpen(!isVibrationFilterOpen)} className="bg-gray-700 border border-gray-600 rounded-lg p-2 text-sm w-full flex justify-between items-center">
                                    <span>{vibrationFilter === 'all' ? 'Todas as Vibrações' : `Vibração ${vibrationFilter}`}</span>
                                    <ChevronDownIcon className={`w-5 h-5 transition-transform ${isVibrationFilterOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {isVibrationFilterOpen && (
                                    <div className="absolute top-full mt-2 w-full bg-gray-800 border border-gray-600 rounded-lg z-10 max-h-48 overflow-y-auto">
                                        {filterOptions.map(option => (
                                            <button 
                                                key={option} 
                                                onClick={() => { setVibrationFilter(option); setIsVibrationFilterOpen(false); }}
                                                className={`w-full text-left px-4 py-2 text-sm hover:bg-purple-600 ${vibrationFilter.toString() === option.toString() ? 'bg-purple-700' : ''}`}
                                            >
                                                {option === 'all' ? 'Todas' : option}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-3 mt-8 lg:mt-0">
                        {isLoading ? (
                            <div className="flex justify-center mt-8"><Spinner /></div>
                        ) : entries.length === 0 ? (
                            <div className="bg-gray-800/50 border-2 border-dashed border-gray-700 rounded-xl p-8 h-64 flex items-center justify-center">
                                <p className="text-gray-400 text-center">Nenhuma anotação encontrada.<br/>Clique em "Nova Anotação" para começar.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {entries.map(entry => (
                                    <div key={entry.id} onClick={() => setSelectedEntry(entry)} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 animate-fade-in group relative hover:border-purple-500 cursor-pointer transition-colors">
                                        <div className="flex justify-between items-center mb-2">
                                            <p className="text-sm font-semibold text-purple-300">{formatDate(entry.createdAt)}</p>
                                            <div className="flex items-center gap-4">
                                                <span className="text-xs font-bold bg-gray-700 px-2 py-1 rounded-full">Vibração {entry.personalDay}</span>
                                                <button 
                                                    onClick={(e) => {e.stopPropagation(); handleDeleteNote(entry.id);}}
                                                    className="text-gray-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                                    title="Excluir anotação"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-gray-300 whitespace-pre-wrap text-sm line-clamp-3">{entry.content}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Journal;