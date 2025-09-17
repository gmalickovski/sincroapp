// src/components/ui/RegisterModal.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { XIcon, CheckIcon, EyeIcon, EyeOffIcon, ArrowLeftIcon } from './Icons';
import Spinner from './Spinner';

const PasswordValidator = ({ password }) => {
    const checks = {
        length: password.length >= 8, uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password), number: /[0-9]/.test(password),
        special: /[^A-Za-z0-9]/.test(password),
    };
    const Requirement = ({ met, text }) => (
        <li className={`flex items-center text-xs transition-colors ${met ? 'text-green-400' : 'text-gray-500'}`}>
            <CheckIcon className={`h-3 w-3 mr-2 ${met ? 'opacity-100' : 'opacity-50'}`} />{text}
        </li>
    );
    return (
        <div className="text-sm mt-2"><ul className="space-y-1">
            <Requirement met={checks.length} text="Mínimo de 8 caracteres" />
            <Requirement met={checks.uppercase} text="Uma letra maiúscula" />
            <Requirement met={checks.lowercase} text="Uma letra minúscula" />
            <Requirement met={checks.number} text="Um número" />
            <Requirement met={checks.special} text="Um caractere especial" />
        </ul></div>
    );
};

const RegisterModal = ({ onClose }) => {
    const [step, setStep] = useState(1);
    
    // Dados do Passo 1
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    // Dados do Passo 2
    const [nomeNascimento, setNomeNascimento] = useState('');
    const [dataNasc, setDataNasc] = useState('');

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { signupAndCreateUser } = useAuth(); // Usaremos a função unificada
    
    const allPasswordChecksMet = /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password) && password.length >= 8;
    const isStep1Valid = firstName && lastName && email && allPasswordChecksMet && agreedToTerms;

    const handleNextStep = (e) => {
        e.preventDefault();
        setError('');
        if (!isStep1Valid) {
            setError('Por favor, preencha todos os campos, crie uma senha segura e aceite os termos.');
            return;
        }
        setStep(2);
    };

    const handleFinalSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!nomeNascimento || !dataNasc) {
            setError('Por favor, preencha seus dados de nascimento.');
            return;
        }
        setIsLoading(true);
        try {
            await signupAndCreateUser({
                email, password, firstName, lastName, 
                nome: nomeNascimento, dataNasc
            });
            setStep(3); // Avança para a tela de sucesso
        } catch (err) {
            setError('Falha ao criar a conta. Verifique se o e-mail já está em uso.');
            setStep(1);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-800 text-white p-6 rounded-2xl shadow-2xl w-full max-w-md relative animate-fade-in" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:bg-gray-700 z-10"><XIcon className="h-5 w-5" /></button>
                
                {step === 1 && (
                    <div className="animate-fade-in">
                        <h2 className="text-2xl font-bold mb-4">Criar conta (Passo 1 de 2)</h2>
                        <form onSubmit={handleNextStep} className="space-y-4">
                            <div className="flex gap-4">
                                <input type="text" placeholder="Primeiro nome" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-sm" required />
                                <input type="text" placeholder="Sobrenome" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-sm" required />
                            </div>
                            <input type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-sm" required />
                            <div className="relative">
                                <input type={showPassword ? "text" : "password"} placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-sm pr-10" required />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400"><EyeIcon className="h-5 w-5" /></button>
                            </div>
                            <PasswordValidator password={password} />
                            <div className="pt-2">
                                <label className="flex items-start text-sm">
                                    <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="h-4 w-4 mt-1 rounded" />
                                    <span className="ml-2 text-gray-400">Eu aceito os <Link to="/termos-de-servico" target="_blank" className="text-purple-400">Termos</Link> e a <Link to="/politica-de-privacidade" target="_blank" className="text-purple-400">Política de Privacidade</Link>.</span>
                                </label>
                            </div>
                            {error && <p className="text-red-400 text-center text-sm">{error}</p>}
                            <button type="submit" className="w-full bg-purple-600 font-bold py-3 px-4 rounded-lg">Próximo</button>
                        </form>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-fade-in">
                        <button onClick={() => { setStep(1); setError(''); }} className="absolute top-4 left-4 p-2 rounded-full text-gray-400 hover:bg-gray-700"><ArrowLeftIcon className="h-5 w-5" /></button>
                        <h2 className="text-2xl font-bold mb-4">Dados para Análise (2 de 2)</h2>
                        <p className="text-gray-400 mb-6 text-sm">Estes dados são essenciais para os cálculos e não serão compartilhados.</p>
                        <form onSubmit={handleFinalSubmit} className="space-y-6">
                            <input type="text" placeholder="Nome completo de nascimento" value={nomeNascimento} onChange={e => setNomeNascimento(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-sm" required/>
                            <input type="date" placeholder="Data de nascimento" value={dataNasc} onChange={e => setDataNasc(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-sm" required/>
                            {error && <p className="text-red-400 text-center text-sm">{error}</p>}
                            <button type="submit" disabled={isLoading} className="w-full bg-purple-600 font-bold py-3 px-4 rounded-lg disabled:bg-gray-600">{isLoading ? <Spinner /> : 'Finalizar Cadastro'}</button>
                        </form>
                    </div>
                )}

                {step === 3 && (
                     <div className="animate-fade-in text-center">
                         <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-500 mb-4"><CheckIcon className="h-6 w-6 text-white" /></div>
                        <h2 className="text-2xl font-bold mb-2">Cadastro Realizado!</h2>
                        <p className="text-gray-400 mb-6">Um e-mail de confirmação foi enviado. Por favor, faça o login para iniciar sua jornada.</p>
                        <button onClick={onClose} className="w-full bg-purple-600 font-bold py-3 px-4 rounded-lg">Fazer Login</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RegisterModal;