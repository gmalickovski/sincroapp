// src/components/ui/FloatingActionButton.jsx

import React, { useState } from 'react';
import { PlusIcon, BookIcon, CheckSquareIcon, CalendarIcon, ClipboardCheckIcon, EditIcon } from './Icons';

const FloatingActionButton = ({
    page,
    onNewTask,
    onNewNote,
    onNewGoal,
    onNewMilestone,
    onGoToCalendar
}) => {
    const [isOpen, setIsOpen] = useState(false);

    // --- Estilos Padronizados e Finais ---
    const mainButtonBaseClasses = "w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-purple-500 z-20";
    const mainButtonColorClasses = "bg-purple-600 text-white hover:bg-purple-700";
    const secondaryButtonClasses = "w-12 h-12 rounded-full bg-gray-700 text-purple-300 flex items-center justify-center shadow-lg hover:bg-gray-600 transition-all duration-200 ease-out";
    
    const renderButtonContent = () => {
        const iconClasses = "w-7 h-7"; // Tamanho de ícone padronizado
        
        switch (page) {
            case 'dashboard':
            case 'calendar':
                return <PlusIcon className={`${iconClasses} transition-transform duration-300 ${isOpen ? 'rotate-45' : 'rotate-0'}`} />;
            case 'goals':
                return <PlusIcon className={iconClasses} />;
            case 'goalDetail':
                return <ClipboardCheckIcon className={iconClasses} />;
            case 'tasks':
                return <CalendarIcon className={iconClasses} />;
            case 'journal':
                return <EditIcon className={iconClasses} />;
            default:
                return null;
        }
    };

    const handleMainClick = () => {
        switch (page) {
            case 'dashboard':
            case 'calendar':
                setIsOpen(!isOpen);
                break;
            case 'goals':
                if (onNewGoal) onNewGoal();
                break;
            case 'goalDetail':
                if (onNewMilestone) onNewMilestone();
                break;
            case 'tasks':
                if (onGoToCalendar) onGoToCalendar();
                break;
            case 'journal':
                if (onNewNote) onNewNote();
                break;
            default:
                break;
        }
    };
    
    const handleSecondaryClick = (action) => {
        if (action) action();
        setIsOpen(false);
    };

    const renderSecondaryButtons = () => {
        if (page !== 'dashboard' && page !== 'calendar') {
            return null;
        }
        return (
            <div className={`flex flex-col items-center gap-4 transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
                <button onClick={() => handleSecondaryClick(onNewNote)} className={secondaryButtonClasses} title="Nova Anotação">
                    <BookIcon className="w-6 h-6" />
                </button>
                <button onClick={() => handleSecondaryClick(onNewTask)} className={secondaryButtonClasses} title="Nova Tarefa">
                    <CheckSquareIcon className="w-6 h-6" />
                </button>
            </div>
        );
    };

    return (
        <div className="fixed bottom-6 right-4 z-20">
            <div className="relative flex flex-col items-center gap-4">
                {renderSecondaryButtons()}
                <button onClick={handleMainClick} className={`${mainButtonBaseClasses} ${mainButtonColorClasses}`}>
                    {renderButtonContent()}
                </button>
            </div>
        </div>
    );
};

export default FloatingActionButton;