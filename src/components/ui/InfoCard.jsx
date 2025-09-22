// src/components/ui/InfoCard.jsx

import React from 'react';

const ClickableTitle = ({ children, onClick, 'aria-label': ariaLabel }) => (
    <div 
        onClick={onClick} 
        className="relative group flex items-center cursor-help"
        role="button"
        aria-label={ariaLabel}
    >
        {children}
    </div>
);

const InfoCard = ({
    title,
    icon,
    number,
    info,
    colorClass = { text: 'text-purple-300', border: 'border-gray-600', bg: 'bg-gray-700' },
    infoKey,
    onInfoClick
}) => {
    const safeInfo = info || {};
    const displayTitle = safeInfo.tituloTradicional || safeInfo.titulo || safeInfo.nome || '';
    const displayDesc = safeInfo.desc || safeInfo.descricao || '';

    const handleInfoClick = () => {
        if (onInfoClick && infoKey) {
            onInfoClick(infoKey);
        }
    };

    return (
        <div className="bg-gray-800/80 backdrop-blur-lg border border-gray-700 rounded-2xl p-6 shadow-lg h-full flex flex-col">
            <div className="flex items-center text-gray-300 mb-4">
                {icon && React.cloneElement(icon, { className: "h-6 w-6 mr-3 text-purple-400" })}
                <h3 className="font-bold text-white">
                    <ClickableTitle 
                        onClick={handleInfoClick} 
                        aria-label={`Saiba mais sobre ${title}`}
                    >
                        <span>{title}</span>
                        <span className="ml-2 h-4 w-4 inline-flex items-center justify-center text-xs bg-gray-600 rounded-full transition-transform group-hover:scale-110 group-hover:bg-purple-500">?</span>
                    </ClickableTitle>
                </h3>
            </div>
            
            {/* ========== ÁREA DO LAYOUT ATUALIZADA ========== */}
            <div className="flex-1 flex items-center gap-6">
                
                {/* 1. O NÚMERO */}
                {/* O 'quadrado' foi removido. O número agora é um elemento de destaque, maior e com uma leve opacidade. */}
                <div className="flex-shrink-0">
                    <span 
                        className={`text-7xl font-bold ${colorClass.text} opacity-80`}
                        style={{ textShadow: `0 0 15px var(--tw-shadow-color)` }}
                    >
                        {number || '?'}
                    </span>
                </div>

                {/* 2. A LINHA DIVISÓRIA */}
                {/* Uma linha vertical sutil com gradiente para separar os elementos de forma elegante. */}
                <div className="w-px h-2/3 bg-gradient-to-b from-transparent via-purple-500/30 to-transparent"></div>

                {/* 3. O CONTEÚDO DE TEXTO */}
                <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-white text-lg">{displayTitle}</h4>
                    <p className="mt-1 text-sm text-gray-400 leading-relaxed">{displayDesc}</p>
                    {safeInfo.periodo && <p className="text-xs text-gray-500 font-medium mt-2">{safeInfo.periodo}</p>}
                </div>
            </div>
            {/* ================================================= */}
            
            {safeInfo.tags && safeInfo.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-700/50 pt-4">
                    {safeInfo.tags.map(tag => (
                        <span key={tag} className="bg-purple-500/30 text-purple-300 text-xs font-semibold px-3 py-1 rounded-full">{tag}</span>
                    ))}
                </div>
            )}
        </div>
    );
};

export default InfoCard;