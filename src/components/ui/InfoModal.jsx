// /src/components/ui/InfoModal.jsx

import React from 'react';
import { XIcon } from './Icons';

const InfoModal = ({ info, onClose }) => {
    if (!info) return null;

    const energyClasses = {
        1: 'border-red-500', 2: 'border-orange-500', 3: 'border-yellow-500',
        4: 'border-lime-500', 5: 'border-cyan-500', 6: 'border-blue-500',
        7: 'border-purple-500', 8: 'border-pink-500', 9: 'border-teal-500',
        11: 'border-violet-400', 22: 'border-indigo-400',
        default: 'border-gray-700'
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] animate-fade-in p-4" onClick={onClose}>
            <div 
                className={`bg-gray-800 text-white p-6 rounded-2xl shadow-2xl w-full max-w-sm relative transition-all border-t-4 ${energyClasses[info.numero] || energyClasses.default}`}
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-3 right-3 p-2 rounded-full text-gray-400 hover:bg-gray-700"><XIcon className="h-5 w-5" /></button>
                
                {/* MODIFICADO: Removida a repetição da vibração no título */}
                <h3 className="text-xl font-bold text-white mb-2 pr-8">{info.titulo}</h3>
                <p className="text-gray-300 text-sm">{info.desc}</p>
            </div>
        </div>
    );
};

export default InfoModal;