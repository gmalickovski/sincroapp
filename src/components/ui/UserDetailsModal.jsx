// src/components/ui/UserDetailsModal.jsx

import React, { useState } from 'react';

function UserDetailsModal({ onSave }) {
    const [nomeAnalise, setNomeAnalise] = useState('');
    const [dataNasc, setDataNasc] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dataNasc)) {
            setError('Por favor, use o formato DD/MM/AAAA para a data.');
            return;
        }
        if (nomeAnalise && dataNasc) {
            onSave({ nomeAnalise, dataNasc });
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-800 text-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
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