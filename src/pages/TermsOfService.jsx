import React from 'react';
import { Link } from 'react-router-dom';

const TermsOfService = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-md rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Termos de Serviço</h1>
          <p className="text-gray-600 mb-4"><strong>Última atualização:</strong> 16 de setembro de 2025</p>

          <p className="text-gray-700 mb-6">
            Estes Termos de Serviço ("Termos") governam o seu uso do aplicativo Sincro App ("Serviço"), operado por <strong>Studio MLK</strong> ("nós", "nosso").
          </p>

          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">1. Aceitação dos Termos</h2>
          <p className="text-gray-700 mb-6">
            Ao se cadastrar ou usar nosso Serviço, você concorda em cumprir estes Termos. Se você não concordar com qualquer parte dos termos, não poderá acessar o Serviço.
          </p>

          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">2. Contas</h2>
          <p className="text-gray-700 mb-6">
            Você é responsável por manter a confidencialidade de sua conta e senha. Você concorda em aceitar a responsabilidade por todas as atividades que ocorram em sua conta.
          </p>

          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">3. Planos e Pagamentos</h2>
          <p className="text-gray-700 mb-4">
            O Sincro App oferece um plano gratuito e um plano pago ("Premium").
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
            <li><strong>Plano Gratuito:</strong> Acesso a funcionalidades limitadas do Serviço.</li>
            <li><strong>Plano Premium:</strong> Acesso a todas as funcionalidades mediante pagamento. Os pagamentos são processados através do PagSeguro, vinculado à conta de Guilherme Malickovski Correa (CPF: 025.559.230-20), em nome do Studio MLK.</li>
            <li><strong>Alterações de Preço:</strong> Reservamo-nos o direito de ajustar os preços dos planos. Quaisquer alterações de preço entrarão em vigor após notificação prévia.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">4. Propriedade Intelectual</h2>
          <p className="text-gray-700 mb-6">
            O Serviço e seu conteúdo original, recursos e funcionalidades são e permanecerão propriedade exclusiva do Studio MLK.
          </p>

          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">5. Rescisão</h2>
          <p className="text-gray-700 mb-6">
            Podemos rescindir ou suspender sua conta imediatamente, sem aviso prévio ou responsabilidade, por qualquer motivo, incluindo, sem limitação, se você violar os Termos.
          </p>
          
          <div className="mt-10 text-center">
            <Link to="/" className="text-indigo-600 hover:text-indigo-800 font-semibold">
              &larr; Voltar para a página inicial
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;