// Arquivo: src/components/ui/SuccessModal.jsx

import React from 'react';
import { CheckIcon } from './Icons'; // CORREÇÃO 1: Importando o ícone correto pelo nome

const SuccessModal = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-500 mb-4">
                    {/* CORREÇÃO 2: Usando o componente importado diretamente */}
                    <CheckIcon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Cadastro Realizado!</h3>
                <p className="text-gray-400 mb-6">
                    Enviamos um e-mail de confirmação para você. Por favor, verifique sua caixa de entrada e clique no link para ativar sua conta.
                </p>
                <button
                    onClick={onClose}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-md"
                >
                    Entendido, ir para o Login
                </button>
            </div>
        </div>
    );
};

export default SuccessModal;