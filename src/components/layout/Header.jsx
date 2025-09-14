import React from 'react';
import { StarIcon } from '../ui/Icons';

// NOTE: O LogOutIcon foi removido dos imports pois não é mais usado aqui.

const MenuIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
);

const Header = ({ user, userData, onMenuClick }) => { // Removido onLogout, adicionado userData
    // Pega o primeiro nome do usuário a partir dos dados do Firestore
    const firstName = userData?.nome ? userData.nome.split(' ')[0] : '';

    return (
        <header className="relative h-16 md:h-20 bg-gray-900/50 backdrop-blur-lg border-b border-gray-700 flex items-center justify-between px-4 md:px-6 shrink-0">
            {/* Botão de menu à esquerda (visível até lg) */}
            <button onClick={onMenuClick} className="lg:hidden text-gray-400 hover:text-white transition-colors" title="Abrir menu">
                <MenuIcon className="h-6 w-6" />
            </button>

            {/* Logo e Título (visível até lg, posicionado de forma absoluta para centralização) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 lg:hidden">
                <StarIcon className="h-6 w-6 text-purple-400" />
                <span className="font-bold text-lg">SincroApp</span>
            </div>

            {/* Um div vazio para manter o alinhamento em telas grandes */}
            <div className="hidden lg:block w-6 h-6"></div>

            {/* Itens à direita (agora mostrando o primeiro nome) */}
            <div className="flex items-center">
                <span className="text-sm text-gray-300 font-medium hidden sm:block">
                    Olá, {firstName}
                </span>
            </div>
        </header>
    );
};

export default Header;