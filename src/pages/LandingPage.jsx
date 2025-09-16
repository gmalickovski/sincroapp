import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="bg-gray-50 text-gray-800">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white bg-opacity-80 backdrop-blur-md shadow-sm z-50">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">Sincro App</h1>
          <div className="flex items-center space-x-4">
            <a href="#features" className="text-gray-600 hover:text-indigo-600">Funcionalidades</a>
            <a href="#pricing" className="text-gray-600 hover:text-indigo-600">Planos</a>
            <Link to="/login" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition">
              Acessar
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-20">
        {/* Hero Section */}
        <section className="text-center py-20 px-6 bg-white">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900">
            Navegue pela vida com propósito e clareza.
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            O Sincro App traduz a sabedoria da numerologia em uma bússola diária para suas decisões, metas e autoconhecimento. Sincronize suas ações com a sua energia.
          </p>
          <Link to="/login" className="bg-green-500 text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-green-600 transition shadow-lg">
            Comece sua jornada gratuitamente
          </Link>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-6">
          <div className="container mx-auto">
            <h3 className="text-3xl font-bold text-center mb-12">Ferramentas para sua Evolução</h3>
            <div className="grid md:grid-cols-3 gap-10">
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <img src="/images/dashboard.png" alt="Dashboard Diário" className="w-full h-48 object-cover rounded-md mb-6 ring-1 ring-gray-200" />
                <h4 className="text-xl font-semibold mb-2">Sua Rota de Hoje</h4>
                <p className="text-gray-600">Receba orientações diárias baseadas na energia do dia. Saiba o que potencializar e o que evitar para fluir com mais facilidade.</p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <img src="/images/calendar.png" alt="Calendário de Oportunidades" className="w-full h-48 object-cover rounded-md mb-6 ring-1 ring-gray-200" />
                <h4 className="text-xl font-semibold mb-2">Calendário de Oportunidades</h4>
                <p className="text-gray-600">Planeje suas metas e intenções. O Sincro App revela os melhores dias para iniciar projetos, tomar decisões importantes e agir.</p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <img src="/images/journal.png" alt="Diário de Bordo" className="w-full h-48 object-cover rounded-md mb-6 ring-1 ring-gray-200" />
                <h4 className="text-xl font-semibold mb-2">Diário de Bordo Inteligente</h4>
                <p className="text-gray-600">Registre seus insights e acompanhe sua jornada. Descubra padrões em seus ciclos e acelere seu processo de autoconhecimento.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 px-6 bg-white">
          <div className="container mx-auto">
            <h3 className="text-3xl font-bold text-center mb-4">Escolha o plano que sincroniza com você</h3>
            <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">Comece gratuitamente e evolua para o Premium quando sentir o chamado para aprofundar.</p>
            <div className="flex flex-col md:flex-row justify-center items-stretch gap-8">
              {/* Free Plan */}
              <div className="border border-gray-200 rounded-lg p-8 w-full md:w-1/3 flex flex-col">
                <h4 className="text-2xl font-semibold mb-2">Gratuito</h4>
                <p className="text-gray-500 mb-6">O essencial para começar.</p>
                <p className="text-4xl font-bold mb-6">R$0</p>
                <ul className="space-y-4 mb-8 flex-grow">
                  <li className="flex items-center"><CheckCircle className="text-green-500 mr-3" /> Dashboard do dia atual</li>
                  <li className="flex items-center"><CheckCircle className="text-green-500 mr-3" /> Diário de Bordo (limite de 5 notas)</li>
                  <li className="flex items-center"><CheckCircle className="text-green-500 mr-3" /> Análise do Arcano do Dia</li>
                </ul>
                <Link to="/login" className="w-full text-center bg-gray-200 text-gray-800 px-6 py-3 rounded-md font-semibold hover:bg-gray-300 transition">
                  Começar Agora
                </Link>
              </div>
              {/* Premium Plan */}
              <div className="border-2 border-indigo-600 rounded-lg p-8 w-full md:w-1/3 relative flex flex-col shadow-lg">
                <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full absolute -top-4 left-1/2 -translate-x-1/2">MAIS POPULAR</span>
                <h4 className="text-2xl font-semibold mb-2 text-indigo-600">Premium</h4>
                <p className="text-gray-500 mb-6">Acesse todo o potencial.</p>
                <p className="text-4xl font-bold mb-6">R$19,90<span className="text-lg font-normal text-gray-500">/mês</span></p>
                <ul className="space-y-4 mb-8 flex-grow">
                  <li className="flex items-center"><CheckCircle className="text-green-500 mr-3" /> Tudo do plano Gratuito, e mais:</li>
                  <li className="flex items-center font-semibold"><CheckCircle className="text-green-500 mr-3" /> Anotações e tarefas ilimitadas</li>
                  <li className="flex items-center font-semibold"><CheckCircle className="text-green-500 mr-3" /> Calendário de Oportunidades completo</li>
                  <li className="flex items-center font-semibold"><CheckCircle className="text-green-500 mr-3" /> Planejador de Metas e Intenções</li>
                  <li className="flex items-center font-semibold"><CheckCircle className="text-green-500 mr-3" /> Relatórios de Ciclos Pessoais</li>
                </ul>
                <Link to="/login" className="w-full text-center bg-indigo-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-indigo-700 transition">
                  Desbloquear Premium
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 px-6">
        <div className="container mx-auto text-center">
          <p>&copy; 2025 Sincro App por Studio MLK. Todos os direitos reservados.</p>
          <div className="mt-4 space-x-6">
            <Link to="/privacy-policy" className="text-gray-400 hover:text-white">Política de Privacidade</Link>
            <Link to="/terms-of-service" className="text-gray-400 hover:text-white">Termos de Serviço</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;