import React from 'react';
// ATUALIZAÇÃO: Importar os textos para que o componente possa usá-los
import { textosVibracoes } from '../../data/content';

const VibrationPill = ({ vibrationNumber, onClick, className = '' }) => {
    const energyClasses = {
        1: 'bg-red-500 text-white', 2: 'bg-orange-500 text-white', 3: 'bg-yellow-500 text-black',
        4: 'bg-lime-500 text-black', 5: 'bg-cyan-500 text-black', 6: 'bg-blue-500 text-white',
        7: 'bg-purple-500 text-white', 8: 'bg-pink-500 text-white', 9: 'bg-teal-500 text-white',
        11: 'bg-violet-400 text-white', 22: 'bg-indigo-400 text-white',
        default: 'bg-gray-700 text-white'
    };

    const handleInteraction = (e) => {
        e.stopPropagation();
        
        // ATUALIZAÇÃO: Agora, buscamos o objeto de informação completo
        const infoObject = textosVibracoes[vibrationNumber] || textosVibracoes.default;
        
        // E adicionamos a propriedade 'numero' para garantir que a cor da borda funcione
        const infoPayload = { ...infoObject, numero: vibrationNumber };

        // Passamos o objeto completo para a função onClick
        onClick(infoPayload);
    };
    
    return (
        <button 
            onClick={handleInteraction}
            className={`text-xs font-bold px-2 py-1 rounded-full cursor-help transition-transform hover:scale-105 active:scale-100 ${energyClasses[vibrationNumber] || energyClasses.default} ${className}`}
            title={`Saiba mais sobre a Vibração ${vibrationNumber}`}
        >
            Vibração {vibrationNumber}
        </button>
    );
};

export default VibrationPill;