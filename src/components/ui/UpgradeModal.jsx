import React from 'react';
import { StarIcon } from './Icons'; // Reutilizando nosso componente de ícones

const UpgradeModal = ({ onClose }) => {
    return (
        // Overlay escuro que cobre a tela inteira
        <div 
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in"
            onClick={onClose} // Fecha o modal se clicar fora dele
        >
            {/* Caixa do modal */}
            <div 
                className="bg-gray-800 text-white p-8 rounded-2xl shadow-2xl border border-purple-500 w-full max-w-md text-center"
                onClick={(e) => e.stopPropagation()} // Impede que o clique dentro do modal o feche
            >
                <StarIcon className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                
                <h2 className="text-2xl font-bold mb-2 text-white">Desbloqueie seu Potencial Completo!</h2>
                
                <p className="text-gray-400 mb-6">
                    Você atingiu o limite de anotações do plano gratuito. Faça o upgrade para o Premium e tenha acesso a:
                </p>

                <ul className="text-left space-y-2 mb-8">
                    <li className="flex items-center"><StarIcon className="h-5 w-5 text-purple-400 mr-3" /> Anotações ilimitadas no seu Diário</li>
                    <li className="flex items-center"><StarIcon className="h-5 w-5 text-purple-400 mr-3" /> Planejador de Intenções no Calendário</li>
                    <li className="flex items-center"><StarIcon className="h-5 w-5 text-purple-400 mr-3" /> Relatórios mensais sobre seus ciclos</li>
                </ul>

                <button className="w-full bg-purple-600 font-bold py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors text-lg">
                    Seja Premium
                </button>
                <button 
                    onClick={onClose}
                    className="mt-4 text-sm text-gray-400 hover:text-white"
                >
                    Agora não
                </button>
            </div>
        </div>
    );
};

export default UpgradeModal;