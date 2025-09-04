import React from 'react';

// Ícone movido para dentro do arquivo
const StarIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

function LandingPage({ onEnterClick }) {
    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col">
            <header className="absolute top-0 left-0 right-0 z-10 p-4">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center">
                        <StarIcon className="h-8 w-8 text-purple-400" />
                        <h1 className="ml-2 text-xl font-bold">Sincro App</h1>
                    </div>
                    <button onClick={onEnterClick} className="bg-white/10 border border-white/20 text-white font-semibold py-2 px-5 rounded-full hover:bg-white/20 transition-colors">
                        Entrar
                    </button>
                </div>
            </header>
            <main className="flex-1 flex items-center justify-center text-center">
                <div className="container mx-auto px-4 animate-fade-in">
                    <h2 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400 mb-4">
                        Desvende sua Rota Pessoal.
                    </h2>
                    <p className="text-lg md:text-xl max-w-2xl mx-auto text-gray-300 mb-8">
                        Uma plataforma de autoconhecimento que integra astrologia, numerologia e práticas holísticas para guiar seu dia a dia.
                    </p>
                    <button onClick={onEnterClick} className="bg-purple-600 text-white font-bold py-3 px-8 rounded-full hover:bg-purple-700 transition-transform hover:scale-105">
                        Comece Agora
                    </button>
                </div>
            </main>
        </div>
    );
}

export default LandingPage;