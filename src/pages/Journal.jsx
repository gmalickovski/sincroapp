import React, { useState, useEffect, useRef, useMemo } from 'react';
// ATUALIZAÇÃO 1: Importar 'useOutletContext' para receber as props
import { useOutletContext } from 'react-router-dom';
import { db } from '../services/firebase';
import { collection, onSnapshot, query, where, orderBy, doc, deleteDoc, Timestamp } from "firebase/firestore";
import Spinner from '../components/ui/Spinner';
import UpgradeModal from '../components/ui/UpgradeModal';
import { CalendarIcon, EditIcon, ChevronDownIcon, TrashIcon, FilterIcon, XIcon, DotsVerticalIcon } from '../components/ui/Icons';
import VibrationPill from '../components/ui/VibrationPill';
import FloatingActionButton from '../components/ui/FloatingActionButton';

const moodMap = { 1: '😔', 2: '😟', 3: '😐', 4: '😊', 5: '😄' };

const JournalEntryCard = React.memo(({ entry, setEditingEntry, handleDelete, onInfoClick }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const energyClasses = { 1: { border: 'border-red-500/50', bg: 'bg-red-500/10' }, 2: { border: 'border-orange-500/50', bg: 'bg-orange-500/10' }, 3: { border: 'border-yellow-500/50', bg: 'bg-yellow-500/10' }, 4: { border: 'border-lime-500/50', bg: 'bg-lime-500/10' }, 5: { border: 'border-cyan-500/50', bg: 'bg-cyan-500/10' }, 6: { border: 'border-blue-500/50', bg: 'bg-blue-500/10' }, 7: { border: 'border-purple-500/50', bg: 'bg-purple-500/10' }, 8: { border: 'border-pink-500/50', bg: 'bg-pink-500/10' }, 9: { border: 'border-teal-500/50', bg: 'bg-teal-500/10' }, 11: { border: 'border-violet-400/50', bg: 'bg-violet-400/10' }, 22: { border: 'border-indigo-400/50', bg: 'bg-indigo-400/10' }, default: { border: 'border-gray-700', bg: 'bg-gray-800/50' } };
    const currentEnergy = energyClasses[entry.personalDay] || energyClasses.default;
    const entryDate = new Date(entry.createdAt.seconds * 1000);
    const formattedWeekdayDay = `${entryDate.toLocaleDateString('pt-BR', { weekday: 'long' })} - Dia ${entryDate.getDate()}`;
    const formattedMonthYear = entryDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).replace(' de ', ' / ');
    const formattedTime = new Date(entry.updatedAt.seconds * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    useEffect(() => {
        const handleClickOutside = (event) => { if (menuRef.current && !menuRef.current.contains(event.target)) { setIsMenuOpen(false); } };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuRef]);

    return (
        <div className="grid grid-cols-[auto_1fr] gap-4 items-start">
            <div className="w-4 h-full flex flex-col items-center"><div className="w-3 h-3 bg-gray-600 rounded-full mt-2"></div><div className="h-full w-px bg-gray-700"></div></div>
            <div className="min-w-0">
                 <div onClick={() => !isMenuOpen && setEditingEntry(entry)} className={`w-full ${currentEnergy.bg} border ${currentEnergy.border} rounded-xl shadow-lg animate-fade-in group relative hover:border-purple-400/80 cursor-pointer transition-all duration-300 flex flex-col`}>
                    <div className="p-4 border-b border-white/5">
                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-center">
                                <div onClick={(e) => e.stopPropagation()}><VibrationPill vibrationNumber={entry.personalDay} onClick={() => onInfoClick(entry.personalDay)} /></div>
                                <div className="flex items-center gap-3">
                                    {entry.mood && <span className="text-2xl">{moodMap[entry.mood]}</span>}
                                    <div ref={menuRef} className="relative">
                                        <button onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }} className="p-2 -m-2 rounded-full hover:bg-gray-700/50 transition-colors"><DotsVerticalIcon className="h-5 w-5 text-gray-400" /></button>
                                        {isMenuOpen && (<div className="absolute top-full right-0 mt-2 w-36 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-10 animate-fade-in-fast"><button onClick={(e) => { e.stopPropagation(); handleDelete(entry.id); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/20"><TrashIcon className="h-4 w-4" /> Excluir</button></div>)}
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
                    <div className="p-4 pt-2 sm:pt-4"><p className="text-gray-300 whitespace-pre-wrap break-words text-base line-clamp-6 font-serif leading-relaxed">{entry.content}</p></div>
                </div>
            </div>
        </div>
    );
});

const FilterPopover = ({ isVisible, onClose, filters, setFilters, dateInputRef }) => {
    if (!isVisible) return null;
    
    const { date, vibration, mood } = filters;
    const { setDate, setVibration, setMood } = setFilters;
    
    const vibrationFilterRef = useRef(null);
    const [isVibrationFilterOpen, setIsVibrationFilterOpen] = useState(false);
    
    useEffect(() => {
        const handleClickOutside = (event) => { if (vibrationFilterRef.current && !vibrationFilterRef.current.contains(event.target)) { setIsVibrationFilterOpen(false); } };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const openDatePicker = () => { try { dateInputRef.current?.showPicker(); } catch (error) { console.error("Erro:", error); }};
    
    const filterOptions = ['all', 1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22];
    const moodOptions = [{ id: 'all', emoji: 'Todos' }, { id: 5, emoji: '😄' }, { id: 4, emoji: '😊' }, { id: 3, emoji: '😐' }, { id: 2, emoji: '😟' }, { id: 1, emoji: '😔' }];

    const handleClearFilters = () => { setDate(''); setVibration('all'); setMood('all'); };
    
    return (
        <div className="absolute top-full right-0 mt-2 bg-gray-800 border border-gray-700 rounded-xl shadow-lg w-72 p-4 z-30 animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold">Filtros</h3>
                <button onClick={onClose} className="p-1 hover:text-white text-gray-400"><XIcon className="w-5 h-5"/></button>
            </div>
            <div className="space-y-4">
                <div>
                    <label className="text-sm text-gray-400 mb-2 block">Filtrar por data:</label>
                    <div className="relative">
                        <div onClick={openDatePicker} className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 cursor-pointer z-10"><CalendarIcon className="w-full h-full text-gray-400" /></div>
                        <input ref={dateInputRef} type="date" value={date} onChange={(e) => setDate(e.target.value)} className="custom-date-input bg-gray-700 border border-gray-600 rounded-lg p-2 text-sm w-full pl-10"/>
                    </div>
                </div>
                <div className="relative" ref={vibrationFilterRef}>
                    <label className="text-sm text-gray-400 mb-2 block">Filtrar por vibração:</label>
                    <button onClick={() => setIsVibrationFilterOpen(!isVibrationFilterOpen)} className="bg-gray-700 border border-gray-600 rounded-lg p-2 text-sm w-full flex justify-between items-center">
                        <span>{vibration === 'all' ? 'Todas as Vibrações' : `Vibração ${vibration}`}</span>
                        <ChevronDownIcon className={`w-5 h-5 transition-transform ${isVibrationFilterOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isVibrationFilterOpen && (<div className="absolute top-full mt-2 w-full bg-gray-900 border border-gray-600 rounded-lg z-10 max-h-48 overflow-y-auto custom-scrollbar">{filterOptions.map(option => (<button key={option} onClick={() => { setVibration(option); setIsVibrationFilterOpen(false); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-purple-600 ${vibration.toString() === option.toString() ? 'bg-purple-700' : ''}`}>{option === 'all' ? 'Todas' : option}</button>))}</div>)}
                </div>
                
                <div>
                    <label className="text-sm text-gray-400 mb-2 block">Filtrar por humor:</label>
                    <div className="flex items-center bg-gray-700 border border-gray-600 rounded-lg p-1 gap-1">
                        {moodOptions.map(option => (
                            <button 
                                key={option.id} 
                                onClick={() => setMood(option.id)}
                                className={`flex-grow flex-shrink basis-0 text-center py-1 text-xs sm:text-sm rounded-md transition-colors whitespace-nowrap ${mood === option.id ? 'bg-purple-600 font-bold' : 'hover:bg-gray-600'} ${option.id === 'all' ? 'px-2' : ''}`}
                            >
                                {option.emoji}
                            </button>
                        ))}
                    </div>
                </div>

                <button onClick={handleClearFilters} className="w-full text-center text-sm text-purple-400 hover:text-purple-300 font-semibold p-2">Limpar Filtros</button>
            </div>
        </div>
    );
};

