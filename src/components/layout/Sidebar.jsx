// src/components/layout/Sidebar.jsx

import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { HomeIcon, CalendarIcon, BookIcon, UserIcon, StarIcon, CheckSquareIcon, SettingsIcon, LogOutIcon } from '../ui/Icons';

const Sidebar = ({ isAdmin, isMobileOpen, closeMobileMenu, onLogout }) => {
    
    const navItems = [
        { to: '/app/dashboard', icon: <HomeIcon className="h-5 w-5" />, label: 'Sua Rota de Hoje' },
        { to: '/app/calendario', icon: <CalendarIcon className="h-5 w-5" />, label: 'Calendário' },
        { to: '/app/diario', icon: <BookIcon className="h-5 w-5" />, label: 'Anotações' },
        { to: '/app/tarefas', icon: <CheckSquareIcon className="h-5 w-5" />, label: 'Tarefas' },
    ];

    if (isAdmin) {
        navItems.push({ to: '/app/admin', icon: <UserIcon className="h-5 w-5" />, label: 'Painel Admin' });
    }

    const baseLinkClasses = "flex items-center p-3 rounded-lg transition-colors duration-200 justify-center lg:justify-start";
    const activeLinkClasses = "bg-purple-600 text-white";
    const inactiveLinkClasses = "hover:bg-gray-800 hover:text-white";

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
                           w-20 lg:w-64
                           ${isMobileOpen ? 'translate-x-0' : ''}`}
            >
                <div className="h-20 flex-shrink-0 hidden lg:flex items-center border-b border-gray-700 justify-center lg:justify-start lg:px-6">
                    <StarIcon className="h-8 w-8 text-purple-400 flex-shrink-0" />
                    <h1 className="ml-3 text-xl font-bold text-white whitespace-nowrap hidden lg:block">SincroApp</h1>
                </div>

                <nav className="flex-1 py-6 px-2 lg:px-4 space-y-2">
                    {navItems.map(item => (
                        <NavLink 
                            to={item.to} 
                            key={item.to}
                            onClick={closeMobileMenu}
                            title={item.label}
                            className={({ isActive }) => `${baseLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}
                        >
                            {item.icon}
                            <span className="ml-4 font-medium hidden lg:block">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="py-4 px-2 lg:px-4 border-t border-gray-700 space-y-2">
                     <Link to="/settings" onClick={closeMobileMenu} title="Configurações" className={`${baseLinkClasses} ${inactiveLinkClasses}`}>
                        <SettingsIcon className="h-5 w-5" />
                        <span className="ml-4 font-medium hidden lg:block">Configurações</span>
                    </Link>
                    <a href="#" onClick={(e) => { e.preventDefault(); onLogout(); }} title="Sair" className={`${baseLinkClasses} text-red-400 hover:bg-red-500/20 hover:text-red-300`}>
                        <LogOutIcon className="h-5 w-5" />
                        <span className="ml-4 font-medium hidden lg:block">Sair</span>
                    </a>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;