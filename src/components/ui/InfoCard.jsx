import React from 'react';

const InfoCard = ({ title, icon, number, info, colorClass = { text: 'text-purple-300' }, onCardClick, children }) => {
    if (!info && !children) return null;

    const displayTitle = info?.tituloTradicional || info?.titulo || info?.nome || '';
    const displayDesc = info?.desc || info?.descricao || '';

    return (
        <div 
            onClick={onCardClick}
            className="group bg-gray-800/80 backdrop-blur-lg border border-gray-700 rounded-2xl p-6 shadow-lg h-full flex flex-col cursor-pointer hover:border-purple-500/60 transition-colors duration-300"
        >
            <div className="flex items-center text-gray-300 mb-4">
                {icon && React.cloneElement(icon, { className: "h-6 w-6 mr-3 text-purple-400" })}
                <h3 className="font-bold text-white">{title}</h3>
            </div>
            
            <div className="flex-1 flex flex-col justify-center">
                {children ? (
                    children
                ) : (
                    <div className="flex flex-col justify-between flex-1">
                        <div className="flex items-center gap-6">
                            {typeof number !== 'undefined' && number !== null && (
                                <>
                                    <div className="flex-shrink-0">
                                        <span 
                                            className={`text-7xl font-bold ${colorClass.text} opacity-80 transition-transform duration-300 group-hover:scale-105`}
                                            style={{ textShadow: `0 0 15px var(--tw-shadow-color)` }}
                                        >
                                            {number}
                                        </span>
                                    </div>
                                    <div className="w-px h-2/3 bg-gradient-to-b from-transparent via-purple-500/30 to-transparent"></div>
                                </>
                            )}
                            <div className="min-w-0 flex-1">
                                <h4 className="font-bold text-white text-lg">{displayTitle}</h4>
                                <p className="mt-1 text-sm text-gray-400 leading-relaxed">{displayDesc}</p>
                                {info.periodo && <p className="text-xs text-gray-500 font-medium mt-2">{info.periodo}</p>}
                            </div>
                        </div>

                        {/* ########## SEÇÃO DE TAGS ADICIONADA AQUI ########## */}
                        {info.tags && info.tags.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {info.tags.map((tag, index) => (
                                    <span key={index} className="bg-purple-500/20 text-purple-300 text-xs font-semibold px-2.5 py-1 rounded-full">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default React.memo(InfoCard);