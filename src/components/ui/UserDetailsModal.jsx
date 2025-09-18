// src/components/ui/UserDetailsModal.jsx

import React, { useState } from 'react';

// O Modal para coletar informações essenciais do usuário após o primeiro login.
function UserDetailsModal({ onSave }) {
    const [nome, setNome] = useState('');
    const [dataNasc, setDataNasc] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError(''); // Limpa erros anteriores

        // Validação simples para o formato da data
        const datePattern = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
        if (!datePattern.test(dataNasc)) {
            setError('Por favor, insira a data no formato DD/MM/AAAA.');
            return;
        }

        if (nome && dataNasc) {
            onSave({ nome, dataNasc });
        }
    };

    return (
        // Fundo escuro que cobre a tela inteira
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            {/* Conteúdo do Modal */}
            <div className="bg-gray-800 text-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
                <h2 className="text-2xl font-bold text-center mb-2 text-purple-300">Só mais um passo!</h2>
                <p className="text-center text-gray-400 mb-6">Para personalizar sua jornada e calcular sua rota numerológica, precisamos de alguns detalhes.</p>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="nome" className="block text-sm font-medium text-gray-300 mb-2">
                            Seu nome completo de nascimento
                        </label>
                        <input
                            type="text"
                            id="nome"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Ex: Maria da Silva"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">Exatamente como está na sua certidão de nascimento.</p>
                    </div>
                    <div className="mb-6">
                        <label htmlFor="dataNasc" className="block text-sm font-medium text-gray-300 mb-2">
                            Data de Nascimento
                        </label>
                        {/* CAMPO ALTERADO PARA TEXTO CONFORME SOLICITADO */}
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

                    {/* Exibe a mensagem de erro, se houver */}
                    {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}

                    <button
                        type="submit"
                        className="w-full bg-purple-600 font-bold py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        Salvar e Iniciar Jornada
                    </button>
                </form>
            </div>
        </div>
    );
}

export default UserDetailsModal;
