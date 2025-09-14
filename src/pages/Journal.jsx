// /src/pages/Journal.jsx

import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../services/firebase';
import { collection, onSnapshot, query, where, orderBy, doc, deleteDoc, Timestamp } from "firebase/firestore";
import Spinner from '../components/ui/Spinner';
import UpgradeModal from '../components/ui/UpgradeModal';
import { CalendarIcon, EditIcon, ChevronDownIcon, TrashIcon, PlusIcon } from '../components/ui/Icons';
import VibrationPill from '../components/ui/VibrationPill';

const FilterIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
);

// MODIFICADO: Componente agora recebe a prop 'onInfoClick'
const Journal = ({ user, userData, setEditingEntry, openNewNoteEditor, onInfoClick }) => {
    const [entries, setEntries] = useState([]);
    const [vibrationFilter, setVibrationFilter] = useState('all');
    const [isVibrationFilterOpen, setIsVibrationFilterOpen] = useState(false);
    const [dateFilter, setDateFilter] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [filtersVisible, setFiltersVisible] = useState(false);
    
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
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    
    useEffect(() => {
        if (!user?.uid) { setIsLoading(false); return; }
        const entriesCollectionRef = collection(db, 'users', user.uid, 'journalEntries');
        let q = query(entriesCollectionRef, orderBy('createdAt', 'desc'));
        if (vibrationFilter !== 'all') q = query(q, where('personalDay', '==', parseInt(vibrationFilter)));
        if (dateFilter) {
            const startOfDay = new Date(dateFilter.replace(/-/g, '/')); startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(dateFilter.replace(/-/g, '/')); endOfDay.setHours(23, 59, 59, 999);
            q = query(q, where('createdAt', '>=', Timestamp.fromDate(startOfDay)), where('createdAt', '<=', Timestamp.fromDate(endOfDay)));
        }
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setEntries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'journal' })));
            setIsLoading(false);
        }, (error) => { console.error("Erro:", error); setIsLoading(false); });
        return () => unsubscribe();
    }, [user, vibrationFilter, dateFilter]);

    const handleDeleteNote = async (entryId) => {
        if (!user?.uid || !entryId) return;
        if (window.confirm("Tem certeza que deseja excluir esta anotação?")) {
            try { await deleteDoc(doc(db, 'users', user.uid, 'journalEntries', entryId)); } 
            catch (error) { console.error("Erro:", error); }
        }
    };
    
    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        return new Date(timestamp.seconds * 1000).toLocaleString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };
    
    const openDatePicker = () => { try { dateInputRef.current?.showPicker(); } catch (error) { console.error("Erro:", error); }};
    const handleNewNoteClick = () => { if (hasReachedLimit) { setShowUpgradeModal(true); } else { openNewNoteEditor(); }};
    const filterOptions = ['all', 1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22];
    
    return (
        <>
            {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} />}
            <div className="p-4 md:p-8 text-white w-full relative h-full pb-24 lg:pb-8">
                <div className="flex justify-between items-center mb-6 lg:hidden">
                    <h1 className="text-3xl font-bold">Anotações do Dia</h1>
                    <button onClick={() => setFiltersVisible(!filtersVisible)} className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700">
                        <FilterIcon className="w-5 h-5 text-purple-400" />
                    </button>
                </div>
                <div className={` ${filtersVisible ? 'block' : 'hidden'} lg:hidden mb-6 bg-gray-800/50 p-4 rounded-lg animate-fade-in`}>
                     <div className="space-y-4">
                        <div className="relative"><label className="text-sm text-gray-400 mb-2 block">Filtrar por data:</label><div onClick={openDatePicker} className="absolute left-3 bottom-2.5 w-5 h-5 cursor-pointer z-10"><CalendarIcon className="w-full h-full text-gray-400" /></div><input ref={dateInputRef} type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="custom-date-input bg-gray-700 border border-gray-600 rounded-lg p-2 text-sm w-full pl-10"/></div>
                        <div className="relative" ref={vibrationFilterRef}><label className="text-sm text-gray-400 mb-2 block">Filtrar por vibração:</label><button onClick={() => setIsVibrationFilterOpen(!isVibrationFilterOpen)} className="bg-gray-700 border border-gray-600 rounded-lg p-2 text-sm w-full flex justify-between items-center"><span>{vibrationFilter === 'all' ? 'Todas as Vibrações' : `Vibração ${vibrationFilter}`}</span><ChevronDownIcon className={`w-5 h-5 transition-transform ${isVibrationFilterOpen ? 'rotate-180' : ''}`} /></button>{isVibrationFilterOpen && (<div className="absolute top-full mt-2 w-full bg-gray-800 border border-gray-600 rounded-lg z-10 max-h-48 overflow-y-auto">{filterOptions.map(option => ( <button key={option} onClick={() => { setVibrationFilter(option); setIsVibrationFilterOpen(false); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-purple-600 ${vibrationFilter.toString() === option.toString() ? 'bg-purple-700' : ''}`}>{option === 'all' ? 'Todas' : option}</button>))}</div>)}</div>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-8 max-w-7xl mx-auto">
                    <div className="hidden lg:block lg:col-span-1 lg:sticky lg:top-8 self-start">
                         <button onClick={handleNewNoteClick} className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 mb-8"><EditIcon className="w-5 h-5" />Nova Anotação</button>
                        <div className="space-y-4">
                            <div className="relative"><label className="text-sm text-gray-400 mb-2 block">Filtrar por data:</label><div onClick={openDatePicker} className="absolute left-3 bottom-2.5 w-5 h-5 cursor-pointer z-10"><CalendarIcon className="w-full h-full text-gray-400" /></div><input ref={dateInputRef} type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="custom-date-input bg-gray-700 border border-gray-600 rounded-lg p-2 text-sm w-full pl-10"/></div>
                            <div className="relative" ref={vibrationFilterRef}><label className="text-sm text-gray-400 mb-2 block">Filtrar por vibração:</label><button onClick={() => setIsVibrationFilterOpen(!isVibrationFilterOpen)} className="bg-gray-700 border border-gray-600 rounded-lg p-2 text-sm w-full flex justify-between items-center"><span>{vibrationFilter === 'all' ? 'Todas as Vibrações' : `Vibração ${vibrationFilter}`}</span><ChevronDownIcon className={`w-5 h-5 transition-transform ${isVibrationFilterOpen ? 'rotate-180' : ''}`} /></button>{isVibrationFilterOpen && (<div className="absolute top-full mt-2 w-full bg-gray-800 border border-gray-600 rounded-lg z-10 max-h-48 overflow-y-auto">{filterOptions.map(option => ( <button key={option} onClick={() => { setVibrationFilter(option); setIsVibrationFilterOpen(false); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-purple-600 ${vibrationFilter.toString() === option.toString() ? 'bg-purple-700' : ''}`}>{option === 'all' ? 'Todas' : option}</button>))}</div>)}</div>
                        </div>
                    </div>
                    <div className="lg:col-span-3">
                        {isLoading ? <div className="flex justify-center mt-8"><Spinner /></div>
                        : entries.length === 0 ? <div className="bg-gray-800/50 border-2 border-dashed border-gray-700 rounded-xl p-8 h-64 flex items-center justify-center"><p className="text-gray-400 text-center">Nenhuma anotação encontrada.<br/>Clique no botão para começar.</p></div>
                        : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {entries.map(entry => (
                                    <div key={entry.id} onClick={() => setEditingEntry(entry)} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 animate-fade-in group relative hover:border-purple-500 cursor-pointer transition-colors flex flex-col min-h-[250px]">
                                        <div className="flex justify-between items-start mb-2 flex-shrink-0">
                                            <p className="text-sm font-semibold text-purple-300 pr-2">{formatDate(entry.createdAt)}</p>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                {/* CORREÇÃO: Passando a função onInfoClick para a prop onClick */}
                                                <VibrationPill vibrationNumber={entry.personalDay} onClick={onInfoClick} />
                                                <button onClick={(e) => {e.stopPropagation(); handleDeleteNote(entry.id);}} className="text-gray-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100" title="Excluir anotação"><TrashIcon className="h-4 w-4" /></button>
                                            </div>
                                        </div>
                                        <p className="text-gray-300 whitespace-pre-wrap text-sm line-clamp-6 flex-grow">{entry.content}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <button onClick={handleNewNoteClick} className="fixed bottom-6 right-6 bg-purple-600 text-white rounded-full p-4 shadow-lg hover:bg-purple-700 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 z-20 lg:hidden" aria-label="Nova Anotação"><PlusIcon className="w-6 h-6" /></button>
            </div>
        </>
    );
};

export default Journal;