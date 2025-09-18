// src/components/layout/Header.jsx

import React from 'react';
import { StarIcon } from '../ui/Icons';

const MenuIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
);

const Header = ({ userData, onMenuClick, isMobileMenuPinned }) => {
    const firstName = userData?.nome ? userData.nome.split(' ')[0] : '';

    return (
        <header className="relative h-16 md:h-20 bg-gray-900/50 backdrop-blur-lg border-b border-gray-700/50 flex items-center justify-between px-4 md:px-6 shrink-0">
            {/* Ícone de hambúrguer só aparece se o menu mobile NÃO estiver fixado ('pinned') */}
            {!isMobileMenuPinned && (
                <button onClick={onMenuClick} className="lg:hidden text-gray-400 hover:text-white transition-colors" title="Abrir menu">
                    <MenuIcon className="h-6 w-6" />
                </button>
            )}
            
            {/* Espaçador para o caso do botão de menu estar escondido */}
            {isMobileMenuPinned && <div className="w-6 h-6 lg:hidden"></div>}

            {/* Logo e Título (visível até lg, centralizado) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 lg:hidden">
                <StarIcon className="h-6 w-6 text-purple-400" />
                <span className="font-bold text-lg">SincroApp</span>
            </div>
            
            {/* Espaçador para o "Olá, ..." */}
            <div className="flex-1 hidden lg:block"></div>

            {/* Itens à direita */}
            <div className="flex items-center">
                <span className="text-sm text-gray-300 font-medium">
                    Olá, {firstName}
                </span>
            </div>
        </header>
    );
};

export default Header;