// src/pages/LoginPage.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { StarIcon, ArrowLeftIcon } from '../components/ui/Icons';
import Spinner from '../components/ui/Spinner';
import RegisterModal from '../components/ui/RegisterModal'; // Importamos o modal principal

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setIsLoading(true);
        try { await login(email, password); } 
        catch (err) { setError('Email ou senha inválidos.'); } 
        finally { setIsLoading(false); }
    };

    return (
        <>
            {isRegisterModalOpen && <RegisterModal onClose={() => setIsRegisterModalOpen(false)} />}
            
            <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center p-4 relative">
                <Link to="/" className="absolute top-6 left-6 flex items-center gap-2 text-purple-400 hover:text-purple-300">
                    <ArrowLeftIcon className="h-5 w-5" /><span>Voltar para o Início</span>
                </Link>
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <Link to="/" className="inline-flex items-center gap-2"><StarIcon className="h-10 w-10 text-purple-400" /><h1 className="text-3xl font-bold">SincroApp</h1></Link>
                        <h2 className="mt-4 text-2xl text-gray-300">Bem-vindo de volta!</h2>
                    </div>
                    <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8 shadow-lg">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-sm" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Senha</label>
                                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-sm" required />
                            </div>
                            <div className="text-right text-sm"><Link to="/esqueci-senha" className="text-purple-400 hover:underline">Esqueceu a senha?</Link></div>
                            {error && <p className="text-red-400 text-center text-sm">{error}</p>}
                            <div>
                                <button type="submit" disabled={isLoading} className="w-full bg-purple-600 font-bold py-3 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-500 flex justify-center items-center">
                                    {isLoading ? <Spinner /> : 'Entrar'}
                                </button>
                            </div>
                        </form>
                        <div className="mt-6 text-center text-sm">
                            <p className="text-gray-400">Não tem uma conta?
                                <button onClick={() => setIsRegisterModalOpen(true)} className="font-semibold text-purple-400 hover:underline ml-1">Cadastre-se</button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LoginPage;