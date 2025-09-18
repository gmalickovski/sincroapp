// src/pages/RegisterPage.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from '../services/firebase';
import Spinner from '../components/ui/Spinner';
import { StarIcon, ArrowLeftIcon } from '../components/ui/Icons';

const RegisterPage = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [confirmEmail, setConfirmEmail] = useState('');
    const [password, setPassword] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false); // Novo estado para o consentimento
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
        if (email !== confirmEmail) {
            setError("Os e-mails não coincidem.");
            return;
        }
        if (!agreedToTerms) {
            setError("Você precisa aceitar os Termos de Serviço e a Política de Privacidade.");
            return;
        }

        setLoading(true);
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            navigate('/app'); // Navega para o app, que irá mostrar o modal de detalhes
        } catch (err) {
            if (err.code === 'auth/email-already-in-use') {
                setError('Este email já está cadastrado.');
            } else {
                setError('Ocorreu um erro ao criar a conta. Tente novamente.');
            }
            console.error("Erro no cadastro:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <StarIcon className="h-12 w-12 text-purple-400 mx-auto" />
                    <h1 className="text-3xl font-bold mt-4">Criar Conta</h1>
                    <p className="text-gray-400 mt-2">Comece sua jornada de autoconhecimento.</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg shadow-xl space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="w-full">
                            <label className="block text-sm font-bold mb-2 text-gray-300" htmlFor="firstName">Nome</label>
                            <input type="text" id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500" required />
                        </div>
                        <div className="w-full">
                            <label className="block text-sm font-bold mb-2 text-gray-300" htmlFor="lastName">Sobrenome</label>
                            <input type="text" id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500" required />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2 text-gray-300" htmlFor="email">Email</label>
                        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500" required />
                    </div>
                     <div>
                        <label className="block text-sm font-bold mb-2 text-gray-300" htmlFor="confirmEmail">Confirmar Email</label>
                        <input type="email" id="confirmEmail" value={confirmEmail} onChange={(e) => setConfirmEmail(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500" required />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2 text-gray-300" htmlFor="password">Senha</label>
                        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500" required />
                    </div>
                    
                    {/* Checkbox de Consentimento */}
                    <div className="flex items-start space-x-3 pt-2">
                        <input 
                            type="checkbox" 
                            id="terms" 
                            checked={agreedToTerms}
                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                            className="h-4 w-4 mt-1 bg-gray-700 border-gray-600 rounded text-purple-500 focus:ring-purple-600"
                        />
                        <div className="text-sm">
                            <label htmlFor="terms" className="text-gray-300">
                                Eu li e concordo com os{' '}
                                <Link to="/terms-of-service" target="_blank" className="underline text-purple-400 hover:text-purple-300">Termos de Serviço</Link>
                                {' '}e a{' '}
                                <Link to="/privacy-policy" target="_blank" className="underline text-purple-400 hover:text-purple-300">Política de Privacidade</Link>.
                            </label>
                        </div>
                    </div>
                    
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <div className="pt-2">
                        {/* O botão fica desabilitado se os termos não forem aceitos */}
                        <button type="submit" disabled={loading || !agreedToTerms} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 disabled:bg-purple-900 disabled:cursor-not-allowed">
                            {loading ? <Spinner /> : 'Criar Conta'}
                        </button>
                    </div>
                </form>

                <div className="text-center mt-6">
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

