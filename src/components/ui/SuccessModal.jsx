// src/components/ui/SuccessModal.jsx

import React from 'react';

const SuccessModal = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
            <div className="bg-gray-800 text-white p-8 rounded-2xl shadow-2xl w-full max-w-md text-center" onClick={(e) => e.stopPropagation()}>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-500 mb-4">
                    <svg className="h-6 w-6 text-white" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold mb-2">Cadastro Realizado!</h2>
                <p className="text-gray-400 mb-6">
                    Um e-mail de confirmação foi enviado para sua caixa de entrada. Por favor, verifique seu e-mail para ativar sua conta.
                </p>
                <button 
                    onClick={onClose}
                    className="w-full bg-purple-600 font-bold py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                >
                    Fazer Login
                </button>
            </div>
        </div>
    );
};

export default SuccessModal;