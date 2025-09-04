import React from 'react';

// Ícones foram movidos para dentro deste arquivo para evitar erros de importação.
const HomeIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const CalendarIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const BookIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
  </svg>
);
const UserIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const StarIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);


const Sidebar = ({ activeView, setActiveView, isAdmin }) => {
    // Array de objetos para definir os itens de navegação
    const navItems = [
        { id: 'dashboard', icon: <HomeIcon className="h-5 w-5" />, label: 'Sua Rota de Hoje' },
        { id: 'calendar', icon: <CalendarIcon className="h-5 w-5" />, label: 'Calendário' },
        { id: 'journal', icon: <BookIcon className="h-5 w-5" />, label: 'Diário de Bordo' },
    ];

    // Adiciona o item do Painel de Admin apenas se o usuário tiver a permissão 'isAdmin'
    if (isAdmin) {
        navItems.push({ id: 'admin', icon: <UserIcon className="h-5 w-5" />, label: 'Painel Admin' });
    }

    return (
        <aside className="w-16 md:w-64 bg-gray-900 text-gray-300 flex flex-col transition-all duration-300 shrink-0">
            {/* Logo do App */}
            <div className="h-20 flex items-center justify-center md:justify-start md:px-6 border-b border-gray-700">
                <StarIcon className="h-8 w-8 text-purple-400" />
                <h1 className="hidden md:block ml-3 text-xl font-bold text-white">Sincro App</h1>
            </div>

            {/* Itens de Navegação */}
            <nav className="flex-1 px-2 md:px-4 py-6 space-y-2">
                {navItems.map(item => (
                    <a href="#" key={item.id} onClick={(e) => { e.preventDefault(); setActiveView(item.id); }}
                        className={`flex items-center justify-center md:justify-start p-3 rounded-lg transition-colors duration-200 ${ activeView === item.id ? 'bg-purple-600 text-white' : 'hover:bg-gray-800 hover:text-white'}`}>
                        {item.icon}
                        <span className="hidden md:block ml-4 font-medium">{item.label}</span>
                    </a>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;

