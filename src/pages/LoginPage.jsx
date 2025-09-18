// src/pages/LoginPage.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../services/firebase';
import Spinner from '../components/ui/Spinner';
import { StarIcon, ArrowLeftIcon } from '../components/ui/Icons';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/app');
        } catch (err) {
            setError('Email ou senha inválidos.');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
             <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <StarIcon className="h-12 w-12 text-purple-400 mx-auto" />
                    <h1 className="text-3xl font-bold mt-2">SincroApp</h1>
                    <p className="text-gray-400">Bem-vindo(a) de volta!</p>
                </div>
                <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700 shadow-xl">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-sm" required />
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Senha</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-sm" required />
                        </div>
                        
                        {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}
                        
                        <button type="submit" disabled={loading} className="w-full bg-purple-600 font-bold py-3 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-500 flex justify-center">
                            {loading ? <Spinner /> : 'Entrar'}
                        </button>
                    </form>
                    <p className="text-center text-sm text-gray-400 mt-6">
                        Não tem conta? <Link to="/register" className="font-semibold text-purple-400 hover:underline ml-1">Cadastre-se</Link>
                    </p>
                </div>
                 <Link to="/" className="mt-8 text-sm text-gray-500 hover:text-white flex items-center mx-auto">
                    <ArrowLeftIcon className="h-4 w-4 mr-2"/>Voltar
                </Link>
            </div>
        </div>
    );
}

export default LoginPage;