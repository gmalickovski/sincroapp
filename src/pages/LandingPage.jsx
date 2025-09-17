// src/pages/LandingPage.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { StarIcon, CheckCircleIcon } from '../components/ui/Icons';

const Header = () => (
    <header className="absolute top-0 left-0 w-full z-10 p-4">
        <div className="container mx-auto flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2">
                <StarIcon className="h-8 w-8 text-purple-400" />
                <span className="text-xl font-bold text-white">SincroApp</span>
            </Link>
            <nav className="flex items-center gap-4">
                <a href="#features" className="text-gray-300 hover:text-white transition-colors">Funcionalidades</a>
                <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Planos</a>
                <Link to="/login" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                    Acessar
                </Link>
            </nav>
        </div>
    </header>
);

const Footer = () => (
    <footer className="bg-gray-900 text-gray-400 py-8 border-t border-gray-800">
        <div className="container mx-auto text-center">
            <p>&copy; {new Date().getFullYear()} SincroApp. Todos os direitos reservados.</p>
            <div className="mt-4">
                <Link to="/termos-de-servico" className="hover:text-white mx-2">Termos de Serviço</Link>
                <Link to="/politica-de-privacidade" className="hover:text-white mx-2">Política de Privacidade</Link>
            </div>
        </div>
    </footer>
);

const LandingPage = () => {
    const features = [
        "Dashboard com sua vibração diária pessoal",
        "Calendário numerológico para planejamento",
        "Diário para anotações e insights",
        "Acompanhamento de tarefas alinhadas ao seu dia"
    ];

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans">
            <Header />

            {/* Hero Section */}
            <main className="pt-24 md:pt-32">
                <section className="container mx-auto text-center px-6 py-16 md:py-24">
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
                        Sincronize sua vida com o poder dos números.
                    </h1>
                    <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-gray-300">
                        O SincroApp é a sua ferramenta pessoal para navegar pela vida com mais clareza e propósito, usando a sabedoria da numerologia.
                    </p>
                    <div className="mt-10">
                        <Link to="/login" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-transform transform hover:scale-105">
                            Comece a sua jornada
                        </Link>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-16 md:py-24 bg-gray-800/50">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold">Ferramentas para sua Evolução</h2>
                            <p className="mt-4 text-gray-400">Descubra como o SincroApp pode te ajudar a viver em harmonia.</p>
                        </div>
                        <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                            {features.map((feature, index) => (
                                <div key={index} className="flex items-start gap-4">
                                    <CheckCircleIcon className="h-6 w-6 text-purple-400 flex-shrink-0 mt-1" />
                                    <p className="text-gray-300">{feature}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
                
                {/* Pricing Section */}
                <section id="pricing" className="py-16 md:py-24">
                    <div className="container mx-auto px-6">
                         <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold">Escolha o plano que sincroniza com você</h2>
                            <p className="mt-4 text-gray-400">Comece gratuitamente e evolua para o Premium quando sentir o chamado.</p>
                        </div>
                        <div className="flex flex-col md:flex-row justify-center items-stretch gap-8 max-w-4xl mx-auto">
                            {/* Free Plan */}
                            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8 w-full md:w-1/2 flex flex-col">
                                <h4 className="text-2xl font-semibold mb-2">Gratuito</h4>
                                <p className="text-gray-400 mb-6">O essencial para começar.</p>
                                <p className="text-4xl font-bold mb-6">R$0</p>
                                <ul className="space-y-4 mb-8 flex-grow text-gray-300">
                                    <li className="flex items-center"><CheckCircleIcon className="text-green-400 mr-3 h-5 w-5" /> Rota do dia atual</li>
                                    <li className="flex items-center"><CheckCircleIcon className="text-green-400 mr-3 h-5 w-5" /> Diário de Bordo (limite de 5 notas)</li>
                                    <li className="flex items-center"><CheckCircleIcon className="text-green-400 mr-3 h-5 w-5" /> Análise do Arcano do Dia</li>
                                </ul>
                                <Link to="/login" className="w-full text-center bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition">
                                    Começar Agora
                                </Link>
                            </div>
                             {/* Premium Plan */}
                            <div className="bg-gray-800 border-2 border-purple-500 rounded-2xl p-8 w-full md:w-1/2 relative flex flex-col shadow-lg shadow-purple-500/10">
                                <span className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full absolute -top-4 left-1/2 -translate-x-1/2">RECOMENDADO</span>
                                <h4 className="text-2xl font-semibold mb-2 text-purple-300">Premium</h4>
                                <p className="text-gray-400 mb-6">Acesse todo o potencial.</p>
                                <p className="text-4xl font-bold mb-6">R$19,90<span className="text-lg font-normal text-gray-400">/mês</span></p>
                                <ul className="space-y-4 mb-8 flex-grow text-gray-300">
                                    <li className="flex items-center font-semibold"><CheckCircleIcon className="text-green-400 mr-3 h-5 w-5" /> Tudo do plano Gratuito, e mais:</li>
                                    <li className="flex items-center"><CheckCircleIcon className="text-green-400 mr-3 h-5 w-5" /> Anotações e tarefas ilimitadas</li>
                                    <li className="flex items-center"><CheckCircleIcon className="text-green-400 mr-3 h-5 w-5" /> Calendário de Oportunidades completo</li>
                                    <li className="flex items-center"><CheckCircleIcon className="text-green-400 mr-3 h-5 w-5" /> Relatórios de Ciclos Pessoais</li>
                                </ul>
                                <Link to="/login" className="w-full text-center bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition">
                                    Desbloquear Premium
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default LandingPage;