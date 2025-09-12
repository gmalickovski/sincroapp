import React from 'react';
import { StarIcon, CompassIcon, CalendarIcon, BookIcon } from '../components/ui/Icons';

const LandingPage = ({ onEnterClick, onNavigate }) => {
    return (
        <div className="bg-gray-900 text-white font-sans">
            {/* Header */}
            <header className="absolute top-0 left-0 right-0 z-10 p-4">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <StarIcon className="h-8 w-8 text-purple-400" />
                        <h1 className="text-xl font-bold">Sincro App</h1>
                    </div>
                    <button onClick={onEnterClick} className="bg-white/10 border border-white/20 text-white font-semibold py-2 px-5 rounded-full hover:bg-white/20 transition-colors">
                        Entrar
                    </button>
                </div>
            </header>

            {/* Seção Principal (Hero) */}
            <main className="min-h-screen flex items-center justify-center text-center px-4 pt-20 pb-10">
                <div className="container mx-auto animate-fade-in">
                    <h2 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400 mb-4 leading-tight">
                        Desvende sua Rota Pessoal.
                    </h2>
                    <p className="text-lg md:text-xl max-w-2xl mx-auto text-gray-300 mb-8">
                        Uma plataforma de autoconhecimento que integra numerologia e práticas holísticas para guiar seu dia a dia com intenção e clareza.
                    </p>
                    <button onClick={onEnterClick} className="bg-purple-600 text-white font-bold py-3 px-8 rounded-full hover:bg-purple-700 transition-transform hover:scale-105">
                        Comece Agora
                    </button>
                </div>
            </main>

            {/* Seção de Funcionalidades */}
            <section id="features" className="py-20 bg-gray-900">
                <div className="container mx-auto px-4 text-center">
                    <h3 className="text-4xl font-bold mb-4">Sua Jornada de Autoconhecimento</h3>
                    <p className="text-gray-400 max-w-2xl mx-auto mb-12">Ferramentas projetadas para você se conectar com seus ciclos e viver com mais propósito.</p>
                    
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1: Rota Diária */}
                        <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                            <CompassIcon className="h-10 w-10 text-purple-400 mx-auto mb-4" />
                            <h4 className="text-xl font-bold mb-2">Sua Rota Diária</h4>
                            <p className="text-gray-400 text-sm">Receba insights diários, mensais e anuais baseados na numerologia do seu nome e data de nascimento para navegar a vida com mais confiança.</p>
                            <img src="https://placehold.co/600x400/111827/7C3AED?text=Dashboard" alt="Dashboard do Sincro App" className="mt-4 rounded-md aspect-video object-cover"/>
                        </div>
                        {/* Feature 2: Calendário Sincronizado */}
                        <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                            <CalendarIcon className="h-10 w-10 text-purple-400 mx-auto mb-4" />
                            <h4 className="text-xl font-bold mb-2">Calendário Sincronizado</h4>
                            <p className="text-gray-400 text-sm">Planeje suas semanas e meses alinhando suas intenções com a energia de cada dia. Saiba os melhores momentos para agir, refletir ou descansar.</p>
                             <img src="https://placehold.co/600x400/111827/7C3AED?text=Calendário" alt="Calendário do Sincro App" className="mt-4 rounded-md aspect-video object-cover"/>
                        </div>
                        {/* Feature 3: Diário de Bordo */}
                        <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                            <BookIcon className="h-10 w-10 text-purple-400 mx-auto mb-4" />
                            <h4 className="text-xl font-bold mb-2">Diário de Bordo</h4>
                            <p className="text-gray-400 text-sm">Registre seus insights, sentimentos e acontecimentos. Conecte suas anotações às vibrações diárias e descubra padrões em sua jornada.</p>
                            <img src="https://placehold.co/600x400/111827/7C3AED?text=Diário" alt="Diário do Sincro App" className="mt-4 rounded-md aspect-video object-cover"/>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Seção de Planos */}
            <section id="pricing" className="py-20">
                <div className="container mx-auto px-4 text-center">
                     <h3 className="text-4xl font-bold mb-4">Encontre o Plano Certo para Você</h3>
                    <p className="text-gray-400 max-w-2xl mx-auto mb-12">Comece gratuitamente e evolua sua jornada quando sentir o chamado.</p>

                    <div className="flex flex-col md:flex-row justify-center items-center gap-8 max-w-4xl mx-auto">
                        {/* Plano Gratuito */}
                        <div className="bg-gray-800/50 p-8 rounded-lg border border-gray-700 w-full md:w-1/2">
                            <h4 className="text-2xl font-bold mb-2">Gratuito</h4>
                            <p className="text-gray-400 mb-6">O essencial para começar a se conectar.</p>
                            <ul className="space-y-3 text-left mb-8">
                                <li className="flex items-center gap-3"><span className="text-green-400">✔</span> Dashboard com Rota Diária</li>
                                <li className="flex items-center gap-3"><span className="text-green-400">✔</span> Acesso aos Arcanos e Ciclos</li>
                                <li className="flex items-center gap-3"><span className="text-green-400">✔</span> Diário de Tarefas</li>
                                <li className="flex items-center gap-3"><span className="text-green-400">✔</span> Limite de 5 anotações no Diário</li>
                            </ul>
                            <button onClick={onEnterClick} className="w-full bg-white/10 border border-white/20 font-semibold py-3 px-6 rounded-lg hover:bg-white/20 transition-colors">
                                Comece Agora
                            </button>
                        </div>
                        
                        {/* Plano Premium */}
                         <div className="bg-gray-800 p-8 rounded-lg border-2 border-purple-500 w-full md:w-1/2 relative shadow-2xl shadow-purple-500/10">
                            <span className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">MAIS POPULAR</span>
                            <h4 className="text-2xl font-bold mb-2 text-purple-300">Premium</h4>
                            <p className="text-gray-400 mb-6">Desbloqueie todo o potencial do Sincro.</p>
                             <ul className="space-y-3 text-left mb-8">
                                <li className="flex items-center gap-3"><span className="text-purple-400">✔</span> <b>Tudo do plano Gratuito, e mais:</b></li>
                                <li className="flex items-center gap-3"><span className="text-purple-400">✔</span> Anotações ilimitadas no Diário</li>
                                <li className="flex items-center gap-3"><span className="text-purple-400">✔</span> Planejador de Intenções no Calendário</li>
                                <li className="flex items-center gap-3"><span className="text-purple-400">✔</span> Relatórios mensais de ciclos (em breve)</li>
                                <li className="flex items-center gap-3"><span className="text-purple-400">✔</span> Integração com Google Calendar (em breve)</li>
                            </ul>
                            <button onClick={onEnterClick} className="w-full bg-purple-600 font-bold py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors">
                                Seja Premium
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="w-full p-8 border-t border-gray-800">
                <div className="container mx-auto text-center text-sm text-gray-500">
                    <p className="mb-2">Sincro App © {new Date().getFullYear()}</p>
                    <button onClick={() => onNavigate('privacy')} className="hover:text-white transition-colors">Política de Privacidade</button>
                    <span className="mx-2">|</span>
                    <button onClick={() => onNavigate('terms')} className="hover:text-white transition-colors">Termos de Serviço</button>
                </div>
            </footer>
        </div>
    );
}

export default LandingPage;