import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const OnboardingModal = ({ onComplete }) => {
    // CORREÇÃO: Trocamos 'currentUser' por 'userData' para obter o uid de forma segura.
    const { userData, completeUserProfile } = useAuth();
    const [formData, setFormData] = useState({
        nomeNascimento: '',
        dataNasc: '',
        termsAccepted: true,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const isFormValid = useMemo(() => {
        return (
            formData.nomeNascimento.trim() !== '' &&
            formData.dataNasc.match(/^\d{2}\/\d{2}\/\d{4}$/) &&
            formData.termsAccepted
        );
    }, [formData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isFormValid) return;

        setLoading(true);
        setError('');
        try {
            // CORREÇÃO: Usando userData.uid, que é garantido de existir aqui.
            await completeUserProfile(userData.uid, formData);
            onComplete();
        } catch (err) {
            setError('Não foi possível salvar os dados. Tente novamente.');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-gray-800 text-white p-8 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-md">
                <form onSubmit={handleSubmit}>
                    <h2 className="text-2xl font-bold mb-2 text-purple-300">Só mais um passo!</h2>
                    <p className="text-gray-400 mb-6">Precisamos destes dados para gerar suas análises e personalizar sua jornada.</p>
                    {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}
                    
                    <div className="mb-4">
                        <label htmlFor="nomeNascimento" className="block text-sm font-medium text-gray-300 mb-2">Seu Nome Completo de Nascimento</label>
                        <input type="text" name="nomeNascimento" id="nomeNascimento" value={formData.nomeNascimento} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-sm focus:ring-purple-500" />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="dataNasc" className="block text-sm font-medium text-gray-300 mb-2">Sua Data de Nascimento</label>
                        <input type="text" name="dataNasc" id="dataNasc" value={formData.dataNasc} onChange={handleChange} placeholder="DD/MM/AAAA" className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-sm focus:ring-purple-500" />
                    </div>

                    <div className="flex items-start mb-6">
                        <input id="terms" name="termsAccepted" type="checkbox" checked={formData.termsAccepted} onChange={handleChange} className="h-4 w-4 mt-1 rounded border-gray-500 bg-gray-700 text-purple-600 focus:ring-purple-500" />
                        <label htmlFor="terms" className="ml-3 text-sm text-gray-400">
                            Eu li e concordo com os <Link to="/terms" target="_blank" className="font-medium text-purple-400 hover:underline">Termos de Serviço</Link> e a <Link to="/privacy" target="_blank" className="font-medium text-purple-400 hover:underline">Política de Privacidade</Link>.
                        </label>
                    </div>

                    <button type="submit" disabled={!isFormValid || loading} className="w-full bg-purple-600 font-bold py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">
                        {loading ? 'Salvando...' : 'Começar a Jornada'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default OnboardingModal;