// ATUALIZAÇÃO 2: Remover as props da assinatura da função
const Journal = () => {
    // ATUALIZAÇÃO 3: Obter as props do contexto
    const { user, userData, onInfoClick, handleEditNote, handleOpenNewNote } = useOutletContext();
    // As funções que eram props agora são atribuídas a partir dos handlers do contexto
    const setEditingEntry = handleEditNote;
    const openNewNoteEditor = handleOpenNewNote;

    const [entries, setEntries] = useState([]);
    const [vibrationFilter, setVibrationFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('');
    const [moodFilter, setMoodFilter] = useState('all');
    const [isLoading, setIsLoading] = useState(true);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [filtersVisible, setFiltersVisible] = useState(false);
    const [openMonths, setOpenMonths] = useState({});
    const dateInputRef = useRef(null);
    const filterButtonRef = useRef(null);
    const NOTE_LIMIT = 5;
    const isFreePlan = userData?.plano === 'gratuito';
    const hasReachedLimit = isFreePlan && entries.length >= NOTE_LIMIT;

    useEffect(() => { const handleClickOutside = (event) => { if (filterButtonRef.current && !filterButtonRef.current.contains(event.target)) { setFiltersVisible(false); } }; document.addEventListener("mousedown", handleClickOutside); return () => document.removeEventListener("mousedown", handleClickOutside); }, []);
    
    useEffect(() => {
        if (!user?.uid) { setIsLoading(false); return; }
        let q = query(collection(db, 'users', user.uid, 'journalEntries'), orderBy('createdAt', 'desc'));
        if (vibrationFilter !== 'all') { q = query(q, where('personalDay', '==', parseInt(vibrationFilter))); }
        if (moodFilter !== 'all') { q = query(q, where('mood', '==', parseInt(moodFilter))); }
        if (dateFilter) {
            const startOfDay = new Date(dateFilter.replace(/-/g, '/')); startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(dateFilter.replace(/-/g, '/')); endOfDay.setHours(23, 59, 59, 999);
            q = query(q, where('createdAt', '>=', Timestamp.fromDate(startOfDay)), where('createdAt', '<=', Timestamp.fromDate(endOfDay)));
        }
        const unsubscribe = onSnapshot(q, (snapshot) => { setEntries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))); setIsLoading(false); }, (error) => { console.error("Erro:", error); setIsLoading(false); });
        return () => unsubscribe();
    }, [user, vibrationFilter, dateFilter, moodFilter]);
    
    const groupedEntries = useMemo(() => {
        const groups = entries.reduce((acc, entry) => {
            const date = new Date(entry.createdAt.seconds * 1000);
            const monthYear = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
            if (!acc[monthYear]) acc[monthYear] = [];
            acc[monthYear].push(entry);
            return acc;
        }, {});
        if (Object.keys(groups).length > 0) {
            const firstMonth = Object.keys(groups)[0];
            if (openMonths[firstMonth] === undefined) {
                setOpenMonths(prev => ({ ...prev, [firstMonth]: true }));
            }
        }
        return groups;
    }, [entries, openMonths]); // Adicionado openMonths como dependência

    const toggleMonth = (monthYear) => {
        setOpenMonths(prev => ({ ...prev, [monthYear]: !prev[monthYear] }));
    };

    const handleDeleteNote = async (entryId) => { if (!user?.uid || !entryId) return; if (window.confirm("Tem certeza que deseja excluir esta anotação?")) { try { await deleteDoc(doc(db, 'users', user.uid, 'journalEntries', entryId)); } catch (error) { console.error("Erro:", error); } } };
    const handleNewNoteClick = () => { if (hasReachedLimit) { setShowUpgradeModal(true); } else { openNewNoteEditor(); }};
    
    // ATUALIZAÇÃO 4: Adicionado um estado de carregamento para 'userData'
    if (!userData) {
        return <div className="h-full w-full flex justify-center items-center"><Spinner /></div>;
    }

    return (
        <>
            {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} />}
            <div className="p-0 md:p-6 w-full max-w-4xl mx-auto h-full flex flex-col">
                <div className="flex-shrink-0 bg-gray-900/80 backdrop-blur-md px-4 py-4 md:px-2 md:bg-transparent md:backdrop-blur-none z-10">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl sm:text-3xl font-bold text-white">Diário de Bordo</h1>
                        <div className="relative" ref={filterButtonRef}>
                            <button onClick={() => setFiltersVisible(!filtersVisible)} className="flex items-center gap-2 text-sm font-semibold bg-gray-800/50 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"><FilterIcon className="w-4 h-4" /> Filtros</button>
                            <FilterPopover isVisible={filtersVisible} onClose={() => setFiltersVisible(false)} filters={{ date: dateFilter, vibration: vibrationFilter, mood: moodFilter }} setFilters={{ setDate: setDateFilter, setVibration: setVibrationFilter, setMood: setMoodFilter }} dateInputRef={dateInputRef} />
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pt-4 pr-8 md:pr-4">
                    {isLoading ? <div className="flex justify-center mt-16"><Spinner /></div> : 
                        entries.length === 0 ? 
                        <div className="bg-gray-800/50 border-2 border-dashed border-gray-700 rounded-xl p-8 h-64 flex items-center justify-center text-center">
                            <button onClick={handleNewNoteClick} className="cursor-pointer">
                                <p className="text-gray-400">Nenhuma anotação encontrada.</p>
                                <p className="text-purple-400 font-semibold mt-2">Clique para criar sua primeira anotação.</p>
                            </button>
                        </div> : 
                        (<div className="space-y-8 pb-24">
                            {Object.entries(groupedEntries).map(([monthYear, entriesInMonth]) => (
                                <div key={monthYear}>
                                    <button onClick={() => toggleMonth(monthYear)} className="w-full flex justify-between items-center text-left mb-4 group focus:outline-none">
                                        <h2 className="text-lg font-bold text-purple-300/80 capitalize pl-5 group-hover:text-purple-300">{monthYear.replace('de ', '/ ')}</h2>
                                        <ChevronDownIcon className={`w-6 h-6 text-purple-300/80 transition-transform group-hover:text-purple-300 ${openMonths[monthYear] ? 'rotate-180' : ''}`} />
                                    </button>
                                    {openMonths[monthYear] && (
                                        <div className="space-y-8 animate-fade-in-fast">
                                            {entriesInMonth.map(entry => (
                                                <JournalEntryCard key={entry.id} entry={entry} setEditingEntry={setEditingEntry} handleDelete={handleDeleteNote} onInfoClick={onInfoClick}/>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>)
                    }
                </div>
                
                <FloatingActionButton 
                    page="journal"
                    onNewNote={handleNewNoteClick}
                />
            </div>
        </>
    );
};

export default Journal;