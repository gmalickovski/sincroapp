import React from 'react';
import { StarIcon, ArrowLeftIcon } from '../components/ui/Icons';

const TermsOfService = ({ onBackToHomeClick }) => {
    return (
        <div className="min-h-screen bg-gray-900 text-gray-300 font-sans p-4 sm:p-6 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <StarIcon className="h-12 w-12 text-purple-400 mx-auto" />
                    <h1 className="text-3xl font-bold mt-2 text-white">Termos de Serviço</h1>
                    <p className="text-gray-400">Última atualização: 11 de setembro de 2025</p>
                </div>

                <div className="bg-gray-800/50 p-6 md:p-8 rounded-2xl border border-gray-700 space-y-6">
                    <section>
                        <h2 className="text-xl font-bold text-purple-300 mb-2">1. Aceitação dos Termos</h2>
                        <p>Ao se cadastrar e utilizar o Sincro App, você concorda em cumprir estes Termos de Serviço e nossa Política de Privacidade. Se você não concordar com estes termos, não utilize o aplicativo.</p>
                    </section>
                    
                    <section>
                        <h2 className="text-xl font-bold text-purple-300 mb-2">2. Uso do Serviço</h2>
                        <p>O Sincro App oferece um plano gratuito com funcionalidades limitadas e um plano Premium com acesso a todos os recursos. Você concorda em usar o serviço apenas para fins legais e de autoconhecimento, e não para qualquer atividade ilegal ou prejudicial.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-purple-300 mb-2">3. Contas e Segurança</h2>
                        <p>Você é responsável por manter a confidencialidade de sua senha e conta. Qualquer atividade que ocorra sob sua conta é de sua responsabilidade.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-purple-300 mb-2">4. Pagamentos e Assinaturas</h2>
                        <p>O acesso ao plano Premium é concedido após a confirmação do pagamento através do nosso parceiro, PagSeguro. Os detalhes sobre valores e formas de pagamento estarão disponíveis na página de upgrade.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-purple-300 mb-2">5. Propriedade Intelectual</h2>
                        <p>Todo o conteúdo, design e tecnologia do SincroApp são de nossa propriedade. Você não pode copiar, modificar ou distribuir nosso conteúdo sem permissão explícita.</p>
                    </section>

                     <section>
                        <h2 className="text-xl font-bold text-purple-300 mb-2">6. Rescisão</h2>
                        <p>Nós nos reservamos o direito de suspender ou encerrar sua conta a qualquer momento, por qualquer motivo, incluindo a violação destes Termos.</p>
                    </section>
                </div>
                 <button onClick={onBackToHomeClick} className="mt-8 text-sm text-gray-500 hover:text-white flex items-center mx-auto">
                    <ArrowLeftIcon className="h-4 w-4 mr-2"/>Voltar para a página inicial
                </button>
            </div>
        </div>
    );
};

export default TermsOfService;