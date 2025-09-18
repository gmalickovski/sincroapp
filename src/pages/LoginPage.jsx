import React, { useState } from 'react';
import { auth } from '../services/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import Spinner from '../components/ui/Spinner';

const StarIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>);
const ArrowLeftIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>);

function LoginPage({ onBackToHomeClick, onNavigateToForgotPassword }) { // Adicionada a nova prop
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
        } catch (err) {
             if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
                setError('Email ou senha inválidos.');
            } else if (err.code === 'auth/email-already-in-use') {
                setError('Este email já está cadastrado.');
            } else {
                setError('Ocorreu um erro. Tente novamente.');
            }
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
                    <p className="text-gray-400">{isLogin ? 'Bem-vindo(a) de volta!' : 'Crie sua conta'}</p>
                </div>
                <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700 shadow-xl">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4"><label className="block text-sm font-medium text-gray-300 mb-2">Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-sm" required /></div>
                        <div className="mb-2"><label className="block text-sm font-medium text-gray-300 mb-2">Senha</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-sm" required /></div>
                        
                        {/* Link para "Esqueci a senha" */}
                        {isLogin && (
                            <div className="text-right mb-4">
                                <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToForgotPassword(); }} className="text-xs text-purple-400 hover:underline">
                                    Esqueci a senha
                                </a>
                            </div>
                        )}
                        
                        {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}
                        <button type="submit" disabled={loading} className="w-full bg-purple-600 font-bold py-3 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-500 flex justify-center">{loading ? <Spinner /> : (isLogin ? 'Entrar' : 'Cadastrar')}</button>
                    </form>
                    <p className="text-center text-sm text-gray-400 mt-6">{isLogin ? "Não tem conta?" : "Já tem conta?"}<a href="#" onClick={(e) => { e.preventDefault(); setIsLogin(!isLogin); }} className="font-semibold text-purple-400 hover:underline ml-1">{isLogin ? "Cadastre-se" : "Faça login"}</a></p>
                </div>
                <button onClick={onBackToHomeClick} className="mt-8 text-sm text-gray-500 hover:text-white flex items-center mx-auto"><ArrowLeftIcon className="h-4 w-4 mr-2"/>Voltar</button>
            </div>
        </div>
    );
}

export default LoginPage;