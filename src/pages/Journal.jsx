// src/pages/Journal.jsx

import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../services/firebase';
import { collection, onSnapshot, query, where, orderBy, doc, deleteDoc, Timestamp } from "firebase/firestore";
import Spinner from '../components/ui/Spinner';
import UpgradeModal from '../components/ui/UpgradeModal';
import { CalendarIcon, EditIcon, ChevronDownIcon, TrashIcon, FilterIcon, XIcon } from '../components/ui/Icons';
import VibrationPill from '../components/ui/VibrationPill';

// ### COMPONENTE REFEITO E CORRIGIDO ###
// Estrutura refeita do zero, inspirada em componentes funcionais, para garantir a quebra de linha.
const JournalEntryCard = ({ entry, setEditingEntry, handleDelete, onInfoClick }) => {
    const energyClasses = {
        1: { border: 'border-red-500', bg: 'bg-red-500/20', text: 'text-red-300' },
        2: { border: 'border-orange-500', bg: 'bg-orange-500/20', text: 'text-orange-300' },
        3: { border: 'border-yellow-500', bg: 'bg-yellow-500/20', text: 'text-yellow-300' },
        4: { border: 'border-lime-500', bg: 'bg-lime-500/20', text: 'text-lime-300' },
        5: { border: 'border-cyan-500', bg: 'bg-cyan-500/20', text: 'text-cyan-300' },
        6: { border: 'border-blue-500', bg: 'bg-blue-500/20', text: 'text-blue-300' },
        7: { border: 'border-purple-500', bg: 'bg-purple-500/20', text: 'text-purple-300' },
        8: { border: 'border-pink-500', bg: 'bg-pink-500/20', text: 'text-pink-300' },
        9: { border: 'border-teal-500', bg: 'bg-teal-500/20', text: 'text-teal-300' },
        11: { border: 'border-violet-400', bg: 'bg-violet-400/20', text: 'text-violet-300' },
        22: { border: 'border-indigo-400', bg: 'bg-indigo-400/20', text: 'text-indigo-300' },
        default: { border: 'border-gray-700', bg: 'bg-gray-800/50', text: 'text-gray-300' }
    };
    const currentEnergy = energyClasses[entry.personalDay] || energyClasses.default;
    const formattedDate = new Date(entry.createdAt.seconds * 1000).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });

    return (
        <div className="relative pl-8">
            {/* Linha do tempo e bolinha */}
            <div className="absolute left-0 h-full w-px bg-gray-700">
                <div className="absolute top-1 left-1/2 w-3 h-3 bg-gray-600 rounded-full -translate-x-1/2"></div>
            </div>

            {/* Card principal */}
            <div 
                onClick={() => setEditingEntry(entry)}
                className={`w-full bg-gray-800/60 border ${currentEnergy.border} rounded-xl shadow-lg animate-fade-in group relative hover:border-purple-400/80 cursor-pointer transition-all duration-300 ml-4 flex flex-col`}
            >
                {/* Cabeçalho do Card */}
                <div className={`p-4 rounded-t-xl ${currentEnergy.bg} flex-shrink-0`}>
                    <div className="flex justify-between items-center gap-4">
                        <h3 className={`font-bold capitalize ${currentEnergy.text} truncate`}>{formattedDate}</h3>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <VibrationPill vibrationNumber={entry.personalDay} onClick={onInfoClick} />
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleDelete(entry.id); }} 
                                className="text-gray-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100" 
                                title="Excluir anotação"
                            >
                                <TrashIcon className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Corpo do Card - SOLUÇÃO DEFINITIVA */}
                <div className="p-4 min-w-0">
                    <p className="text-gray-300 whitespace-pre-wrap break-words text-sm line-clamp-5 font-serif">
                        {entry.content}
                    </p>
                </div>
            </div>
        </div>
    );
};


// Componente de Filtros (sem alteração)
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

// Componente Principal
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
        let q = query(collection(db, 'users', user.uid, 'journalEntries'), orderBy('createdAt', 'desc'));
        if (vibrationFilter !== 'all') q = query(q, where('personalDay', '==', parseInt(vibrationFilter)));
        if (dateFilter) { const startOfDay = new Date(dateFilter.replace(/-/g, '/')); startOfDay.setHours(0, 0, 0, 0); const endOfDay = new Date(dateFilter.replace(/-/g, '/')); endOfDay.setHours(23, 59, 59, 999); q = query(q, where('createdAt', '>=', Timestamp.fromDate(startOfDay)), where('createdAt', '<=', Timestamp.fromDate(endOfDay))); }
        const unsubscribe = onSnapshot(q, (snapshot) => { setEntries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'journal' }))); setIsLoading(false); }, (error) => { console.error("Erro:", error); setIsLoading(false); });
        return () => unsubscribe();
    }, [user, vibrationFilter, dateFilter]);

    const handleDeleteNote = async (entryId) => { if (!user?.uid || !entryId) return; if (window.confirm("Tem certeza que deseja excluir esta anotação?")) { try { await deleteDoc(doc(db, 'users', user.uid, 'journalEntries', entryId)); } catch (error) { console.error("Erro:", error); } } };
    const handleNewNoteClick = () => { if (hasReachedLimit) { setShowUpgradeModal(true); } else { openNewNoteEditor(); }};
    
    return (
        <>
            {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} />}
            <div className="p-4 md:p-8 text-white w-full max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                    <h1 className="text-2xl sm:text-3xl font-bold">Diário de Bordo</h1>
                    <div className="relative" ref={filterButtonRef}>
                        <button onClick={() => setFiltersVisible(!filtersVisible)} className="flex items-center gap-2 text-sm font-semibold bg-gray-800/50 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors">
                            <FilterIcon className="w-4 h-4" /> Filtros
                        </button>
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
                    (
                    <div className="space-y-6 relative">
                        <div className="absolute left-3.5 top-0 h-full w-px bg-gray-700 -z-10"></div>
                        {entries.map(entry => (
                            <JournalEntryCard 
                                key={entry.id}
                                entry={entry}
                                setEditingEntry={setEditingEntry}
                                handleDelete={handleDeleteNote}
                                onInfoClick={onInfoClick}
                            />
                        ))}
                    </div>
                    )
                }

                <button onClick={handleNewNoteClick} className="fixed bottom-6 right-6 bg-purple-600 text-white rounded-full p-4 shadow-lg hover:bg-purple-700 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-purple-500 z-20" aria-label="Nova Anotação">
                    <EditIcon className="w-6 h-6" />
                </button>
            </div>
        </>
    );
};

export default Journal;