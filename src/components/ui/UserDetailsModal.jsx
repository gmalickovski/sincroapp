// src/components/ui/UserDetailsModal.jsx

import React, { useState } from 'react';

const UserDetailsModal = ({ onSave }) => {
    const [nome, setNome] = useState('');
    const [dataNasc, setDataNasc] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Validação simples para garantir que o nome foi preenchido e a data está no formato esperado
        if(nome.trim() && dataNasc.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
            onSave({ nome, dataNasc });
        } else {
            alert('Dados inválidos. Use o formato DD/MM/AAAA para a data.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-gray-800 text-white p-8 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-2 text-purple-300">Quase lá!</h2>
                <p className="text-gray-400 mb-6">Precisamos de alguns detalhes para personalizar sua jornada.</p>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="nomeCompleto" className="block text-sm font-medium text-gray-300 mb-2">Nome Completo de Nascimento</label>
                        <input 
                            type="text" 
                            id="nomeCompleto" 
                            value={nome} 
                            onChange={(e) => setNome(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-sm text-gray-200 focus:ring-2 focus:ring-purple-500 focus:outline-none" 
                            required 
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="dataNascimento" className="block text-sm font-medium text-gray-300 mb-2">Data de Nascimento</label>
                        <input 
                            type="text" 
                            id="dataNascimento" 
                            value={dataNasc} 
                            onChange={(e) => setDataNasc(e.target.value)}
                            placeholder="DD/MM/AAAA"
                            className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-sm text-gray-200 focus:ring-2 focus:ring-purple-500 focus:outline-none" 
                            required 
                        />
                    </div>
                    <button type="submit" className="w-full bg-purple-600 font-bold py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors">
                        Calcular minha Rota
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UserDetailsModal;