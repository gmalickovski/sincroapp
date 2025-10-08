import React, { useState } from 'react';
import { getAuth, updatePassword, EmailAuthProvider, reauthenticateWithCredential, deleteUser } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { db } from '../../services/firebase';
import { XIcon, UserIcon, BookIcon, StarIcon, AlertTriangleIcon, Share2Icon } from './Icons';
import Spinner from './Spinner';

// --- FUNÇÕES AUXILIARES PARA A DATA ---
const formatToInputDate = (dateStr) => {
    if (!dateStr || !dateStr.includes('/')) return dateStr;
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

const formatToSaveDate = (dateStr) => {
    if (!dateStr || !dateStr.includes('-')) return dateStr;
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
};

const SettingsModal = ({ user, userData, onClose }) => {
    const [activeTab, setActiveTab] = useState('account');
    const [accountInfo, setAccountInfo] = useState({ primeiroNome: userData?.primeiroNome || '', sobrenome: userData?.sobrenome || '' });
    const [numerologyInfo, setNumerologyInfo] = useState({ nomeAnalise: userData?.nomeAnalise || '', dataNasc: formatToInputDate(userData?.dataNasc) || '' });
    const [passwordInfo, setPasswordInfo] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [isSavingInfo, setIsSavingInfo] = useState(false);
    const [isSavingPassword, setIsSavingPassword] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [feedback, setFeedback] = useState({ type: '', message: '' });
    const auth = getAuth();

    const showFeedback = (type, message) => {
        setFeedback({ type, message });
        setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
    };

    const handleInputChange = (setter) => (e) => {
        setter(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSaveChanges = async (section) => {
        setIsSavingInfo(true);
        const userDocRef = doc(db, "users", user.uid);
        let dataToUpdate = {};
        if (section === 'account') {
            dataToUpdate = accountInfo;
        } else if (section === 'numerology') {
            dataToUpdate = { ...numerologyInfo, dataNasc: formatToSaveDate(numerologyInfo.dataNasc) };
        }
        try {
            await updateDoc(userDocRef, dataToUpdate);
            showFeedback('success', 'Informações salvas com sucesso!');
        } catch (error) {
            showFeedback('error', 'Erro ao salvar as informações.');
        } finally {
            setIsSavingInfo(false);
        }
    };

    const reauthenticate = (password) => {
        const credential = EmailAuthProvider.credential(user.email, password);
        return reauthenticateWithCredential(user, credential);
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordInfo.newPassword !== passwordInfo.confirmPassword) return showFeedback('error', 'As novas senhas não coincidem.');
        if (passwordInfo.newPassword.length < 6) return showFeedback('error', 'A nova senha deve ter no mínimo 6 caracteres.');
        
        setIsSavingPassword(true);
        try {
            await reauthenticate(passwordInfo.currentPassword);
            await updatePassword(user, passwordInfo.newPassword);
            showFeedback('success', 'Senha alterada com sucesso!');
            setPasswordInfo({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            showFeedback('error', 'Erro ao alterar a senha. Verifique sua senha atual.');
        } finally {
            setIsSavingPassword(false);
        }
    };
    
    const handleDeleteAccount = async () => {
        const password = prompt("AÇÃO IRREVERSÍVEL!\nPara confirmar a exclusão da sua conta, digite sua senha:");
        if (!password) return;
        
        setIsDeleting(true);
        try {
            await reauthenticate(password);
            await deleteUser(user);
        } catch (error) {
            showFeedback('error', 'Não foi possível deletar a conta. Verifique sua senha.');
        } finally {
            setIsDeleting(false);
        }
    };
    
    const NavItem = ({ id, icon, label }) => ( <button onClick={() => setActiveTab(id)} className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${activeTab === id ? 'bg-gray-700/80 text-white' : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'}`}>{icon}<span>{label}</span></button> );
    const MobileNavItem = ({ id, label }) => ( <button onClick={() => setActiveTab(id)} className={`flex-1 py-3 text-sm font-semibold transition-colors whitespace-nowrap px-2 ${activeTab === id ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-white'}`}>{label}</button> );
    const getInitials = (f = '', l = '') => ((f[0] || '') + (l[0] || '')).toUpperCase();

    const renderContent = (currentView) => {
        switch (currentView) {
            case 'account':
                return ( <div className="space-y-8"> <div> <h2 className="text-lg font-bold text-white mb-1">Minha Conta</h2> <p className="text-sm text-gray-400 mb-6">Veja e edite suas informações pessoais.</p> <div className="flex items-center gap-4"> <div className="h-16 w-16 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0"> {getInitials(userData?.primeiroNome, userData?.sobrenome)} </div> <button className="text-sm font-semibold bg-gray-700/80 hover:bg-gray-700 px-4 py-2 rounded-lg"> Adicionar Foto </button> </div> <div className="grid md:grid-cols-2 gap-4 mt-6"> <div> <label className="text-xs font-semibold text-gray-400">Nome</label> <input type="text" name="primeiroNome" value={accountInfo.primeiroNome} onChange={handleInputChange(setAccountInfo)} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-2 mt-1"/> </div> <div> <label className="text-xs font-semibold text-gray-400">Sobrenome</label> <input type="text" name="sobrenome" value={accountInfo.sobrenome} onChange={handleInputChange(setAccountInfo)} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-2 mt-1"/> </div> </div> <button onClick={() => handleSaveChanges('account')} disabled={isSavingInfo} className="mt-4 font-semibold bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-600 w-32 h-10 flex items-center justify-center"> {isSavingInfo ? <Spinner/> : 'Salvar'} </button> </div> <form onSubmit={handleChangePassword}> <h3 className="text-md font-bold text-white border-t border-gray-700 pt-6">Alterar Senha</h3> <div className="space-y-4 mt-4"> <div> <label className="text-xs font-semibold text-gray-400">Senha Atual</label> <input type="password" name="currentPassword" value={passwordInfo.currentPassword} onChange={handleInputChange(setPasswordInfo)} required className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-2 mt-1" /> </div> <div> <label className="text-xs font-semibold text-gray-400">Nova Senha</label> <input type="password" name="newPassword" value={passwordInfo.newPassword} onChange={handleInputChange(setPasswordInfo)} required className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-2 mt-1" /> </div> <div> <label className="text-xs font-semibold text-gray-400">Confirmar Nova Senha</label> <input type="password" name="confirmPassword" value={passwordInfo.confirmPassword} onChange={handleInputChange(setPasswordInfo)} required className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-2 mt-1" /> </div> <button type="submit" disabled={isSavingPassword} className="font-semibold bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-600 w-36 h-10 flex items-center justify-center"> {isSavingPassword ? <Spinner/> : 'Alterar Senha'} </button> </div> </form> <div className="border-t border-red-500/30 pt-6"> <h3 className="text-md font-bold text-red-400 flex items-center gap-2"><AlertTriangleIcon className="w-5 h-5"/> Zona de Perigo</h3> <p className="text-sm text-gray-400 mt-2 mb-4">Esta ação é irreversível. Todos os seus dados serão permanentemente excluídos.</p> <button onClick={handleDeleteAccount} disabled={isDeleting} className="text-sm font-semibold bg-red-600/20 text-red-400 border border-red-500/50 hover:bg-red-600/40 px-4 py-2 rounded-lg h-10 flex items-center justify-center"> {isDeleting ? <Spinner/> : 'Deletar minha conta'} </button> </div> </div> );
            case 'numerology':
                return ( <div> <h2 className="text-lg font-bold text-white mb-1">Dados da Análise</h2> <p className="text-sm text-gray-400 mb-6">Informações usadas para os cálculos.</p> <div className="space-y-4"> <div> <label className="text-xs font-semibold text-gray-400">Nome Completo (para análise)</label> <input type="text" name="nomeAnalise" value={numerologyInfo.nomeAnalise} onChange={handleInputChange(setNumerologyInfo)} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-2 mt-1" /> </div> <div> <label className="text-xs font-semibold text-gray-400">Data de Nascimento</label> <input type="date" name="dataNasc" value={numerologyInfo.dataNasc} onChange={handleInputChange(setNumerologyInfo)} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-2 mt-1 custom-date-input" /> </div> <button onClick={() => handleSaveChanges('numerology')} disabled={isSavingInfo} className="font-semibold bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-600 w-32 h-10 flex items-center justify-center"> {isSavingInfo ? <Spinner/> : 'Salvar'} </button> </div> </div> );
            case 'plan':
                return ( <div> <h2 className="text-lg font-bold text-white mb-1">Plano e Assinatura</h2> <p className="text-sm text-gray-400 mb-6">Gerencie seu plano e assinatura.</p> {userData?.plano === 'gratuito' ? ( <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-6 text-center"> <h3 className="text-xl font-bold text-white">Desbloqueie todo o potencial!</h3> <p className="text-purple-200 mt-2 mb-4">Acesse funcionalidades exclusivas com o plano Premium.</p> <button className="bg-purple-600 font-bold py-2 px-6 rounded-lg hover:bg-purple-700">Fazer Upgrade</button> </div> ) : ( <div className="bg-gray-700/40 border border-gray-600 rounded-lg p-6"> <h3 className="font-bold text-white">Seu plano atual: <span className="text-purple-400 capitalize">{userData?.plano}</span></h3> <p className="text-sm text-gray-400 mt-2 mb-4">Você tem acesso a todas as funcionalidades.</p> <div className="border-t border-gray-600 pt-4 mt-4"> <button className="text-sm font-semibold bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-lg"> Cancelar Assinatura </button> </div> </div> )} </div> );
            case 'integrations':
                return ( <div> <h2 className="text-lg font-bold text-white mb-1">Integrações</h2> <p className="text-sm text-gray-400 mb-6">Conecte o SincroApp com outras ferramentas.</p> <div className="text-center p-12 bg-gray-900/40 rounded-lg border border-dashed border-gray-700"> <p className="text-gray-400 font-semibold">Em breve...</p> </div> </div> );
            default: return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4" onClick={onClose}>
            <div className="bg-gray-800 border border-gray-700 w-full max-w-4xl h-[600px] max-h-[90vh] rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden" onClick={e => e.stopPropagation()}>
                
                {/* --- DESKTOP SIDEBAR --- */}
                <aside className="hidden md:block w-64 bg-gray-900/50 p-4 border-r border-gray-700 flex-shrink-0">
                    <div className="text-white p-2 mb-4">
                        <p className="font-bold truncate">{`${userData?.primeiroNome || ''} ${userData?.sobrenome || ''}`}</p>
                        <p className="text-xs text-gray-400 capitalize">{userData?.plano || 'Plano'} Plan</p>
                    </div>
                    <nav className="space-y-1">
                        <NavItem id="account" icon={<UserIcon className="w-5 h-5"/>} label="Minha Conta" />
                        <NavItem id="numerology" icon={<BookIcon className="w-5 h-5"/>} label="Dados da Análise" />
                        <NavItem id="plan" icon={<StarIcon className="w-5 h-5"/>} label="Meu Plano" />
                        <NavItem id="integrations" icon={<Share2Icon className="w-5 h-5"/>} label="Integrações" />
                    </nav>
                </aside>

                {/* --- MAIN CONTENT (DESKTOP & MOBILE) --- */}
                <main className="flex-1 flex flex-col overflow-y-auto custom-scrollbar relative">
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:bg-gray-700 z-10"><XIcon className="h-5 w-5" /></button>
                    
                    {feedback.message && (
                        <div className="p-3 rounded-md text-sm m-4 animate-fade-in bg-opacity-20 text-opacity-90 -mb-2 z-10" style={{ backgroundColor: feedback.type === 'success' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(248, 113, 113, 0.2)', color: feedback.type === 'success' ? '#86efac' : '#fca5a5' }}>
                            {feedback.message}
                        </div>
                    )}
                    
                    {/* --- DESKTOP VIEW --- */}
                    <div className="hidden md:block p-6 md:p-8">
                        {renderContent(activeTab)}
                    </div>

                    {/* --- MOBILE VIEW --- */}
                    <div className="md:hidden flex flex-col h-full">
                        <div className='p-4 text-center'>
                             <h2 className="text-lg font-bold text-white">Configurações</h2>
                        </div>
                        <nav className="flex-shrink-0 flex border-b border-t border-gray-700">
                            <MobileNavItem id="account" label="Conta" />
                            <MobileNavItem id="numerology" label="Análise" />
                            <MobileNavItem id="plan" label="Plano" />
                            <MobileNavItem id="integrations" label="Integrações" />
                        </nav>
                        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                            {renderContent(activeTab)}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default SettingsModal;