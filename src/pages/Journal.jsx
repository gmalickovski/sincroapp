import React, { useState, useEffect, useRef, useMemo } from 'react';
import { db } from '../services/firebase';
import { collection, onSnapshot, query, where, orderBy, doc, deleteDoc, Timestamp } from "firebase/firestore";
import Spinner from '../components/ui/Spinner';
import UpgradeModal from '../components/ui/UpgradeModal';
import { CalendarIcon, EditIcon, ChevronDownIcon, TrashIcon, FilterIcon, XIcon, DotsVerticalIcon } from '../components/ui/Icons';
import VibrationPill from '../components/ui/VibrationPill';

// Mapeamento de ID do humor para o emoji
const moodMap = {
    1: '😔',
    2: '😟',
    3: '😐',
    4: '😊',
    5: '😄',
};

const JournalEntryCard = React.memo(({ entry, setEditingEntry, handleDelete, onInfoClick }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    const energyClasses = { 1: { border: 'border-red-500/50', bg: 'bg-red-500/10' }, 2: { border: 'border-orange-500/50', bg: 'bg-orange-500/10' }, 3: { border: 'border-yellow-500/50', bg: 'bg-yellow-500/10' }, 4: { border: 'border-lime-500/50', bg: 'bg-lime-500/10' }, 5: { border: 'border-cyan-500/50', bg: 'bg-cyan-500/10' }, 6: { border: 'border-blue-500/50', bg: 'bg-blue-500/10' }, 7: { border: 'border-purple-500/50', bg: 'bg-purple-500/10' }, 8: { border: 'border-pink-500/50', bg: 'bg-pink-500/10' }, 9: { border: 'border-teal-500/50', bg: 'bg-teal-500/10' }, 11: { border: 'border-violet-400/50', bg: 'bg-violet-400/10' }, 22: { border: 'border-indigo-400/50', bg: 'bg-indigo-400/10' }, default: { border: 'border-gray-700', bg: 'bg-gray-800/50' } };
    const currentEnergy = energyClasses[entry.personalDay] || energyClasses.default;
    
    // --- CORREÇÃO 1: USAR 'createdAt' PARA A DATA PRINCIPAL ---
    // Isso garante que a data exibida seja sempre a data para a qual a anotação foi criada.
    const entryDate = new Date(entry.createdAt.seconds * 1000);
    const formattedWeekdayDay = `${entryDate.toLocaleDateString('pt-BR', { weekday: 'long' })} - Dia ${entryDate.getDate()}`;
    const formattedMonthYear = entryDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).replace(' de ', ' / ');
    
    // A hora pode continuar sendo da última atualização, para saber quando foi a última edição.
    const formattedTime = new Date(entry.updatedAt.seconds * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    useEffect(() => {
        const handleClickOutside = (event) => { if (menuRef.current && !menuRef.current.contains(event.target)) { setIsMenuOpen(false); } };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuRef]);

    return (
        <div className="grid grid-cols-[auto_1fr] gap-4 items-start">
            <div className="w-4 h-full flex flex-col items-center">
                <div className="w-3 h-3 bg-gray-600 rounded-full mt-2"></div>
                <div className="h-full w-px bg-gray-700"></div>
            </div>
            <div className="min-w-0">
                 <div onClick={() => !isMenuOpen && setEditingEntry(entry)} className={`w-full ${currentEnergy.bg} border ${currentEnergy.border} rounded-xl shadow-lg animate-fade-in group relative hover:border-purple-400/80 cursor-pointer transition-all duration-300 flex flex-col`}>
                    <div className="p-4 border-b border-white/5">
                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-center">
                                <div onClick={(e) => e.stopPropagation()}><VibrationPill vibrationNumber={entry.personalDay} onClick={() => onInfoClick(entry.personalDay)} /></div>
                                <div className="flex items-center gap-3">
                                    {entry.mood && <span className="text-2xl">{moodMap[entry.mood]}</span>}
                                    <div ref={menuRef} className="relative">
                                        <button onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }} className="p-2 -m-2 rounded-full hover:bg-gray-700/50 transition-colors">
                                            <DotsVerticalIcon className="h-5 w-5 text-gray-400" />
                                        </button>
                                        {isMenuOpen && (
                                            <div className="absolute top-full right-0 mt-2 w-36 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-10 animate-fade-in-fast">
                                                <button onClick={(e) => { e.stopPropagation(); handleDelete(entry.id); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/20">
                                                    <TrashIcon className="h-4 w-4" /> Excluir
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="text-white">
                                <h3 className="font-bold capitalize">{formattedWeekdayDay}</h3>
                                <p className="text-sm capitalize text-purple-400">{formattedMonthYear}</p>
                                <p className="text-xs text-gray-500">{formattedTime}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-4 pt-2 sm:pt-4">
                        <p className="text-gray-300 whitespace-pre-wrap break-words text-base line-clamp-6 font-serif leading-relaxed">
                            {entry.content}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
});

const FilterPopover = ({ isVisible, onClose, filters, setFilters, dateInputRef }) => {
    if(!isVisible) return null;
    const { date, vibration } = filters;
    const { setDate, setVibration } = setFilters;
    const vibrationFilterRef = useRef(null);
    const [isVibrationFilterOpen, setIsVibrationFilterOpen] = useState(false);
    useEffect(() => { const handleClickOutside = (event) => { if (vibrationFilterRef.current && !vibrationFilterRef.current.contains(event.target)) { setIsVibrationFilterOpen(false); } }; document.addEventListener("mousedown", handleClickOutside); return () => document.removeEventListener("mousedown", handleClickOutside); }, []);
    const openDatePicker = () => { try { dateInputRef.current?.showPicker(); } catch (error) { console.error("Erro:", error); }};
    const filterOptions = ['all', 1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22];
    
    return (
        <div className="absolute top-14 right-0 bg-gray-800 border border-gray-700 rounded-xl shadow-lg w-72 p-4 z-20 animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4"> <h3 className="font-bold">Filtros</h3> <button onClick={onClose} className="p-1 hover:text-white text-gray-400"><XIcon className="w-5 h-5"/></button> </div>
            <div className="space-y-4">
                <div className="relative"> <label className="text-sm text-gray-400 mb-2 block">Filtrar por data:</label> <div onClick={openDatePicker} className="absolute left-3 bottom-2.5 w-5 h-5 cursor-pointer z-10"><CalendarIcon className="w-full h-full text-gray-400" /></div> <input ref={dateInputRef} type="date" value={date} onChange={(e) => setDate(e.target.value)} className="custom-date-input bg-gray-700 border border-gray-600 rounded-lg p-2 text-sm w-full pl-10"/> </div>
                <div className="relative" ref={vibrationFilterRef}> <label className="text-sm text-gray-400 mb-2 block">Filtrar por vibração:</label> <button onClick={() => setIsVibrationFilterOpen(!isVibrationFilterOpen)} className="bg-gray-700 border border-gray-600 rounded-lg p-2 text-sm w-full flex justify-between items-center"> <span>{vibration === 'all' ? 'Todas as Vibrações' : `Vibração ${vibration}`}</span> <ChevronDownIcon className={`w-5 h-5 transition-transform ${isVibrationFilterOpen ? 'rotate-180' : ''}`} /> </button> {isVibrationFilterOpen && ( <div className="absolute top-full mt-2 w-full bg-gray-900 border border-gray-600 rounded-lg z-10 max-h-48 overflow-y-auto"> {filterOptions.map(option => ( <button key={option} onClick={() => { setVibration(option); setIsVibrationFilterOpen(false); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-purple-600 ${vibration.toString() === option.toString() ? 'bg-purple-700' : ''}`}>{option === 'all' ? 'Todas' : option}</button>))} </div> )} </div>
                <button onClick={() => { setDate(''); setVibration('all'); }} className="w-full text-center text-sm text-purple-400 hover:text-purple-300 font-semibold p-2">Limpar Filtros</button>
            </div>
        </div>
    );
};

const Journal = ({ user, userData, setEditingEntry, openNewNoteEditor, onInfoClick }) => {
    const [entries, setEntries] = useState([]);
    const [vibrationFilter, setVibrationFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [filtersVisible, setFiltersVisible] = useState(false);
    const dateInputRef = useRef(null);
    const filterButtonRef = useRef(null);
    const NOTE_LIMIT = 5;
    const isFreePlan = userData?.plano === 'gratuito';
    const hasReachedLimit = isFreePlan && entries.length >= NOTE_LIMIT;

    useEffect(() => { const handleClickOutside = (event) => { if (filterButtonRef.current && !filterButtonRef.current.contains(event.target)) { setFiltersVisible(false); } }; document.addEventListener("mousedown", handleClickOutside); return () => document.removeEventListener("mousedown", handleClickOutside); }, []);
    
    useEffect(() => {
        if (!user?.uid) { setIsLoading(false); return; }
        // --- CORREÇÃO 2: ORDENAR POR 'createdAt' ---
        // Ordena as anotações pela data a que se referem, não pela data da última edição.
        let q = query(collection(db, 'users', user.uid, 'journalEntries'), orderBy('createdAt', 'desc'));
        if (vibrationFilter !== 'all') { q = query(q, where('personalDay', '==', parseInt(vibrationFilter))); }
        if (dateFilter) { const startOfDay = new Date(dateFilter.replace(/-/g, '/')); startOfDay.setHours(0, 0, 0, 0); const endOfDay = new Date(dateFilter.replace(/-/g, '/')); endOfDay.setHours(23, 59, 59, 999); q = query(q, where('createdAt', '>=', Timestamp.fromDate(startOfDay)), where('createdAt', '<=', Timestamp.fromDate(endOfDay))); }
        
        const unsubscribe = onSnapshot(q, (snapshot) => { setEntries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))); setIsLoading(false); }, (error) => { console.error("Erro:", error); setIsLoading(false); });
        
        return () => unsubscribe();
    }, [user, vibrationFilter, dateFilter]);
    
    const groupedEntries = useMemo(() => {
        return entries.reduce((acc, entry) => {
            // --- CORREÇÃO 3: AGRUPAR POR 'createdAt' ---
            // Garante que o agrupamento por mês use a data correta da anotação.
            const date = new Date(entry.createdAt.seconds * 1000);
            const monthYear = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
            if (!acc[monthYear]) acc[monthYear] = [];
            acc[monthYear].push(entry);
            return acc;
        }, {});
    }, [entries]);

    const handleDeleteNote = async (entryId) => { if (!user?.uid || !entryId) return; if (window.confirm("Tem certeza que deseja excluir esta anotação?")) { try { await deleteDoc(doc(db, 'users', user.uid, 'journalEntries', entryId)); } catch (error) { console.error("Erro:", error); } } };
    const handleNewNoteClick = () => { if (hasReachedLimit) { setShowUpgradeModal(true); } else { openNewNoteEditor(); }};

    return (
        <>
            {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} />}
            <div className="p-4 md:p-8 text-white w-full max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">Diário de Bordo</h1>
                    <div className="relative" ref={filterButtonRef}>
                        <button onClick={() => setFiltersVisible(!filtersVisible)} className="flex items-center gap-2 text-sm font-semibold bg-gray-800/50 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"><FilterIcon className="w-4 h-4" /> Filtros</button>
                        <FilterPopover isVisible={filtersVisible} onClose={() => setFiltersVisible(false)} filters={{ date: dateFilter, vibration: vibrationFilter }} setFilters={{ setDate: setDateFilter, setVibration: setVibrationFilter }} dateInputRef={dateInputRef} />
                    </div>
                </div>
                {isLoading ? <div className="flex justify-center mt-16"><Spinner /></div> : 
                    entries.length === 0 ? 
                    <div className="bg-gray-800/50 border-2 border-dashed border-gray-700 rounded-xl p-8 h-64 flex items-center justify-center text-center">
                        <button onClick={handleNewNoteClick} className="cursor-pointer">
                            <p className="text-gray-400">Nenhuma anotação encontrada.</p>
                            <p className="text-purple-400 font-semibold mt-2">Clique para criar sua primeira anotação.</p>
                        </button>
                    </div> : 
                    (<div className="space-y-8">
                        {Object.entries(groupedEntries).map(([monthYear, entriesInMonth]) => (
                            <div key={monthYear}>
                                <h2 className="text-lg font-bold text-purple-300/80 mb-4 capitalize pl-5">{monthYear.replace('de ', '/ ')}</h2>
                                <div className="space-y-8">
                                    {entriesInMonth.map(entry => (
                                        <JournalEntryCard key={entry.id} entry={entry} setEditingEntry={setEditingEntry} handleDelete={handleDeleteNote} onInfoClick={onInfoClick}/>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>)
                }
                <button onClick={handleNewNoteClick} className="fixed bottom-6 right-6 bg-purple-600 text-white rounded-full p-4 shadow-lg hover:bg-purple-700 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-purple-500 z-20" aria-label="Nova Anotação"><EditIcon className="w-6 h-6" /></button>
            </div>
        </>
    );
};

export default Journal;