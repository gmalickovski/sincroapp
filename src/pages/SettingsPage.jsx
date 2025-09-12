// /src/pages/SettingsPage.jsx

import React, { useState } from 'react';
import { auth } from '../services/firebase';
import { updatePassword } from "firebase/auth";
import Spinner from '../components/ui/Spinner';
import { ArrowLeftIcon } from '../components/ui/Icons';

const SettingsPage = ({ user, userData, onBackToApp }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword.length < 6) {
            setError("A nova senha deve ter pelo menos 6 caracteres.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("As senhas não coincidem.");
            return;
        }

        setIsLoading(true);
        try {
            const currentUser = auth.currentUser;
            if (currentUser) {
                await updatePassword(currentUser, newPassword);
                setSuccess("Senha alterada com sucesso!");
                setNewPassword('');
                setConfirmPassword('');
            }
        } catch (error) {
            console.error("Erro ao alterar a senha:", error);
            if (error.code === 'auth/requires-recent-login') {
                setError("Esta operação é sensível e requer autenticação recente. Por favor, faça login novamente antes de tentar alterar sua senha.");
            } else {
                setError("Erro ao alterar a senha. Tente mais tarde.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 p-4 md:p-8 text-white w-full">
            <div className="max-w-3xl mx-auto">
                <button onClick={onBackToApp} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-8">
                    <ArrowLeftIcon className="w-4 h-4" />
                    Voltar para o App
                </button>

                <h1 className="text-3xl font-bold mb-8">Configurações da Conta</h1>

                <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
                    <h2 className="text-xl font-semibold mb-4">Informações do Perfil</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-400">Nome de Nascimento</label>
                            <p className="text-lg">{userData.nome}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-400">Data de Nascimento</label>
                            <p className="text-lg">{userData.dataNasc}</p>
                        </div>
                         <div>
                            <label className="text-sm font-medium text-gray-400">Email</label>
                            <p className="text-lg">{user.email}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 mt-6">
                    <h2 className="text-xl font-semibold mb-4">Alterar Senha</h2>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Nova Senha</label>
                            <input 
                                type="password" 
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-sm"
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Confirmar Nova Senha</label>
                            <input 
                                type="password" 
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-sm"
                                required 
                            />
                        </div>
                        
                        {error && <p className="text-red-400 text-sm">{error}</p>}
                        {success && <p className="text-green-400 text-sm">{success}</p>}

                        <div className="pt-2">
                            {/* LINHA CORRIGIDA ABAIXO */}
                            <button type="submit" disabled={isLoading} className="bg-purple-600 font-bold py-2 px-6 rounded-lg hover:bg-purple-700 disabled:bg-gray-500 flex items-center justify-center min-w-[160px] h-10">
                                {isLoading ? <Spinner /> : 'Salvar Alterações'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;