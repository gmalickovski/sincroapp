import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-md rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Política de Privacidade</h1>

          <p className="text-gray-600 mb-4"><strong>Última atualização:</strong> 16 de setembro de 2025</p>

          <p className="text-gray-700 mb-6">
            Bem-vindo à Política de Privacidade do Sincro App. Nós, do <strong>Studio MLK</strong>, levamos a sua privacidade a sério. Este documento explica quais dados pessoais coletamos, como os usamos e quais são os seus direitos.
          </p>

          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">1. Responsável pelo Tratamento dos Dados</h2>
          <p className="text-gray-700 mb-6">
            O Sincro App é um serviço oferecido por <strong>Studio MLK</strong>. Para fins de conformidade com a Lei Geral de Proteção de Dados (LGPD), o responsável pelo tratamento dos dados é:
            <br />
            <strong>Nome:</strong> Guilherme Malickovski Correa
            <br />
            <strong>CPF:</strong> 025.559.230-20
          </p>

          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">2. Dados que Coletamos</h2>
          <p className="text-gray-700 mb-4">
            Coletamos as seguintes informações para fornecer e melhorar nossos serviços:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
            <li><strong>Informações de Cadastro:</strong> Nome, endereço de e-mail e data de nascimento.</li>
            <li><strong>Dados de Uso:</strong> Anotações no diário, metas, intenções e interações com a plataforma.</li>
            <li><strong>Dados de Pagamento:</strong> Para usuários do plano Premium, as informações de pagamento são processadas diretamente pelo nosso parceiro PagSeguro e não são armazenadas em nossos servidores.</li>
            <li><strong>Cookies e Tecnologias Semelhantes:</strong> Usamos cookies para manter sua sessão ativa e entender como você usa o Sincro App.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">3. Como Usamos Seus Dados</h2>
          <p className="text-gray-700 mb-6">
            Seus dados são usados para:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
            <li>Personalizar sua experiência no aplicativo, como o cálculo da sua numerologia diária.</li>
            <li>Processar transações e gerenciar sua assinatura.</li>
            <li>Comunicar sobre atualizações, ofertas e novidades.</li>
            <li>Garantir a segurança da sua conta e da plataforma.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">4. Compartilhamento de Dados</h2>
          <p className="text-gray-700 mb-6">
            Não compartilhamos suas informações pessoais com terceiros, exceto quando necessário para a operação do serviço (ex: provedor de pagamentos PagSeguro) ou se exigido por lei.
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

export default PrivacyPolicy;