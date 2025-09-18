import React, { useState } from 'react';
import { getAuth, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import Spinner from '../components/ui/Spinner';

const SettingsPage = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const auth = getAuth();
    const user = auth.currentUser;

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (newPassword !== confirmNewPassword) {
            setError('As novas senhas não coincidem.');
            return;
        }
        if (newPassword.length < 6) {
            setError('A nova senha deve ter pelo menos 6 caracteres.');
            return;
        }
        if (!user) {
            setError('Nenhum usuário autenticado encontrado.');
            return;
        }

        setLoading(true);

        try {
            // Reautenticar o usuário é uma medida de segurança exigida pelo Firebase
            // para realizar operações sensíveis como a troca de senha.
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);

            // Se a reautenticação for bem-sucedida, atualize a senha.
            await updatePassword(user, newPassword);
            
            setSuccessMessage('Senha atualizada com sucesso!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        } catch (err) {
            if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                setError('A senha atual está incorreta.');
            } else {
                setError('Ocorreu um erro ao atualizar a senha. Tente fazer login novamente.');
                console.error("Firebase error:", err);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 md:p-8 text-white">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Configurações</h1>

                {/* Seção de Alteração de Senha */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Alterar Senha</h2>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold mb-2 text-gray-300" htmlFor="current-password">
                                Senha Atual
                            </label>
                            <input
                                type="password"
                                id="current-password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full max-w-sm bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2 text-gray-300" htmlFor="new-password">
                                Nova Senha
                            </label>
                            <input
                                type="password"
                                id="new-password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full max-w-sm bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2 text-gray-300" htmlFor="confirm-new-password">
                                Confirmar Nova Senha
                            </label>
                            <input
                                type="password"
                                id="confirm-new-password"
                                value={confirmNewPassword}
                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                className="w-full max-w-sm bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                required
                            />
                        </div>
                        
                        {error && <p className="text-red-400 text-sm">{error}</p>}
                        {successMessage && <p className="text-green-400 text-sm">{successMessage}</p>}
                        
                        <div className="pt-2">
                            <button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300 disabled:bg-purple-800 disabled:cursor-not-allowed">
                                {loading ? <Spinner /> : 'Salvar Alterações'}
                            </button>
                        </div>
                    </form>
                </div>
                {/* Outras seções de configurações podem ser adicionadas aqui */}
            </div>
        </div>
    );
};

export default SettingsPage;