// /src/components/ui/JournalEntryModal.jsx

import React from 'react';
import { XIcon } from './Icons';
import VibrationPill from './VibrationPill'; // Importa a pílula

// MODIFICADO: Componente agora recebe a prop 'onInfoClick'
const JournalEntryModal = ({ entry, onClose, onInfoClick }) => {
    if (!entry) return null;

    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        return new Date(timestamp.seconds * 1000).toLocaleString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const energyColors = {
        1: 'border-red-500', 2: 'border-orange-500', 3: 'border-yellow-500',
        4: 'border-lime-500', 5: 'border-cyan-500', 6: 'border-blue-500',
        7: 'border-purple-500', 8: 'border-pink-500', 9: 'border-teal-500',
        11: 'border-violet-400', 22: 'border-indigo-400',
        default: 'border-gray-700'
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4" onClick={onClose}>
            <div 
                className={`bg-gray-800 text-white p-6 rounded-2xl shadow-2xl w-full max-w-lg relative transition-all border-t-4 ${energyColors[entry.personalDay] || energyColors.default}`}
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:bg-gray-700"><XIcon className="h-5 w-5" /></button>
                
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-white pr-8">{formatDate(entry.createdAt)}</h3>
                    {/* CORREÇÃO: Passando a função onInfoClick para a prop onClick */}
                    <VibrationPill vibrationNumber={entry.personalDay} onClick={onInfoClick} />
                </div>
                <p className="text-gray-300 whitespace-pre-wrap text-sm">{entry.content}</p>
            </div>
        </div>
    );
};

export default JournalEntryModal;