import React from 'react';
import { StarIcon, ArrowLeftIcon } from '../components/ui/Icons'; // Reutilizando ícones existentes

const PrivacyPolicy = ({ onBackToHomeClick }) => {
    return (
        <div className="min-h-screen bg-gray-900 text-gray-300 font-sans p-4 sm:p-6 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <StarIcon className="h-12 w-12 text-purple-400 mx-auto" />
                    <h1 className="text-3xl font-bold mt-2 text-white">Política de Privacidade</h1>
                    <p className="text-gray-400">Última atualização: 11 de setembro de 2025</p>
                </div>

                <div className="bg-gray-800/50 p-6 md:p-8 rounded-2xl border border-gray-700 space-y-6">
                    <section>
                        <h2 className="text-xl font-bold text-purple-300 mb-2">1. Coleta de Dados</h2>
                        <p>Coletamos as informações que você nos fornece diretamente, como nome completo de nascimento, data de nascimento e e-mail. Estes dados são essenciais para a funcionalidade principal do Sincro App, permitindo a geração dos cálculos numerológicos e a criação de sua conta.</p>
                    </section>
                    
                    <section>
                        <h2 className="text-xl font-bold text-purple-300 mb-2">2. Uso de Dados</h2>
                        <p>Os dados coletados são utilizados para:</p>
                        <ul className="list-disc list-inside pl-4 mt-2 space-y-1">
                            <li>Personalizar sua experiência no aplicativo, fornecendo seus números e arquétipos diários, mensais e anuais.</li>
                            <li>Autenticar seu acesso à plataforma.</li>
                            <li>Processar pagamentos para planos Premium (através de nosso parceiro PagSeguro).</li>
                            <li>Comunicar informações importantes sobre sua conta e atualizações do serviço.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-purple-300 mb-2">3. Compartilhamento de Dados</h2>
                        <p>Não compartilhamos suas informações pessoais com terceiros, exceto quando necessário para a prestação do serviço (como com o provedor de pagamentos PagSeguro, que possui suas próprias políticas de privacidade) ou quando exigido por lei.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-purple-300 mb-2">4. Segurança dos Dados</h2>
                        <p>Utilizamos as melhores práticas de segurança e as soluções do Firebase (Google) para proteger seus dados contra acesso não autorizado, alteração, divulgação ou destruição.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-purple-300 mb-2">5. Cookies</h2>
                        <p>Nosso site utiliza cookies essenciais para o funcionamento da plataforma, como manter sua sessão de login ativa. Ao utilizar o Sincro App, você concorda com o uso desses cookies.</p>
                    </section>

                     <section>
                        <h2 className="text-xl font-bold text-purple-300 mb-2">6. Seus Direitos</h2>
                        <p>Você tem o direito de acessar, corrigir ou excluir suas informações pessoais a qualquer momento. Para fazer isso, entre em contato conosco através do e-mail: <a href="mailto:contato@sincroapp.com.br" className="text-purple-400 hover:underline">contato@sincroapp.com.br</a>.</p>
                    </section>
                </div>
                 <button onClick={onBackToHomeClick} className="mt-8 text-sm text-gray-500 hover:text-white flex items-center mx-auto">
                    <ArrowLeftIcon className="h-4 w-4 mr-2"/>Voltar para a página inicial
                </button>
            </div>
        </div>
    );
};

export default PrivacyPolicy;