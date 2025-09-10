import React from 'react';
import { LogOutIcon, StarIcon } from '../ui/Icons';

const MenuIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
);

const Header = ({ user, onLogout, onMenuClick }) => {
    return (
        <header className="h-16 md:h-20 bg-gray-900/50 backdrop-blur-lg border-b border-gray-700 flex items-center justify-between px-4 md:px-6 shrink-0">
            {/* Botão de menu à esquerda */}
            <button onClick={onMenuClick} className="md:hidden text-gray-400 hover:text-white transition-colors" title="Abrir menu">
                <MenuIcon className="h-6 w-6" />
            </button>

            {/* Logo e Título (apenas em mobile) */}
            <div className="md:hidden flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
                <StarIcon className="h-6 w-6 text-purple-400" />
                <span className="font-bold text-lg">Sincro App</span>
            </div>

            {/* Um div vazio para manter o alinhamento em telas grandes */}
            <div className="hidden md:block w-6 h-6"></div>

            {/* Itens à direita */}
            <div className="flex items-center">
                <span className="text-sm text-gray-300 mr-4 hidden sm:block">{user?.email}</span>
                <button onClick={onLogout} className="text-gray-400 hover:text-white transition-colors" title="Sair">
                    <LogOutIcon className="h-6 w-6" />
                </button>
            </div>
        </header>
    );
};

export default Header;