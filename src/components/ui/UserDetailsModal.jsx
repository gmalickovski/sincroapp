import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import Spinner from './Spinner'; // Usaremos o spinner para a tela de carregamento
import { StarIcon } from './Icons'; // Um ícone para dar um toque especial

const UserDetailsModal = () => {
    const { handleSaveUserDetails } = useAppContext();
    const [step, setStep] = useState(1); // Novo estado para controlar os passos do wizard

    // Estados existentes para o formulário
    const [nomeAnalise, setNomeAnalise] = useState('');
    const [dataNasc, setDataNasc] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dataNasc)) {
            setError('Por favor, use o formato DD/MM/AAAA para a data.');
            return;
        }
        if (nomeAnalise && dataNasc) {
            // Passo 3: Mostra a tela de "Calculando..."
            setStep(3);
            // A função de salvar é chamada em seguida. O modal fechará automaticamente 
            // quando o AppContext detectar os novos dados do usuário.
            await handleSaveUserDetails({ nomeAnalise, dataNasc });
        }
    };

    // Renderiza o conteúdo do passo atual
    const renderStepContent = () => {
        switch (step) {
            // PASSO 1: Boas-vindas
            case 1:
                return (
                    <div className="text-center animate-fade-in">
                        <h2 className="text-3xl font-bold text-purple-300 mb-4">Bem-vindo(a) ao SincroApp!</h2>
                        <p className="text-gray-300 mb-4">Sua jornada de autoconhecimento começa agora.</p>
                        <p className="text-gray-400 text-sm mb-8">Para calcularmos sua rota numerológica pessoal, precisamos de apenas duas informações: seu nome completo de nascimento e sua data de nascimento.</p>
                        <button
                            onClick={() => setStep(2)}
                            className="w-full bg-purple-600 font-bold py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            Começar
                        </button>
                    </div>
                );

            // PASSO 2: Formulário de Coleta
            case 2:
                return (
                    <div className="animate-fade-in">
                        <h2 className="text-2xl font-bold text-center mb-2 text-purple-300">Só mais um passo!</h2>
                        <p className="text-center text-gray-400 mb-6">Para personalizar sua jornada, precisamos do seu nome completo de nascimento.</p>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label htmlFor="nome" className="block text-sm font-medium text-gray-300 mb-2">
                                    Seu nome completo de nascimento
                                </label>
                                <input
                                    type="text"
                                    id="nome"
                                    value={nomeAnalise}
                                    onChange={(e) => setNomeAnalise(e.target.value)}
                                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Ex: Maria da Silva"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">Exatamente como está na sua certidão.</p>
                            </div>
                            <div className="mb-6">
                                <label htmlFor="dataNasc" className="block text-sm font-medium text-gray-300 mb-2">
                                    Data de Nascimento
                                </label>
                                <input
                                    type="text"
                                    id="dataNasc"
                                    value={dataNasc}
                                    onChange={(e) => setDataNasc(e.target.value)}
                                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="DD/MM/AAAA"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">Use o formato dia/mês/ano.</p>
                            </div>
                            {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
                            <div className="flex items-center gap-4">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="w-1/3 bg-gray-600 font-bold py-3 px-4 rounded-lg hover:bg-gray-500 transition-colors"
                                >
                                    Voltar
                                </button>
                                <button
                                    type="submit"
                                    className="w-2/3 bg-purple-600 font-bold py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                    Iniciar Jornada
                                </button>
                            </div>
                        </form>
                    </div>
                );

            // PASSO 3: Tela de "Calculando..."
            case 3:
                return (
                    <div className="text-center animate-fade-in flex flex-col items-center justify-center h-48">
                        <Spinner />
                        <StarIcon className="w-8 h-8 text-yellow-400 my-4 animate-pulse" />
                        <h2 className="text-xl font-bold text-purple-300">Calculando sua rota...</h2>
                        <p className="text-gray-400 text-sm mt-2">Estamos alinhando os números para você.</p>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-800 text-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4 transition-all duration-300">
                {renderStepContent()}
            </div>
        </div>
    );
};

export default UserDetailsModal;