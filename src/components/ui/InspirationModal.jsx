import React from 'react';
import { XIcon } from './Icons';

const InspirationModal = ({ data, onClose }) => {
    if (!data) return null;

    const { title, number, icon, info, explicacao, customBody } = data;

    const getExplanatoryText = () => {
        if (!explicacao) return '';
        if (typeof explicacao === 'object' && explicacao.hasOwnProperty('texto')) {
            return explicacao.texto;
        }
        return String(explicacao);
    };

    const hasExplicacao = !!explicacao;
    const hasContentBelow = !!customBody || (!!info && (!!info.desc || !!info.inspiracao));
    const displayTitle = info?.titulo || info?.tituloTradicional || '';

    return (
        <div 
            onClick={onClose}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in"
        >
            <div 
                onClick={(e) => e.stopPropagation()}
                className="bg-gray-800 text-white rounded-2xl shadow-xl w-full max-w-2xl border border-purple-500/30 max-h-[90vh] flex flex-col"
            >
                {/* Cabeçalho (Layout refeito conforme seu rascunho) */}
                <div className="p-6 border-b border-gray-700 flex justify-between items-start gap-4">
                    <div className="flex-1">
                        {/* Linha 1: Ícone e Título Principal */}
                        <div className="flex items-center gap-3">
                            {icon && React.cloneElement(icon, { className: "h-6 w-6 text-purple-400 flex-shrink-0" })}
                            <h2 className="text-sm font-bold uppercase tracking-wider text-purple-300">{title}</h2>
                        </div>

                        {/* Linha 2: Título Grande */}
                        {typeof number !== 'undefined' && info && (
                            <h3 className="text-2xl sm:text-4xl font-bold text-white mt-2">{number} - {displayTitle}</h3>
                        )}
                    </div>

                    {/* Botão de Fechar */}
                    <button onClick={onClose} className="p-1 text-gray-500 hover:text-white transition-colors flex-shrink-0">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Corpo (Mantido como estava) */}
                <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
                    {hasExplicacao && (
                        <div>
                            <h4 className="font-bold text-white mb-2">O que isso significa?</h4>
                            <p className="text-gray-300 italic">"{getExplanatoryText()}"</p>
                        </div>
                    )}
                    {hasExplicacao && hasContentBelow && (
                         <div className="w-full h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
                    )}
                    {customBody && customBody}
                    {info && (
                        <div className="space-y-6">
                            {info.desc && (
                                <div>
                                    <h4 className="font-bold text-white mb-2">A Energia Principal</h4>
                                    <p className="text-gray-300 italic">"{info.desc}"</p>
                                </div>
                            )}
                            {info.inspiracao && (
                                <>
                                    {info.desc && <div className="w-full h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>}
                                    <div>
                                        <h4 className="font-bold text-white mb-2">Sua Rota Inspiradora</h4>
                                        <p className="text-gray-300 italic">
                                            {info.inspiracao}
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default React.memo(InspirationModal);