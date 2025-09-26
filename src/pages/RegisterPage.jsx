// src/pages/RegisterPage.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from '../services/firebase';
import Spinner from '../components/ui/Spinner';
import { StarIcon, ArrowLeftIcon, EyeIcon, EyeOffIcon } from '../components/ui/Icons';

const RegisterPage = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError("A senha deve ter pelo menos 6 caracteres.");
            return;
        }
        if (!agreed) {
            setError("Você deve aceitar os termos e políticas para continuar.");
            return;
        }

        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, {
                displayName: `${firstName} ${lastName}`.trim()
            });
            navigate('/app'); 
        } catch (err) {
            if (err.code === 'auth/email-already-in-use') {
                setError('Este email já está cadastrado.');
            } else {
                setError('Ocorreu um erro ao criar a conta. Tente novamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 selection:bg-purple-500/30">
            <div className="w-full max-w-md">
                
                {/* ========== ALTERAÇÕES APLICADAS AQUI ========== */}
                {/* 1. O ícone foi trocado para o mesmo estilo da tela de login. */}
                {/* 2. A margem inferior (mb-8) foi aumentada para (mb-10) para descer o bloco. */}
                <div className="text-center mb-10 animate-fade-in-fast">
                    <StarIcon className="h-12 w-12 text-purple-400 mx-auto" />
                    <h1 className="text-4xl font-bold mt-4">Crie sua Conta</h1>
                    <p className="text-gray-400 mt-2">Comece sua jornada de autoconhecimento.</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-gray-800/50 border border-gray-700 p-6 sm:p-8 rounded-2xl shadow-xl space-y-5 animate-fade-in">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="w-full">
                            <label className="block text-sm font-medium text-gray-400 mb-1" htmlFor="firstName">Nome</label>
                            <input type="text" id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full bg-gray-900 border-2 border-gray-700 rounded-lg p-3 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors" required />
                        </div>
                        <div className="w-full">
                            <label className="block text-sm font-medium text-gray-400 mb-1" htmlFor="lastName">Sobrenome</label>
                            <input type="text" id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full bg-gray-900 border-2 border-gray-700 rounded-lg p-3 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors" required />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1" htmlFor="email">Email</label>
                        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-gray-900 border-2 border-gray-700 rounded-lg p-3 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1" htmlFor="password">Senha</label>
                        <div className="relative">
                            <input 
                                type={showPassword ? "text" : "password"} 
                                id="password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                className="w-full bg-gray-900 border-2 border-gray-700 rounded-lg p-3 pr-10 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors" 
                                required 
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-purple-400"
                                title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                            >
                                {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex items-start pt-2">
                        <input id="agree" type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="h-4 w-4 mt-1 bg-gray-700 border-gray-600 rounded text-purple-500 focus:ring-purple-600 focus:ring-offset-gray-800" />
                        <label htmlFor="agree" className="ml-3 text-sm text-gray-400">
                            Eu li e concordo com os <Link to="/terms-of-service" target="_blank" className="underline hover:text-purple-400">Termos de Serviço</Link> e a <Link to="/privacy-policy" target="_blank" className="underline hover:text-purple-400">Política de Privacidade</Link>.
                        </label>
                    </div>

                    {error && <p className="text-red-400 text-sm text-center !mt-4">{error}</p>}

                    <div className="pt-2">
                        <button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:bg-purple-800 flex items-center justify-center h-12">
                            {loading ? <Spinner /> : 'Criar Conta'}
                        </button>
                    </div>
                </form>

                <div className="text-center mt-6 animate-fade-in">
                    <Link to="/login" className="text-sm text-gray-500 hover:text-white flex items-center justify-center">
                        <ArrowLeftIcon className="h-4 w-4 mr-2"/>
                        Já tenho uma conta
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;