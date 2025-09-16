// src/pages/LoginPage.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Spinner from '../components/ui/Spinner';
import { StarIcon, ArrowLeftIcon } from '../components/ui/Icons';

const LoginPage = () => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, signup } = useAuth();

    const handleAuthAction = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLoginView) {
                await login(email, password);
                // O redirecionamento agora é automático e gerenciado pelo App.jsx
            } else {
                if (password !== confirmPassword) {
                  throw new Error('As senhas não coincidem.');
                }
                await signup(email, password);
                // O App.jsx irá detectar o novo usuário e mostrar o modal de detalhes
            }
        } catch (err) {
            setError(err.message || 'Ocorreu um erro. Tente novamente.');
        }
        
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <StarIcon className="h-12 w-12 text-purple-400 mx-auto" />
                    <h1 className="text-3xl font-bold mt-4">SincroApp</h1>
                    <p className="text-gray-400 mt-2">{isLoginView ? 'Acesse sua conta para continuar' : 'Crie uma conta para começar sua jornada'}</p>
                </div>

                <form onSubmit={handleAuthAction} className="bg-gray-800 p-8 rounded-lg shadow-xl">
                    <div className="mb-4">
                        <label className="block text-sm font-bold mb-2 text-gray-300" htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-bold mb-2 text-gray-300" htmlFor="password">Senha</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            required
                        />
                    </div>
                    {!isLoginView && (
                        <div className="mb-6">
                            <label className="block text-sm font-bold mb-2 text-gray-300" htmlFor="confirm-password">Confirmar Senha</label>
                            <input
                                type="password"
                                id="confirm-password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                required
                            />
                        </div>
                    )}

                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                    <button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 disabled:bg-purple-800">
                        {loading ? <Spinner /> : (isLoginView ? 'Entrar' : 'Cadastrar')}
                    </button>
                    
                    {isLoginView && (
                         <div className="text-center mt-4">
                            <Link to="/esqueci-senha" className="text-sm text-gray-400 hover:text-purple-400 transition">
                                Esqueci minha senha
                            </Link>
                        </div>
                    )}
                </form>

                <p className="text-center mt-6 text-sm text-gray-400">
                    {isLoginView ? 'Não tem uma conta?' : 'Já tem uma conta?'}
                    <button onClick={() => { setIsLoginView(!isLoginView); setError(''); }} className="font-bold text-purple-400 hover:underline ml-2">
                        {isLoginView ? 'Cadastre-se' : 'Faça login'}
                    </button>
                </p>
                
                <div className="text-center">
                    <Link to="/" className="mt-8 text-sm text-gray-500 hover:text-white flex items-center justify-center">
                        <ArrowLeftIcon className="h-4 w-4 mr-2"/>Voltar
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;