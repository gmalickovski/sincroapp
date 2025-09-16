// src/pages/ForgotPasswordPage.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from '../services/firebase';
import Spinner from '../components/ui/Spinner';
import { StarIcon, ArrowLeftIcon } from '../components/ui/Icons';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            await sendPasswordResetEmail(auth, email);
            setMessage('Um e-mail de redefinição de senha foi enviado. Verifique sua caixa de entrada.');
        } catch (err) {
            setError('Falha ao enviar e-mail. Verifique se o endereço está correto.');
            console.error("Erro ao redefinir senha:", err);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <StarIcon className="h-12 w-12 text-purple-400 mx-auto" />
                    <h1 className="text-3xl font-bold mt-4">Recuperar Senha</h1>
                    <p className="text-gray-400 mt-2">Digite seu e-mail para receber as instruções.</p>
                </div>

                <form onSubmit={handleResetPassword} className="bg-gray-800 p-8 rounded-lg shadow-xl">
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

                    {message && <p className="text-green-500 text-sm mb-4">{message}</p>}
                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                    <button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 disabled:bg-purple-800">
                        {loading ? <Spinner /> : 'Enviar E-mail de Recuperação'}
                    </button>
                </form>

                <div className="text-center">
                    <Link to="/login" className="mt-8 text-sm text-gray-500 hover:text-white flex items-center justify-center">
                        <ArrowLeftIcon className="h-4 w-4 mr-2"/>
                        Voltar para o Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;