// /src/components/ui/VibrationPill.jsx

import React, { useState } from 'react';
import { textosDescritivos } from '../../data/content';

const VibrationPill = ({ vibrationNumber, className = '' }) => {
    // Cores associadas a cada vibração
    const energyClasses = {
        1: 'bg-red-500 text-white',
        2: 'bg-orange-500 text-white',
        3: 'bg-yellow-500 text-black',
        4: 'bg-lime-500 text-black',
        5: 'bg-cyan-500 text-black',
        6: 'bg-blue-500 text-white',
        7: 'bg-purple-500 text-white',
        8: 'bg-pink-500 text-white',
        9: 'bg-teal-500 text-white',
        11: 'bg-violet-400 text-white',
        22: 'bg-indigo-400 text-white',
        default: 'bg-gray-700 text-white'
    };

    // Pega o texto explicativo do nosso arquivo de conteúdo
    const infoVibracao = textosDescritivos.diaPessoal[vibrationNumber] || null;

    // Estado para controlar a visibilidade do tooltip no mobile (via clique)
    const [showTooltip, setShowTooltip] = useState(false);

    const handleInteraction = (e) => {
        // Previne que o clique na pílula acione o clique no card pai
        e.stopPropagation();
        // Alterna a visibilidade do tooltip em dispositivos de toque
        if ('ontouchstart' in window) {
            setShowTooltip(!showTooltip);
        }
    };

    const handleMouseLeave = () => {
        if ('ontouchstart' in window) {
            setShowTooltip(false);
        }
    };
    
    return (
        <div 
            className={`relative group ${className}`} 
            onClick={handleInteraction}
            onMouseLeave={handleMouseLeave}
        >
            {/* A pílula de vibração */}
            <span 
                className={`text-xs font-bold px-2 py-1 rounded-full cursor-help transition-colors ${energyClasses[vibrationNumber] || energyClasses.default}`}
            >
                Vibração {vibrationNumber}
            </span>

            {/* O Tooltip/Popup explicativo */}
            {infoVibracao && (
                 <div className={`absolute bottom-full mb-2 w-max max-w-xs p-3 text-sm bg-gray-900 border border-gray-600 rounded-lg shadow-lg transition-opacity pointer-events-none z-20
                                 md:opacity-0 md:group-hover:opacity-100 ${showTooltip ? 'opacity-100' : 'opacity-0'}`}>
                    <h4 className="font-bold text-white mb-1">{infoVibracao.titulo}</h4>
                    <p className="text-gray-400">{infoVibracao.desc}</p>
                </div>
            )}
        </div>
    );
};

export default VibrationPill;