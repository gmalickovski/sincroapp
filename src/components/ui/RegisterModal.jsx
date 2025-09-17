import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import * as Icons from './Icons';

const RegisterModal = ({ onClose }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        nomeNascimento: '',
        dataNasc: '',
        termsAccepted: false,
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signupAndCreateUser } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // --- Validação em Tempo Real ---
    const isStep1Valid = useMemo(() => {
        return (
            formData.firstName.trim() !== '' &&
            formData.lastName.trim() !== '' &&
            formData.email.trim() !== '' &&
            formData.password.length >= 6 &&
            formData.password === formData.confirmPassword &&
            formData.termsAccepted
        );
    }, [formData]);

    const isStep2Valid = useMemo(() => {
        return (
            formData.nomeNascimento.trim() !== '' &&
            formData.dataNasc.match(/^\d{2}\/\d{2}\/\d{4}$/)
        );
    }, [formData]);
    // --- Fim da Validação ---

    const handleNextStep = (e) => {
        e.preventDefault();
        setError('');
        if (formData.password !== formData.confirmPassword) {
            setError('As senhas não conferem.');
            return;
        }
        if (formData.password.length < 6) {
            setError('A senha deve ter no mínimo 6 caracteres.');
            return;
        }
        if (!formData.termsAccepted) {
            setError('Você precisa aceitar os termos e políticas para continuar.');
            return;
        }
        setStep(2);
    };

    const handleFinalSubmit = async (e) => {
        e.preventDefault();
        if (!isStep2Valid) return;

        setLoading(true);
        setError('');
        try {
            await signupAndCreateUser(formData);
            setStep(3);
        } catch (err) {
            if (err.code === 'auth/email-already-in-use') {
                setError('Este e-mail já está em uso. Tente outro.');
            } else {
                setError('Ocorreu um erro ao criar a conta. Tente novamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoToLogin = () => {
        onClose();
        navigate('/login');
    };

    const renderStep1 = () => (
        <form onSubmit={handleNextStep}>
            <h2 className="text-2xl font-bold mb-2 text-purple-300">Crie sua Conta</h2>
            <p className="text-gray-400 mb-6">Comece sua jornada de autoconhecimento.</p>
            {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}
            
            <div className="flex gap-4 mb-4">
                <input type="text" name="firstName" placeholder="Nome" value={formData.firstName} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-sm focus:ring-purple-500" />
                <input type="text" name="lastName" placeholder="Sobrenome" value={formData.lastName} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-sm focus:ring-purple-500" />
            </div>
            <input type="email" name="email" placeholder="E-mail" value={formData.email} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-sm mb-4 focus:ring-purple-500" />
            <input type="password" name="password" placeholder="Senha (mínimo 6 caracteres)" value={formData.password} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-sm mb-4 focus:ring-purple-500" />
            <input type="password" name="confirmPassword" placeholder="Confirmar Senha" value={formData.confirmPassword} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-sm mb-4 focus:ring-purple-500" />
            
            {/* --- Novo Campo de Consentimento --- */}
            <div className="flex items-start mb-6">
                <input id="terms" name="termsAccepted" type="checkbox" checked={formData.termsAccepted} onChange={handleChange} className="h-4 w-4 mt-1 rounded border-gray-500 bg-gray-700 text-purple-600 focus:ring-purple-500" />
                <label htmlFor="terms" className="ml-3 text-sm text-gray-400">
                    Eu li e concordo com os <Link to="/terms" target="_blank" className="font-medium text-purple-400 hover:underline">Termos de Serviço</Link> e a <Link to="/privacy" target="_blank" className="font-medium text-purple-400 hover:underline">Política de Privacidade</Link>.
                </label>
            </div>
            
            <button type="submit" disabled={!isStep1Valid} className="w-full bg-purple-600 font-bold py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">
                Avançar
            </button>
        </form>
    );

    const renderStep2 = () => (
        <form onSubmit={handleFinalSubmit}>
            <h2 className="text-2xl font-bold mb-2 text-purple-300">Quase lá!</h2>
            <p className="text-gray-400 mb-6">Estes dados são essenciais para sua análise.</p>
            {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}
            <div className="mb-4">
                <label htmlFor="nomeNascimento" className="block text-sm font-medium text-gray-300 mb-2">Nome Completo de Nascimento</label>
                <input type="text" name="nomeNascimento" id="nomeNascimento" value={formData.nomeNascimento} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-sm focus:ring-purple-500" />
            </div>
            <div className="mb-6">
                <label htmlFor="dataNasc" className="block text-sm font-medium text-gray-300 mb-2">Data de Nascimento</label>
                <input type="text" name="dataNasc" id="dataNasc" value={formData.dataNasc} onChange={handleChange} placeholder="DD/MM/AAAA" className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-sm focus:ring-purple-500" />
            </div>
            <button type="submit" disabled={!isStep2Valid || loading} className="w-full bg-purple-600 font-bold py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">
                {loading ? 'Finalizando...' : 'Finalizar Cadastro'}
            </button>
             <button type="button" onClick={() => setStep(1)} className="w-full mt-2 text-gray-400 hover:text-white">Voltar</button>
        </form>
    );

    const renderStep3 = () => (
        <div className="text-center">
            <Icons.check className="mx-auto h-16 w-16 text-green-400" />
            <h2 className="text-2xl font-bold mt-4 mb-2 text-white">Cadastro Realizado!</h2>
            <p className="text-gray-400 mb-6">Sua conta foi criada com sucesso. Enviamos um link de verificação para o seu e-mail.</p>
            <button onClick={handleGoToLogin} className="w-full bg-purple-600 font-bold py-3 rounded-lg hover:bg-purple-700 transition-colors">
                Ir para o Login
            </button>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-gray-800 text-white p-8 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-md" onClick={e => e.stopPropagation()}>
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
            </div>
        </div>
    );
};

export default RegisterModal;
