// src/components/layout/Sidebar.jsx

import React from 'react';
import { HomeIcon, CalendarIcon, BookIcon, StarIcon, CheckSquareIcon, SettingsIcon, LogOutIcon, UserIcon, PanelLeftCloseIcon } from '../ui/Icons';

const Sidebar = ({ 
    activeView, 
    setActiveView, 
    onLogout, 
    userData,
    mobileState,
    setMobileState,
    desktopState,
    setDesktopState
}) => {
    
    const isAdmin = userData?.isAdmin || false;
    const navItems = [
        { id: 'dashboard', icon: <HomeIcon className="h-5 w-5" />, label: 'Sua Rota de Hoje' },
        { id: 'calendar', icon: <CalendarIcon className="h-5 w-5" />, label: 'Calendário' },
        { id: 'journal', icon: <BookIcon className="h-5 w-5" />, label: 'Anotações do Dia' },
        { id: 'tasks', icon: <CheckSquareIcon className="h-5 w-5" />, label: 'Diário de Tarefas' },
    ];
    if (isAdmin) {
        navItems.push({ id: 'admin', icon: <UserIcon className="h-5 w-5" />, label: 'Painel Admin' });
    }

    const handleItemClick = (viewId) => {
        setActiveView(viewId);
        if (mobileState === 'drawer') {
            setMobileState('closed');
        }
    };
    
    const getSidebarClasses = () => {
        let classes = 'transition-transform duration-300 ease-in-out ';
        classes += `lg:transition-[width] ${desktopState === 'collapsed' ? 'lg:w-20' : 'lg:w-64'} lg:translate-x-0 `;
        if (mobileState === 'closed') {
            classes += 'max-lg:-translate-x-full';
        } else if (mobileState === 'pinned') {
            classes += 'max-lg:translate-x-0 max-lg:w-20';
        } else { // drawer
            classes += 'max-lg:translate-x-0 max-lg:w-64';
        }
        return classes;
    };

    const isTextVisible = (typeof window !== 'undefined' && window.innerWidth >= 1024) 
        ? desktopState === 'expanded' 
        : mobileState === 'drawer';

    return (
        <>
            <div 
                className={`fixed inset-0 bg-black/60 z-30 lg:hidden transition-opacity ${mobileState === 'drawer' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setMobileState('closed')}
                aria-hidden="true"
            ></div>

            <aside 
                className={`fixed top-0 left-0 h-full bg-gray-900 text-gray-300 flex flex-col z-40
                           border-r border-gray-700/50 ${getSidebarClasses()}`}
            >
                <div className="h-16 md:h-20 flex-shrink-0 flex items-center border-b border-gray-700/50 relative px-4 justify-center">
                    <div className="hidden lg:flex items-center">
                         <StarIcon className={`h-8 w-8 text-purple-400 flex-shrink-0 transition-transform duration-300 ${desktopState === 'collapsed' ? 'lg:scale-110' : ''}`} />
                         <h1 className={`ml-3 text-xl font-bold text-white whitespace-nowrap transition-opacity duration-200 ${desktopState === 'collapsed' ? 'opacity-0 hidden' : 'opacity-100'}`}>
                            SincroApp
                        </h1>
                    </div>

                    {/* Ícone de fixar/recolher SÓ APARECE se o menu mobile NÃO estiver fechado */}
                    {mobileState !== 'closed' && (
                         <button 
                            onClick={() => setMobileState(s => s === 'pinned' ? 'closed' : 'pinned')}
                            className={`absolute top-1/2 -right-3 transform -translate-y-1/2 bg-gray-700 hover:bg-purple-600 text-white
                                    h-6 w-6 rounded-full flex items-center justify-center
                                    ring-8 ring-gray-900
                                    lg:hidden transition-transform duration-300
                                    ${mobileState === 'pinned' ? 'rotate-180' : 'rotate-0'}`}
                            title={mobileState === 'pinned' ? "Recolher menu" : "Fixar menu"}
                        >
                            <PanelLeftCloseIcon className="h-4 w-4" />
                        </button>
                    )}
                    
                    {/* Botão para recolher/expandir (desktop) */}
                    <button 
                        onClick={() => setDesktopState(s => s === 'expanded' ? 'collapsed' : 'expanded')} 
                        className={`absolute top-1/2 -right-3 transform -translate-y-1/2 bg-gray-700 hover:bg-purple-600 text-white
                                   h-6 w-6 rounded-full items-center justify-center ring-8 ring-gray-900
                                   hidden lg:flex transition-transform duration-300 ${desktopState === 'collapsed' ? 'rotate-180' : 'rotate-0'}`}
                        title={desktopState === 'collapsed' ? "Expandir" : "Recolher"}
                    >
                        <PanelLeftCloseIcon className="h-4 w-4" />
                    </button>
                </div>

                <nav className={`flex-1 py-6 px-2 space-y-2`}>
                    {navItems.map(item => (
                        <a href="#" key={item.id} onClick={(e) => { e.preventDefault(); handleItemClick(item.id); }}
                            title={item.label}
                            className={`flex items-center p-3 rounded-lg transition-colors duration-200 
                                      ${!isTextVisible ? 'justify-center' : 'justify-start'}
                                      ${ activeView === item.id ? 'bg-purple-600 text-white' : 'hover:bg-gray-800 hover:text-white'}`}>
                            {item.icon}
                            <span className={`ml-4 font-medium whitespace-nowrap transition-opacity duration-200 ${!isTextVisible ? 'opacity-0 hidden' : 'opacity-100'}`}>
                                {item.label}
                            </span>
                        </a>
                    ))}
                </nav>

                <div className={`py-4 px-2 border-t border-gray-700/50 space-y-2`}>
                     <a href="#" onClick={(e) => { e.preventDefault(); handleItemClick('settings'); }}
                        title="Configurações"
                        className={`flex items-center p-3 rounded-lg transition-colors duration-200 
                                  ${!isTextVisible ? 'justify-center' : 'justify-start'}
                                  ${ activeView === 'settings' ? 'bg-purple-600 text-white' : 'hover:bg-gray-800 hover:text-white'}`}>
                        <SettingsIcon className="h-5 w-5" />
                        <span className={`ml-4 font-medium whitespace-nowrap transition-opacity duration-200 ${!isTextVisible ? 'opacity-0 hidden' : 'opacity-100'}`}>
                            Configurações
                        </span>
                    </a>
                    <a href="#" onClick={(e) => { e.preventDefault(); onLogout(); }}
                        title="Sair"
                        className={`flex items-center p-3 rounded-lg transition-colors duration-200 text-red-400 hover:bg-red-500/20 hover:text-red-300
                                  ${!isTextVisible ? 'justify-center' : 'justify-start'}`}>
                        <LogOutIcon className="h-5 w-5" />
                        <span className={`ml-4 font-medium whitespace-nowrap transition-opacity duration-200 ${!isTextVisible ? 'opacity-0 hidden' : 'opacity-100'}`}>
                            Sair
                        </span>
                    </a>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;