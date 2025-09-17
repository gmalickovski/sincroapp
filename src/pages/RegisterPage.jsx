import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import * as Icons from '../components/ui/Icons';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        termsAccepted: false, // CORREÇÃO: Estado para o consentimento
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Limpa erros anteriores
        if (formData.password !== formData.confirmPassword) {
            return setError('As senhas não conferem.');
        }
        if (formData.password.length < 6) {
            return setError('A senha deve ter no mínimo 6 caracteres.');
        }
        if (!formData.termsAccepted) { // CORREÇÃO: Verificação do consentimento
            return setError('Você deve aceitar os termos e políticas para continuar.');
        }

        try {
            setLoading(true);
            await signup(formData);
            navigate('/dashboard');
        } catch (err) {
            if (err.code === 'auth/email-already-in-use') {
                setError('Este e-mail já está cadastrado.');
            } else {
                setError('Falha ao criar a conta. Tente novamente.');
            }
        }
        setLoading(false);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
            <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-2xl shadow-2xl border border-gray-700">
                <div className="text-center">
                    <Link to="/" className="flex items-center justify-center gap-2 mb-4">
                        <Icons.StarIcon className="h-10 w-10 text-purple-400" />
                        <h1 className="text-3xl font-bold text-purple-400">SincroApp</h1>
                    </Link>
                    <h2 className="mt-2 text-xl font-bold">Crie sua Conta</h2>
                    <p className="mt-2 text-sm text-gray-400">Comece sua jornada de autoconhecimento.</p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                    <div className="flex gap-4">
                        <input name="firstName" type="text" value={formData.firstName} onChange={handleChange} required className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-sm focus:ring-purple-500" placeholder="Nome" />
                        <input name="lastName" type="text" value={formData.lastName} onChange={handleChange} required className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-sm focus:ring-purple-500" placeholder="Sobrenome" />
                    </div>
                    <input name="email" type="email" value={formData.email} onChange={handleChange} autoComplete="email" required className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-sm focus:ring-purple-500" placeholder="E-mail" />
                    <input name="password" type="password" value={formData.password} onChange={handleChange} required className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-sm focus:ring-purple-500" placeholder="Senha" />
                    <input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-sm focus:ring-purple-500" placeholder="Confirmar Senha" />
                    
                    {/* CORREÇÃO: Campo de consentimento restaurado */}
                    <div className="flex items-start pt-2">
                        <input id="terms" name="termsAccepted" type="checkbox" checked={formData.termsAccepted} onChange={handleChange} className="h-4 w-4 mt-1 rounded border-gray-500 bg-gray-700 text-purple-600 focus:ring-purple-500" />
                        <label htmlFor="terms" className="ml-3 text-sm text-gray-400">
                            Eu li e concordo com os <Link to="/terms" target="_blank" className="font-medium text-purple-400 hover:underline">Termos</Link> e a <Link to="/privacy" target="_blank" className="font-medium text-purple-400 hover:underline">Política de Privacidade</Link>.
                        </label>
                    </div>

                    <div>
                        <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-gray-600">
                            {loading ? 'Criando...' : 'Criar Conta'}
                        </button>
                    </div>
                </form>
                <p className="text-sm text-center text-gray-400">
                    Já tem uma conta?{' '}
                    <Link to="/login" className="font-medium text-purple-400 hover:underline">
                        Faça login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;