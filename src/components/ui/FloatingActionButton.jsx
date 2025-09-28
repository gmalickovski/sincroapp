import React, { useState } from 'react';
import { PlusIcon, BookIcon, CheckSquareIcon } from './Icons';

const FloatingActionButton = ({ onNewTask, onNewNote }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Classes de estilo com tamanhos ajustados para o padrão do app
    const mainButtonClasses = `w-14 h-14 bg-purple-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-purple-700 transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-purple-500`;
    const secondaryButtonClasses = "w-12 h-12 rounded-full bg-gray-700 text-purple-300 flex items-center justify-center shadow-lg hover:bg-gray-600 transition-all duration-200 ease-out";
    const mainButtonIconClasses = `transition-transform duration-300 ${isOpen ? 'rotate-45' : 'rotate-0'}`;

    const handleMainClick = () => {
        setIsOpen(!isOpen);
    };

    const handleSecondaryClick = (action) => {
        if (action) {
            action();
        }
        setIsOpen(false);
    };

    return (
        <div className="fixed bottom-6 right-6 z-20">
            <div className="relative flex flex-col items-center gap-3">
                {/* Botões secundários */}
                <div 
                    className={`flex flex-col items-center gap-3 transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}
                >
                    <button onClick={() => handleSecondaryClick(onNewNote)} className={secondaryButtonClasses} title="Nova Anotação">
                        <BookIcon className="w-6 h-6" />
                    </button>
                    <button onClick={() => handleSecondaryClick(onNewTask)} className={secondaryButtonClasses} title="Nova Tarefa">
                        <CheckSquareIcon className="w-6 h-6" />
                    </button>
                </div>
                
                {/* Botão principal */}
                <button onClick={handleMainClick} className={mainButtonClasses}>
                    <PlusIcon className={`w-7 h-7 ${mainButtonIconClasses}`} />
                </button>
            </div>
        </div>
    );
};

export default FloatingActionButton;