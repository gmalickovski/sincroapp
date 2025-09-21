// src/components/ui/InfoCard.jsx

import React from 'react';
import { TarotIcon } from './Icons'; 

const Tooltip = ({ text, children }) => (
    <div className="relative group flex items-center cursor-help">
        {children}
        <div className="absolute bottom-full mb-2 w-max max-w-xs p-3 text-xs bg-gray-900 border border-gray-700 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            {text}
        </div>
    </div>
);

const InfoCard = ({
    title,
    tooltipText,
    icon,
    number,
    info,
    colorClass = { text: 'text-purple-300', border: 'border-gray-600', bg: 'bg-gray-700' }
}) => {
    const safeInfo = info || {};

    // ### CORREÇÃO DEFINITIVA AQUI ###
    // A lógica agora prioriza 'tituloTradicional' ou 'nome' para o título,
    // e 'desc' ou 'descricao' para a descrição, tornando o componente flexível.
    const displayTitle = safeInfo.tituloTradicional || safeInfo.titulo || safeInfo.nome || '';
    const displayDesc = safeInfo.desc || safeInfo.descricao || '';

    return (
        <div className="bg-gray-800/80 backdrop-blur-lg border border-gray-700 rounded-2xl p-6 shadow-lg h-full flex flex-col">
            <div className="flex items-center text-gray-300 mb-4">
                {icon && React.cloneElement(icon, { className: "h-6 w-6 mr-3 text-purple-400" })}
                <h3 className="font-bold text-white">
                    <Tooltip text={tooltipText}>
                        <span>{title}</span>
                        <span className="ml-2 h-4 w-4 inline-flex items-center justify-center text-xs bg-gray-600 rounded-full">?</span>
                    </Tooltip>
                </h3>
            </div>
            
            <div className="flex-1">
                <div className="flex flex-col sm:flex-row items-start text-left gap-4">
                    <div className={`flex-shrink-0 w-20 h-20 ${colorClass.bg}/50 border ${colorClass.border}/50 rounded-lg flex items-center justify-center`}>
                        <span className={`text-4xl font-bold ${colorClass.text}`}>{number || '?'}</span>
                    </div>
                    <div className="min-w-0">
                        <h4 className="font-bold text-white text-lg">{displayTitle}</h4>
                        <p className="mt-1 text-sm text-gray-400">{displayDesc}</p>
                        {safeInfo.periodo && <p className="text-xs text-gray-500 font-medium mt-2">{safeInfo.periodo}</p>}
                    </div>
                </div>
                {safeInfo.tags && safeInfo.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {safeInfo.tags.map(tag => (
                            <span key={tag} className="bg-purple-500/30 text-purple-300 text-xs font-semibold px-3 py-1 rounded-full">{tag}</span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default InfoCard;