import React from 'react';
import DashboardCard from '../components/ui/DashboardCard';
import { StarIcon, BookIcon } from '../components/ui/Icons';
import { textosDescritivos, textosArcanos, bussolaAtividades } from '../data/content';
import Spinner from '../components/ui/Spinner';

// Componente reutilizável para o Tooltip
const Tooltip = ({ text, children }) => (
    <div className="relative group flex items-center">
        {children}
        <div className="absolute bottom-full mb-2 w-max max-w-xs p-3 text-xs bg-gray-900 border border-gray-700 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            {text}
        </div>
    </div>
);

function Dashboard({ data }) {
    if (!data || !data.estruturas) {
        return <div className="p-6 text-white flex justify-center items-center h-full"><Spinner /></div>;
    }
    
    // Pega os números calculados do objeto 'data'
    const diaPessoal = data.numeros?.diaPessoal || 'default';
    const arcanoRegente = data.estruturas.arcanoRegente;
    const arcanoAtual = data.estruturas.arcanoAtual?.numero;
    
    // Busca os textos correspondentes usando os números como chave
    const infoDia = textosDescritivos.diaPessoal[diaPessoal] || textosDescritivos.diaPessoal.default;
    const infoArcanoRegente = textosArcanos[arcanoRegente] || textosArcanos.default;
    const infoArcanoAtual = textosArcanos[arcanoAtual] || textosArcanos.default;
    const atividadesDoDia = bussolaAtividades[diaPessoal] || bussolaAtividades.default;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6 animate-fade-in text-gray-300">
            {/* Coluna Principal */}
            <div className="lg:col-span-2 xl:col-span-3 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Card do Arcano Regente */}
                    <DashboardCard title={
                        <Tooltip text={"Seu arcano fundamental, derivado do seu nome de nascimento."}>
                            <span>Arcano Regente</span>
                            <span className="ml-2 h-4 w-4 flex items-center justify-center text-xs bg-gray-600 rounded-full text-white cursor-help">?</span>
                        </Tooltip>
                    }>
                        <div className="flex items-center">
                            <div className="flex-shrink-0 w-24 h-36 bg-gray-700/50 border border-gray-600 rounded-lg flex items-center justify-center mr-6">
                                <span className="text-5xl font-bold text-purple-300">{arcanoRegente || '?'}</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-lg">
                                    {/* CORREÇÃO: Exibe o nome tradicional se existir, senão o nome padrão */}
                                    {infoArcanoRegente.nomeTradicional || infoArcanoRegente.nome}
                                </h4>
                                <p className="mt-2 text-sm text-gray-400">
                                    {/* CORREÇÃO: Puxa a descrição dinâmica */}
                                    {infoArcanoRegente.descricao}
                                </p>
                            </div>
                        </div>
                    </DashboardCard>

                    {/* Card do Arcano Vigente */}
                    <DashboardCard title={
                         <Tooltip text={"A energia que te influencia neste ciclo de vida atual."}>
                            <span>Arcano Vigente</span>
                             <span className="ml-2 h-4 w-4 flex items-center justify-center text-xs bg-gray-600 rounded-full text-white cursor-help">?</span>
                        </Tooltip>
                    }>
                        <div className="flex items-center">
                            <div className="flex-shrink-0 w-24 h-36 bg-gray-700/50 border border-gray-600 rounded-lg flex items-center justify-center mr-6">
                                <span className="text-5xl font-bold text-purple-300">{arcanoAtual || '?'}</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-lg">
                                    {/* CORREÇÃO: Exibe o nome tradicional se existir, senão o nome padrão */}
                                    {infoArcanoAtual.nomeTradicional || infoArcanoAtual.nome}
                                </h4>
                                <p className="mt-2 text-sm text-gray-400">
                                    {/* CORREÇÃO: Puxa a descrição dinâmica */}
                                    {infoArcanoAtual.descricao}
                                </p>
                            </div>
                        </div>
                    </DashboardCard>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Card da Energia do Dia (sem alterações) */}
                    <DashboardCard title="Energia do Dia" icon={<StarIcon />}>
                        <h4 className="font-bold text-white text-lg">Dia Pessoal {diaPessoal}: {infoDia.titulo}</h4>
                        <p className="mt-2 text-sm text-gray-400">{infoDia.desc}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            {infoDia.tags.map(tag => (
                                <span key={tag} className="bg-purple-500/30 text-purple-300 text-xs font-semibold px-3 py-1 rounded-full">{tag}</span>
                            ))}
                        </div>
                    </DashboardCard>
                    
                    {/* Card da Bússola de Atividades (sem alterações) */}
                    <DashboardCard title="Bússola de Atividades" icon={<StarIcon />}>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-bold text-green-400 mb-2">Potencializar</h4>
                                <ul className="list-disc list-inside space-y-2 text-sm text-gray-400">
                                    {atividadesDoDia.potencializar.map((item, index) => (
                                        <li key={`pot-${index}`}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold text-red-400 mb-2">Atenção</h4>
                                <ul className="list-disc list-inside space-y-2 text-sm text-gray-400">
                                    {atividadesDoDia.atencao.map((item, index) => (
                                        <li key={`atn-${index}`}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </DashboardCard>
                </div>
            </div>

            {/* Coluna Lateral (sem alterações) */}
            <div className="lg:col-span-1 xl:col-span-1 space-y-6">
                 <DashboardCard title="Diário de Bordo Rápido" icon={<BookIcon />} className="h-full flex flex-col">
                    <p className="text-sm text-gray-400 mb-3">Algum insight sobre a energia de hoje? Anote aqui!</p>
                    <textarea 
                        className="w-full flex-1 bg-gray-900 border border-gray-600 rounded-lg p-3 text-sm text-gray-200 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all" 
                        placeholder="Digite suas reflexões..."
                    ></textarea>
                    <button className="mt-4 w-full bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
                        Salvar Anotação
                    </button>
                </DashboardCard>
            </div>
        </div>
    );
}

export default Dashboard;