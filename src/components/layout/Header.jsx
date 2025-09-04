import React from 'react';

// O ícone de Logout foi movido para dentro deste arquivo para evitar erros de importação.
const LogOutIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

// O Header agora recebe a função 'onLogout' como uma propriedade (prop).
// A lógica de logout foi movida para o componente principal (App.jsx)
// para centralizar o controle de autenticação.
const Header = ({ user, onLogout }) => {
    return (
        <header className="h-20 bg-gray-900/50 backdrop-blur-lg border-b border-gray-700 flex items-center justify-between px-6 shrink-0">
            <div></div>
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

