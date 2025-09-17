import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError('Falha ao fazer login. Verifique suas credenciais.');
        }
        setLoading(false);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
            <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-2xl shadow-2xl border border-gray-700">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-purple-400">Sincro</h1>
                    <h2 className="mt-2 text-xl font-bold">Bem-vindo de volta!</h2>
                    <p className="mt-2 text-sm text-gray-400">Acesse sua conta para continuar.</p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-sm focus:ring-purple-500" placeholder="E-mail" />
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-sm focus:ring-purple-500" placeholder="Senha" />

                    <div className="flex items-center justify-between">
                        <div className="text-sm">
                            <Link to="/forgot-password" className="font-medium text-purple-400 hover:underline">
                                Esqueceu sua senha?
                            </Link>
                        </div>
                    </div>

                    <div>
                        <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-gray-600">
                            {loading ? 'Entrando...' : 'Entrar'}
                        </button>
                    </div>
                </form>
                <p className="text-sm text-center text-gray-400">
                    Não tem uma conta?{' '}
                    {/* CORREÇÃO: Botão transformado em um Link para a página de registro */}
                    <Link to="/register" className="font-medium text-purple-400 hover:underline">
                        Registre-se
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;