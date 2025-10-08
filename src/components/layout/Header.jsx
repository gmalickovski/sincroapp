import React from 'react';
import { StarIcon, PanelLeftCloseIcon, CheckIcon, MoveIcon } from '../ui/Icons';

const getInitials = (firstName = '', lastName = '') => {
    const firstInitial = firstName ? firstName[0] : '';
    const lastInitial = lastName ? lastName[0] : '';
    return `${firstInitial}${lastInitial}`.toUpperCase();
};

const Header = ({ userData, onMenuClick, onSettingsClick, desktopState, setDesktopState, isEditMode, setIsEditMode, activeView }) => {
    const safeUserData = userData || {};
    const initials = getInitials(safeUserData.primeiroNome, safeUserData.sobrenome);

    return (
        <header className="flex-shrink-0 bg-gray-900/80 backdrop-blur-md border-b border-gray-700/50 h-16 flex items-center justify-between px-4 sm:px-6 relative z-20">
            <div className="flex-1 flex justify-start items-center">
                <button 
                    onClick={() => setDesktopState(s => (s === 'expanded' ? 'collapsed' : 'expanded'))}
                    className="hidden lg:block text-gray-400 hover:text-white p-2"
                    title={desktopState === 'expanded' ? "Recolher menu" : "Expandir menu"}
                >
                    <PanelLeftCloseIcon className={`h-6 w-6 transition-transform duration-300 ${desktopState === 'collapsed' ? 'rotate-180' : ''}`} />
                </button>
                <div className="lg:hidden">
                    <button onClick={onMenuClick} className="text-gray-400 hover:text-white p-2" aria-label="Abrir menu">
                        <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2">
                <StarIcon className="h-6 w-6 text-purple-400" />
                <span className="text-xl font-bold text-white tracking-wider">SincroApp</span>
            </div>
            
            <div className="flex-1 flex justify-end items-center gap-2 sm:gap-4">
                {/* Botão de Edição para DESKTOP */}
                {activeView === 'dashboard' && (
                    <button
                        onClick={() => setIsEditMode(!isEditMode)}
                        className="hidden lg:flex items-center justify-center p-2 rounded-full transition-colors text-purple-300 hover:text-white hover:bg-gray-700"
                        title={isEditMode ? "Concluir Edição" : "Personalizar Layout"}
                    >
                        {isEditMode ? <CheckIcon className="w-6 h-6" /> : <MoveIcon className="w-6 h-6" />}
                    </button>
                )}

                {/* --- ATUALIZAÇÃO 1: O botão de confirmação para mobile foi REMOVIDO daqui --- */}
                
                <button 
                    onClick={onSettingsClick} 
                    className="h-9 w-9 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm hover:ring-2 hover:ring-purple-400 hover:ring-offset-2 hover:ring-offset-gray-900 transition-all focus:outline-none"
                    title="Minha Conta e Configurações"
                >
                    {initials || '?'}
                </button>
            </div>
        </header>
    );
};

export default Header;