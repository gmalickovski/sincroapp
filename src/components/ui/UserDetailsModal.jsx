// src/components/ui/UserDetailsModal.jsx

import React, { useState } from 'react';
import Spinner from './Spinner';

const UserDetailsModal = ({ onSave }) => {
    const [nome, setNome] = useState('');
    const [dataNasc, setDataNasc] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!nome || !dataNasc) {
            setError('Por favor, preencha todos os campos.');
            return;
        }
        setIsLoading(true);
        setError('');
        onSave({ nome, dataNasc }).catch(() => {
            setError('Ocorreu um erro ao salvar. Tente novamente.');
            setIsLoading(false);
        });
    };

    return (
        <div className="fixed inset-0 bg-gray-900 text-white flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-md bg-gray-800 p-8 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-bold mb-2">Quase lá!</h2>
                <p className="text-gray-400 mb-6">Para calcularmos sua numerologia, precisamos de mais algumas informações.</p>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Seu nome completo de nascimento</label>
                        <input
                            type="text"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-sm"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Sua data de nascimento</label>
                        <input
                            type="date"
                            value={dataNasc}
                            onChange={(e) => setDataNasc(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-sm"
                            required
                        />
                    </div>
                    {error && <p className="text-red-400 text-center text-sm">{error}</p>}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-purple-600 font-bold py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-500"
                    >
                        {isLoading ? <Spinner /> : 'Salvar e Sincronizar'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UserDetailsModal;