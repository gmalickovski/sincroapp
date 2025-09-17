import React from 'react';
import { Link } from 'react-router-dom';
import * as Icons from '../components/ui/Icons';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <header className="container mx-auto px-6 py-4 flex justify-between items-center">
                {/* CORREÇÃO: Restaurada a marca SincroApp com o StarIcon */}
                <Link to="/" className="flex items-center gap-2">
                    <Icons.StarIcon className="h-8 w-8 text-purple-400" />
                    <span className="text-2xl font-bold text-purple-400">SincroApp</span>
                </Link>
                <nav>
                    <Link to="/login" className="bg-gray-800 hover:bg-gray-700 py-2 px-4 rounded-lg transition-colors">
                        Login
                    </Link>
                </nav>
            </header>

            <main className="container mx-auto px-6 py-24 text-center">
                <h1 className="text-5xl font-extrabold md:text-6xl mb-4">
                    Desvende o Universo que Existe em Você.
                </h1>
                <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
                    SincroApp é a sua bússola para o autoconhecimento, revelando os segredos da sua numerologia pessoal para guiar sua jornada diária.
                </p>
                <Link 
                    to="/register"
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg text-lg inline-block transition-transform transform hover:scale-105"
                >
                    Começar minha Jornada
                </Link>
            </main>
            
            <footer className="text-center py-8 text-gray-500">
                <Link to="/terms" className="hover:text-white mx-2">Termos de Serviço</Link>
                |
                <Link to="/privacy" className="hover:text-white mx-2">Política de Privacidade</Link>
            </footer>
        </div>
    );
};

export default LandingPage;