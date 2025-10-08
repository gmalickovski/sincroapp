import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, CalendarIcon, BookIcon, CheckSquareIcon, SettingsIcon, LogOutIcon, UserIcon, PanelLeftCloseIcon, IconTarget } from '../ui/Icons';

const Sidebar = ({ 
    onLogout, 
    userData,
    mobileState,
    setMobileState,
    desktopState,
    setDesktopState,
    onSettingsClick
}) => {
    
    const getSidebarWidthClass = () => {
        let classes = `${desktopState === 'collapsed' ? 'lg:w-16' : 'lg:w-64'} `;
        classes += `${mobileState === 'pinned' ? 'max-lg:w-16' : 'max-lg:w-64'}`;
        return classes;
    };

    const isTextVisible = (window.innerWidth >= 1024 && desktopState === 'expanded') || (window.innerWidth < 1024 && mobileState === 'drawer');

    // ATUALIZAÇÃO: Os 'labels' foram alterados para os novos nomes temáticos.
    const navItems = [
        { id: 'dashboard', icon: <HomeIcon className="h-5 w-5 flex-shrink-0" />, label: 'Rota do Dia' },
        { id: 'calendar', icon: <CalendarIcon className="h-5 w-5 flex-shrink-0" />, label: 'Agenda' },
        { id: 'journal', icon: <BookIcon className="h-5 w-5 flex-shrink-0" />, label: 'Diário de Bordo' },
        { id: 'tasks', icon: <CheckSquareIcon className="h-5 w-5 flex-shrink-0" />, label: 'Foco do Dia' },
        { id: 'goals', icon: <IconTarget className="h-5 w-5 flex-shrink-0" />, label: 'Jornadas' },
    ];
    if (userData?.isAdmin) {
        navItems.push({ id: 'admin', icon: <UserIcon className="h-5 w-5 flex-shrink-0" />, label: 'Controle da Missão' });
    }

    return (
        <>
            <div 
                className={`fixed inset-0 bg-black/60 z-30 lg:hidden transition-opacity ${mobileState === 'drawer' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setMobileState('closed')}
                aria-hidden="true"
            ></div>

            <aside 
                className={`
                    flex-shrink-0 bg-gray-900 text-gray-300 flex flex-col border-r border-gray-700/50 z-30
                    transition-all duration-300 ease-in-out
                    ${getSidebarWidthClass()}
                    max-lg:fixed max-lg:h-full max-lg:top-0 max-lg:left-0
                    ${mobileState === 'closed' ? 'max-lg:-translate-x-full' : 'max-lg:translate-x-0'}
                `}
            >
                <div className="lg:hidden flex-shrink-0 h-16 flex items-center justify-center border-b border-gray-700/50">
                    <button 
                        onClick={() => setMobileState(s => (s === 'pinned' ? 'drawer' : 'pinned'))}
                        className="flex items-center p-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white"
                        title={mobileState === 'pinned' ? "Expandir menu" : "Fixar menu"}
                    >
                        <PanelLeftCloseIcon className={`h-5 w-5 flex-shrink-0 transition-transform duration-300 ${mobileState === 'pinned' ? 'rotate-180' : ''}`} />
                    </button>
                </div>
                
                <nav className="flex-1 pt-4 px-2 space-y-2 overflow-y-auto">
                    {navItems.map(item => (
                        <NavLink 
                            key={item.id} 
                            to={`/app/${item.id}`}
                            onClick={() => {
                                if (mobileState === 'drawer') {
                                    setMobileState('closed');
                                }
                            }}
                            title={isTextVisible ? undefined : item.label}
                            className={({ isActive }) => `
                                flex items-center p-3 rounded-lg transition-colors duration-200 
                                ${!isTextVisible ? 'justify-center' : 'justify-start'}
                                ${ isActive ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`
                            }
                        >
                            {item.icon}
                            <span className={`font-medium whitespace-nowrap overflow-hidden transition-opacity duration-200 ${isTextVisible ? 'ml-4 opacity-100' : 'opacity-0 w-0'}`}>
                                {item.label}
                            </span>
                        </NavLink>
                    ))}
                </nav>

                <div className="py-4 px-2 border-t border-gray-700/50 space-y-2">
                    <a href="#" onClick={(e) => { e.preventDefault(); onSettingsClick(); }}
                        title="Configurações"
                        className={`flex items-center p-3 rounded-lg transition-colors duration-200 text-gray-400 hover:bg-gray-800 hover:text-white
                                  ${!isTextVisible ? 'justify-center' : 'justify-start'}`}>
                        <SettingsIcon className="h-5 w-5 flex-shrink-0" />
                        <span className={`font-medium whitespace-nowrap overflow-hidden transition-opacity duration-200 ${isTextVisible ? 'ml-4 opacity-100' : 'opacity-0 w-0'}`}>
                            Configurações
                        </span>
                    </a>
                    <a href="#" onClick={(e) => { e.preventDefault(); onLogout(); }}
                        title="Sair"
                        className={`flex items-center p-3 rounded-lg transition-colors duration-200 text-red-400 hover:bg-red-500/20 hover:text-red-300
                                  ${!isTextVisible ? 'justify-center' : 'justify-start'}`}>
                        <LogOutIcon className="h-5 w-5 flex-shrink-0" />
                        <span className={`font-medium whitespace-nowrap overflow-hidden transition-opacity duration-200 ${isTextVisible ? 'ml-4 opacity-100' : 'opacity-0 w-0'}`}>
                            Sair
                        </span>
                    </a>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;