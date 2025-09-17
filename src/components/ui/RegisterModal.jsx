// Arquivo: src/components/ui/RegisterModal.jsx

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { XIcon } from './Icons'; // CORREÇÃO 1: Importando o ícone correto pelo nome
import Spinner from './Spinner';
import SuccessModal from './SuccessModal';

const RegisterModal = ({ onClose }) => {
    // ... todo o resto do seu código permanece exatamente o mesmo ...
    const { signupAndCreateUser } = useAuth();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        nomeNascimento: '',
        dataNasc: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const isStep1Valid =
        formData.firstName &&
        formData.lastName &&
        formData.email &&
        formData.password &&
        formData.password.length >= 6 &&
        formData.password === formData.confirmPassword;

    const isStep2Valid = formData.nomeNascimento && formData.dataNasc;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleNext = (e) => {
        e.preventDefault();
        if (isStep1Valid) {
            setError('');
            setStep(2);
        } else {
            if (formData.password.length < 6) {
                setError('A senha deve ter pelo menos 6 caracteres.');
            } else if (formData.password !== formData.confirmPassword) {
                setError('As senhas não coincidem.');
            } else {
                setError('Por favor, preencha todos os campos corretamente.');
            }
        }
    };

    const handleFinalSubmit = async (e) => {
        e.preventDefault();
        if (!isStep2Valid) {
            setError('Por favor, preencha seu nome completo e data de nascimento.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await signupAndCreateUser(formData);
            setStep(3);
        } catch (err) {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                setError('Este e-mail já está em uso. Tente fazer login.');
            } else {
                setError('Ocorreu um erro ao criar a conta. Tente novamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    const renderStep1 = () => (
        <form onSubmit={handleNext}>
            <h2 className="text-2xl font-bold text-center mb-6">Crie sua Conta</h2>
            {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <input type="text" name="firstName" placeholder="Nome" value={formData.firstName} onChange={handleChange} className="bg-gray-700 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-purple-500" />
                <input type="text" name="lastName" placeholder="Sobrenome" value={formData.lastName} onChange={handleChange} className="bg-gray-700 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <input type="email" name="email" placeholder="E-mail" value={formData.email} onChange={handleChange} className="bg-gray-700 p-3 rounded-md w-full mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500" />
            <input type="password" name="password" placeholder="Senha" value={formData.password} onChange={handleChange} className="bg-gray-700 p-3 rounded-md w-full mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500" />
            <input type="password" name="confirmPassword" placeholder="Confirmar Senha" value={formData.confirmPassword} onChange={handleChange} className="bg-gray-700 p-3 rounded-md w-full mb-6 focus:outline-none focus:ring-2 focus:ring-purple-500" />
            <button type="submit" disabled={!isStep1Valid || loading} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-md disabled:bg-gray-500 flex justify-center items-center">
                {loading ? <Spinner /> : 'Próximo'}
            </button>
        </form>
    );

    const renderStep2 = () => (
        <form onSubmit={handleFinalSubmit}>
            <h2 className="text-2xl font-bold text-center mb-2">Dados para Análise</h2>
            <p className="text-center text-gray-400 mb-6">Essas informações são essenciais para os cálculos.</p>
            {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
            <input type="text" name="nomeNascimento" placeholder="Nome Completo de Nascimento" value={formData.nomeNascimento} onChange={handleChange} className="bg-gray-700 p-3 rounded-md w-full mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500" />
            <input type="date" name="dataNasc" placeholder="Data de Nascimento" value={formData.dataNasc} onChange={handleChange} className="bg-gray-700 p-3 rounded-md w-full mb-6 focus:outline-none focus:ring-2 focus:ring-purple-500" />
            <div className="flex gap-4">
                <button type="button" onClick={() => setStep(1)} className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-md">
                    Voltar
                </button>
                <button type="submit" disabled={!isStep2Valid || loading} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-md disabled:bg-gray-500 flex justify-center items-center">
                    {loading ? <Spinner /> : 'Finalizar Cadastro'}
                </button>
            </div>
        </form>
    );

    const renderStep3 = () => (
        <SuccessModal onClose={onClose} />
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    {/* CORREÇÃO 2: Usando o componente importado diretamente */}
                    <XIcon className="h-6 w-6" />
                </button>
                
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
                
            </div>
        </div>
    );
};

export default RegisterModal;