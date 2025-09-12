import React from 'react';
import { HomeIcon, CalendarIcon, BookIcon, UserIcon, StarIcon, CheckSquareIcon, SettingsIcon, LogOutIcon } from '../ui/Icons';

const Sidebar = ({ userData, activeView, setActiveView, isAdmin, isMobileOpen, closeMobileMenu, onLogout, onNavigateToSettings }) => {
    // A lista de navegação base
    const navItems = [
        { id: 'dashboard', icon: <HomeIcon className="h-5 w-5" />, label: 'Sua Rota de Hoje' },
        { id: 'calendar', icon: <CalendarIcon className="h-5 w-5" />, label: 'Calendário' },
        { id: 'journal', icon: <BookIcon className="h-5 w-5" />, label: 'Anotações do Dia' },
    ];

    // Adiciona "Diário de Tarefas" apenas se o plano não for gratuito (ou seja, for premium)
    if (userData?.plano !== 'gratuito') {
        navItems.push({ id: 'tasks', icon: <CheckSquareIcon className="h-5 w-5" />, label: 'Diário de Tarefas' });
    }

    // Adiciona o Painel Admin se o usuário for admin
    if (isAdmin) {
        navItems.push({ id: 'admin', icon: <UserIcon className="h-5 w-5" />, label: 'Painel Admin' });
    }

    const handleItemClick = (viewId) => {
        setActiveView(viewId);
        closeMobileMenu();
    };
    
    const handleSettingsClick = () => {
        onNavigateToSettings();
        closeMobileMenu();
    }

    return (
        <>
            <div 
                className={`fixed inset-0 bg-black/60 z-30 md:hidden transition-opacity ${isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={closeMobileMenu}
            ></div>

            <aside 
                className={`fixed top-0 left-0 h-full bg-gray-900 text-gray-300 flex flex-col z-40
                           transition-transform duration-300 ease-in-out 
                           -translate-x-full md:translate-x-0
                           w-64 md:w-20 lg:w-64
                           ${isMobileOpen ? 'translate-x-0' : ''}`}
            >
                
                <div className="h-20 flex-shrink-0 flex items-center border-b border-gray-700 justify-center lg:justify-start lg:px-6">
                    <StarIcon className="h-8 w-8 text-purple-400 flex-shrink-0" />
                    <h1 className="ml-3 text-xl font-bold text-white whitespace-nowrap hidden lg:block">Sincro App</h1>
                </div>

                <nav className="flex-1 py-6 px-2 lg:px-4 space-y-2">
                    {navItems.map(item => (
                        <a href="#" key={item.id} onClick={(e) => { e.preventDefault(); handleItemClick(item.id); }}
                            title={item.label}
                            className={`flex items-center p-3 rounded-lg transition-colors duration-200 justify-center lg:justify-start ${ activeView === item.id ? 'bg-purple-600 text-white' : 'hover:bg-gray-800 hover:text-white'}`}>
                            {item.icon}
                            <span className="ml-4 font-medium hidden lg:block">{item.label}</span>
                        </a>
                    ))}
                </nav>

                <div className="py-4 px-2 lg:px-4 border-t border-gray-700 space-y-2">
                     <a href="#" onClick={(e) => { e.preventDefault(); handleSettingsClick(); }}
                        title="Configurações"
                        className="flex items-center p-3 rounded-lg transition-colors duration-200 justify-center lg:justify-start hover:bg-gray-800 hover:text-white">
                        <SettingsIcon className="h-5 w-5" />
                        <span className="ml-4 font-medium hidden lg:block">Configurações</span>
                    </a>
                    <a href="#" onClick={(e) => { e.preventDefault(); onLogout(); }}
                        title="Sair"
                        className="flex items-center p-3 rounded-lg transition-colors duration-200 justify-center lg:justify-start text-red-400 hover:bg-red-500/20 hover:text-red-300">
                        <LogOutIcon className="h-5 w-5" />
                        <span className="ml-4 font-medium hidden lg:block">Sair</span>
                    </a>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;