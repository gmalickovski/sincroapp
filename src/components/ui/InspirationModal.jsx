// src/components/ui/InspirationModal.jsx

import React from 'react';
import { XIcon } from './Icons';

const InspirationModal = ({ data, onClose }) => {
    if (!data) return null;

    const { title, number, icon, info, explicacao, customBody } = data;

    // Função segura que evita o erro "Objects are not valid..."
    const getExplanatoryText = () => {
        if (!explicacao) return '';
        if (typeof explicacao === 'object' && explicacao.hasOwnProperty('texto')) {
            return explicacao.texto;
        }
        return String(explicacao);
    };

    return (
        <div 
            onClick={onClose}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in"
        >
            <div 
                onClick={(e) => e.stopPropagation()}
                className="bg-gray-800 text-white rounded-2xl shadow-xl w-full max-w-2xl border border-purple-500/30 max-h-[90vh] flex flex-col"
            >
                {/* Cabeçalho */}
                <div className="p-6 border-b border-gray-700 flex justify-between items-start gap-4">
                    <div className="flex items-center gap-4">
                        {icon && React.cloneElement(icon, { className: "h-8 w-8 text-purple-400 flex-shrink-0" })}
                        <div>
                            <h2 className="text-sm font-bold uppercase tracking-wider text-purple-300">{title}</h2>
                            {typeof number !== 'undefined' && info && (
                                <h3 className="text-3xl font-bold text-white mt-1">{number} - {info.titulo}</h3>
                            )}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1 text-gray-500 hover:text-white transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Corpo */}
                <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
                    {/* "O que significa" - Sempre visível se houver explicação */}
                    <div>
                        <h4 className="font-bold text-white mb-2">O que isso significa?</h4>
                        <p className="text-gray-300 italic">"{getExplanatoryText()}"</p>
                    </div>

                    {/* Divisor visual, só aparece se tiver mais conteúdo abaixo */}
                    {(customBody || (info && (info.desc || info.inspiracao))) && (
                        <div className="w-full h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
                    )}

                    {/* Conteúdo específico */}
                    {customBody ? customBody : (
                        info && (
                            <>
                                <div>
                                    <h4 className="font-bold text-white mb-2">A Energia Principal</h4>
                                    <p className="text-gray-300">"{info.desc}"</p>
                                </div>
                                {info.inspiracao && (
                                    <>
                                        <div className="w-full h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
                                        <div>
                                            <h4 className="font-bold text-white mb-2">Sua Rota Inspiradora</h4>
                                            <p className="text-lg text-gray-200 leading-relaxed whitespace-pre-wrap font-serif">
                                                {info.inspiracao}
                                            </p>
                                        </div>
                                    </>
                                )}
                            </>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default React.memo(InspirationModal);