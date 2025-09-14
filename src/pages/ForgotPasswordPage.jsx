import React, { useState } from 'react';
import { auth } from '../services/firebase';
import { sendPasswordResetEmail } from "firebase/auth";
import Spinner from '../components/ui/Spinner';
import { StarIcon, ArrowLeftIcon } from '../components/ui/Icons';

const ForgotPasswordPage = ({ onBackToLogin }) => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await sendPasswordResetEmail(auth, email);
            setSuccess(`Email de redefinição enviado para ${email}. Verifique sua caixa de entrada e spam.`);
        } catch (err) {
            console.error(err);
            setError('Não foi possível enviar o email. Verifique se o endereço está correto.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <StarIcon className="h-12 w-12 text-purple-400 mx-auto" />
                    <h1 className="text-3xl font-bold mt-2">Recuperar Senha</h1>
                    <p className="text-gray-400">Insira seu email para receber o link de redefinição.</p>
                </div>
                <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700 shadow-xl">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                            <input 
                                type="email" 
                                value={email} 
                                onChange={e => setEmail(e.target.value)} 
                                className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-sm" 
                                required 
                            />
                        </div>
                        
                        {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}
                        {success && <p className="text-green-400 text-sm text-center mb-4">{success}</p>}

                        <button 
                            type="submit" 
                            disabled={loading || success} 
                            className="w-full bg-purple-600 font-bold py-3 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-500 flex justify-center"
                        >
                            {loading ? <Spinner /> : 'Enviar Link'}
                        </button>
                    </form>
                </div>
                <button onClick={onBackToLogin} className="mt-8 text-sm text-gray-500 hover:text-white flex items-center mx-auto">
                    <ArrowLeftIcon className="h-4 w-4 mr-2"/>
                    Voltar para o Login
                </button>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;