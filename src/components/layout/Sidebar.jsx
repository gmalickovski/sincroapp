import React from 'react';
import { NavLink } from 'react-router-dom';
// A importação "import * as Icons" está correta
import * as Icons from '../ui/Icons'; 
import { useAuth } from '../../contexts/AuthContext';

// CORREÇÃO: Usando os nomes corretos dos componentes de ícones (ex: HomeIcon)
const navLinks = [
    { to: "/dashboard", icon: Icons.HomeIcon, label: "Início" },
    { to: "/dashboard/calendar", icon: Icons.CalendarIcon, label: "Calendário" },
    { to: "/dashboard/journal", icon: Icons.BookIcon, label: "Diário" },
    { to: "/dashboard/tasks", icon: Icons.CheckSquareIcon, label: "Jornada" }, // Usando um ícone mais apropriado que já existe
    { to: "/dashboard/settings", icon: Icons.SettingsIcon, label: "Ajustes" },
];

const Sidebar = () => {
    const { logout } = useAuth();

    return (
        <div className="w-20 md:w-64 bg-gray-800 flex flex-col">
            <div className="flex items-center justify-center md:justify-start md:pl-6 h-20 border-b border-gray-700">
                 {/* CORREÇÃO: Usando StarIcon e o nome SincroApp */}
                <Icons.StarIcon className="h-8 w-8 text-purple-400" />
                <h1 className="text-2xl font-bold text-purple-400 hidden md:block ml-2">SincroApp</h1>
            </div>
            <nav className="flex-1 px-2 py-4 space-y-2">
                {navLinks.map((link) => (
                    <NavLink
                        key={link.to} 
                        to={link.to}
                        end
                        className={({ isActive }) =>
                            `flex items-center p-3 rounded-lg transition-colors ${
                                isActive 
                                ? 'bg-purple-600 text-white' 
                                : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                            }`
                        }
                    >
                        <link.icon className="h-6 w-6" />
                        <span className="ml-4 hidden md:block">{link.label}</span>
                    </NavLink>
                ))}
            </nav>
            <div className="px-2 py-4 border-t border-gray-700">
                <button
                    onClick={logout}
                    className="flex items-center p-3 w-full rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                >
                    {/* CORREÇÃO: Usando o nome correto do ícone de logout */}
                    <Icons.LogOutIcon className="h-6 w-6" />
                    <span className="ml-4 hidden md:block">Sair</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;