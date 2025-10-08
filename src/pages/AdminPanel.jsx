import React, { useState, useEffect, useRef } from 'react';
import { db } from '../services/firebase';
import { doc, getDoc, updateDoc, collection, getDocs, query, orderBy } from "firebase/firestore";
import Spinner from '../components/ui/Spinner';
import { EditIcon, XIcon, HomeIcon, UserIcon, BookIcon, CheckCircleIcon, AlertTriangleIcon, ChevronDownIcon } from '../components/ui/Icons';
import { runMigration } from '../migration';

// --- Subcomponente: Cartão de Estatística Reutilizável ---
const StatCard = ({ title, value, icon }) => (
    <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 flex items-center gap-4 overflow-hidden">
        {icon && React.cloneElement(icon, { className: "h-8 w-8 text-purple-400 flex-shrink-0" })}
        <div className="min-w-0">
            <h3 className="text-sm font-medium text-gray-400 truncate">{title}</h3>
            <p className="text-3xl font-bold mt-1 break-words">{value}</p>
        </div>
    </div>
);

// --- Subcomponente: Seção de Visão Geral (Dashboard do Admin) ---
const AdminDashboardView = () => {
    const [stats, setStats] = useState({ userCount: 0, premiumCount: 0 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const usersCollectionRef = collection(db, 'users');
                const userSnapshot = await getDocs(usersCollectionRef);
                const users = userSnapshot.docs.map(doc => doc.data());
                const premiumUsers = users.filter(user => user.plano === 'premium').length;
                setStats({ userCount: userSnapshot.size, premiumCount: premiumUsers });
            } catch (error) { console.error("Erro ao buscar estatísticas:", error); }
            finally { setIsLoading(false); }
        };
        fetchStats();
    }, []);

    if (isLoading) return <div className="flex justify-center p-8"><Spinner /></div>;

    return (
        <>
            <h2 className="text-xl md:text-2xl font-bold mb-6 text-white">Visão Geral</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Total de Usuários" value={stats.userCount} icon={<UserIcon />} />
                <StatCard title="Assinantes Premium" value={stats.premiumCount} icon={<CheckCircleIcon />} />
            </div>
            <div className="mt-8 p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="flex items-start md:items-center gap-4">
                    <AlertTriangleIcon className="h-6 w-6 text-yellow-400 flex-shrink-0 mt-1 md:mt-0" />
                    <div>
                        <h3 className="font-bold text-yellow-300">Ação do Desenvolvedor</h3>
                        <p className="text-sm text-yellow-400/80 mt-1">Use este botão para enviar/sobrescrever os textos do `content.js` para o Firestore.</p>
                    </div>
                </div>
                <button onClick={runMigration} className="mt-4 bg-yellow-500 text-black font-bold py-2 px-4 rounded-lg hover:bg-yellow-600"> Executar Migração </button>
            </div>
        </>
    );
};

// --- Subcomponentes de Usuários ---
const EditUserModal = ({ user, onClose, onSave }) => {
    const [userData, setUserData] = useState(user);
    const [isSaving, setIsSaving] = useState(false);
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setUserData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };
    const handleSave = async () => {
        setIsSaving(true);
        await onSave(user.id, userData);
        setIsSaving(false);
        onClose();
    };
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in p-4" onClick={onClose}>
            <div className="bg-gray-800 text-white p-6 rounded-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Editando Usuário</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700"><XIcon className="w-5 h-5" /></button>
                </div>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    <div><label className="text-sm text-gray-400">Email</label><input value={userData.email} readOnly className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 mt-1 cursor-not-allowed"/></div>
                    <div><label className="text-sm text-gray-400">Nome</label><input name="primeiroNome" value={userData.primeiroNome || ''} onChange={handleChange} className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 mt-1"/></div>
                    <div><label className="text-sm text-gray-400">Plano</label>
                        <select name="plano" value={userData.plano} onChange={handleChange} className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 mt-1">
                            <option value="gratuito">Gratuito</option>
                            <option value="premium">Premium</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2"><input type="checkbox" name="isAdmin" checked={!!userData.isAdmin} onChange={handleChange} className="h-4 w-4 rounded"/><label>É Administrador?</label></div>
                </div>
                <div className="flex justify-end mt-6">
                    <button onClick={handleSave} disabled={isSaving} className="bg-purple-600 font-bold py-2 px-6 rounded-lg hover:bg-purple-700 disabled:bg-gray-600 w-32 h-10 flex items-center justify-center">{isSaving ? <Spinner /> : 'Salvar'}</button>
                </div>
            </div>
        </div>
    );
};

const UserManagementView = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingUser, setEditingUser] = useState(null);
    const [filtro, setFiltro] = useState('');
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const q = query(collection(db, 'users'), orderBy('email'));
                const querySnapshot = await getDocs(q);
                setUsers(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch (err) { console.error("Erro ao buscar usuários:", err); }
            finally { setIsLoading(false); }
        };
        fetchUsers();
    }, []);
    const handleSaveUser = async (userId, updatedData) => {
        try {
            await updateDoc(doc(db, 'users', userId), updatedData);
            setUsers(users.map(user => user.id === userId ? { ...user, ...updatedData } : user));
        } catch (error) { console.error("Erro ao atualizar usuário:", error); alert("Falha ao atualizar."); }
    };
    const filteredUsers = users.filter(user => user.email.toLowerCase().includes(filtro.toLowerCase()) || (user.primeiroNome && user.primeiroNome.toLowerCase().includes(filtro.toLowerCase())));
    if (isLoading) return <div className="p-8 flex justify-center"><Spinner /></div>;
    return (
        <>
            {editingUser && <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} onSave={handleSaveUser} />}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 flex-wrap gap-4">
                <h2 className="text-xl md:text-2xl font-bold text-white">Usuários ({users.length})</h2>
                <input type="text" placeholder="Filtrar por nome ou email..." value={filtro} onChange={e => setFiltro(e.target.value)} className="bg-gray-900 border border-gray-600 rounded-lg px-3 py-1.5 text-sm w-full sm:w-auto" />
            </div>
            <div className="hidden lg:block overflow-x-auto bg-gray-800/50 border border-gray-700 rounded-lg">
                <table className="w-full text-left">
                    <thead className="bg-gray-700/50"><tr><th className="p-4">Email</th><th className="p-4">Nome</th><th className="p-4">Plano</th><th className="p-4">Admin</th><th className="p-4 text-center">Ações</th></tr></thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id} className="border-b border-gray-700 last:border-b-0 hover:bg-gray-700/30">
                                <td className="p-4 truncate max-w-xs">{user.email}</td>
                                <td className="p-4">{`${user.primeiroNome || ''} ${user.sobrenome || ''}`}</td>
                                <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.plano === 'premium' ? 'bg-green-500/30 text-green-300' : 'bg-gray-600 text-gray-200'}`}>{user.plano}</span></td>
                                <td className="p-4">{user.isAdmin ? 'Sim' : 'Não'}</td>
                                <td className="p-4 text-center"><button onClick={() => setEditingUser(user)} className="p-2 rounded-lg hover:bg-purple-600" title="Editar Usuário"><EditIcon className="w-5 h-5"/></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="lg:hidden space-y-4">
                {filteredUsers.map(user => (
                    <div key={user.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0"><p className="font-bold text-white truncate" title={user.email}>{user.email}</p><p className="text-sm text-gray-300">{`${user.primeiroNome || ''} ${user.sobrenome || ''}`.trim() || 'Nome não informado'}</p></div>
                            <button onClick={() => setEditingUser(user)} className="p-2 rounded-lg hover:bg-purple-600 flex-shrink-0 ml-2" title="Editar Usuário"><EditIcon className="w-5 h-5"/></button>
                        </div>
                        <div className="flex items-center justify-between text-sm border-t border-gray-700 pt-3">
                            <div><span className="text-xs text-gray-400 block">Plano</span><span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${user.plano === 'premium' ? 'bg-green-500/30 text-green-300' : 'bg-gray-600 text-gray-200'}`}>{user.plano}</span></div>
                            <div className='text-right'><span className="text-xs text-gray-400 block">Admin</span><span className="font-semibold">{user.isAdmin ? 'Sim' : 'Não'}</span></div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

// --- Subcomponentes de Conteúdo ---
const EditContentModal = ({ contentData, onClose, onSave, contentKey }) => {
    const [data, setData] = useState(contentData.data);
    const [isSaving, setIsSaving] = useState(false);
    const handleChange = (e) => { const { name, value } = e.target; const finalValue = name === 'tags' || name === 'potencializar' || name === 'atencao' ? value.split(',').map(tag => tag.trim()) : value; setData(prev => ({ ...prev, [name]: finalValue })); };
    const handleSave = async () => { setIsSaving(true); await onSave(contentData.id, data); setIsSaving(false); onClose(); };
    
    const renderField = (key, value) => {
        if (key === 'numero' || key === 'id') return null;
        const label = key.charAt(0).toUpperCase() + key.slice(1);
        const isTextarea = key === 'desc' || key === 'descricao' || key === 'texto' || key === 'inspiracao';
        const isArray = Array.isArray(value);
        if (isTextarea) return (<div key={key}><label className="text-sm text-gray-400">{label}</label><textarea name={key} value={value || ''} onChange={handleChange} rows="4" className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 mt-1" /></div>);
        return (<div key={key}><label className="text-sm text-gray-400">{isArray ? `${label} (separado por vírgulas)` : label}</label><input name={key} value={isArray ? (value || []).join(', ') : (value || '')} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 mt-1" /></div>);
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in p-4" onClick={onClose}>
            <div className="bg-gray-800 text-white p-6 rounded-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Editando: {contentKey} (ID: {contentData.id})</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700"><XIcon className="w-5 h-5" /></button>
                </div>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    {Object.entries(data).map(([key, value]) => renderField(key, value))}
                </div>
                <div className="flex justify-end mt-6">
                    <button onClick={handleSave} disabled={isSaving} className="bg-purple-600 font-bold py-2 px-6 rounded-lg hover:bg-purple-700 disabled:bg-gray-600">{isSaving ? <Spinner /> : 'Salvar Alterações'}</button>
                </div>
            </div>
        </div>
    );
};

const ContentManagementView = () => {
    const [content, setContent] = useState({});
    const [activeTab, setActiveTab] = useState('textosArcanos');
    const [isLoading, setIsLoading] = useState(true);
    const [filtro, setFiltro] = useState('');
    const [editingItem, setEditingItem] = useState(null);
    
    const contentKeys = [
        { id: 'textosArcanos', name: 'Arcanos' }, { id: 'textosDiaPessoal', name: 'Dia Pessoal' },
        { id: 'textosMesPessoal', name: 'Mês Pessoal' }, { id: 'textosAnoPessoal', name: 'Ano Pessoal' },
        { id: 'textosCiclosDeVida', name: 'Ciclos de Vida' }, { id: 'bussolaAtividades', name: 'Bússola' },
        { id: 'textosVibracoes', name: 'Vibrações' }, { id: 'textosExplicativos', name: 'Explicações' },
        { id: 'journalPrompts', name: 'Prompts do Diário' }
    ];

    useEffect(() => {
        const fetchAllContent = async () => {
            setIsLoading(true);
            try {
                const fetchedContent = {};
                for (const key of contentKeys) {
                    const docRef = doc(db, "textos_sistema", key.id);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        const arrayData = Object.keys(data).map(itemKey => ({ id: itemKey, data: data[itemKey] }));
                        fetchedContent[key.id] = arrayData;
                    }
                }
                setContent(fetchedContent);
            } catch (err) { console.error("Erro ao buscar conteúdo:", err); }
            finally { setIsLoading(false); }
        };
        fetchAllContent();
    }, []);

    const handleSave = async (id, dataToSave) => {
        try {
            const docRef = doc(db, "textos_sistema", activeTab);
            await updateDoc(docRef, { [id]: dataToSave });
            setContent(prev => ({ ...prev, [activeTab]: prev[activeTab].map(item => item.id === id ? { id, data: dataToSave } : item) }));
        } catch (error) { console.error("Erro ao salvar conteúdo:", error); alert("Erro ao salvar."); }
    };
    
    const activeContent = content[activeTab] || [];
    const filteredContent = activeContent.filter(item => {
        const searchTerm = filtro.toLowerCase();
        if (item.id.toString().toLowerCase().includes(searchTerm)) return true;
        if (Array.isArray(item.data)) return item.data.some(prompt => String(prompt).toLowerCase().includes(searchTerm));
        for (const key in item.data) { if (String(item.data[key]).toLowerCase().includes(searchTerm)) return true; }
        return false;
    }).sort((a, b) => {
        const numA = parseInt(a.id); const numB = parseInt(b.id);
        if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
        return a.id.localeCompare(b.id);
    });
    
    const columnConfig = {
      default: ['titulo', 'desc'],
      textosArcanos: ['titulo', 'tituloTradicional', 'desc', 'tags', 'inspiracao'],
      bussolaAtividades: ['potencializar', 'atencao'],
      textosExplicativos: ['texto'],
    };
    const headers = filteredContent.length > 0 ? columnConfig[activeTab] || columnConfig.default : [];

    return (
        <>
            {editingItem && <EditContentModal contentData={editingItem} onClose={() => setEditingItem(null)} onSave={handleSave} contentKey={contentKeys.find(c => c.id === activeTab)?.name} />}
            <h2 className="text-xl md:text-2xl font-bold mb-6 text-white">Gerenciamento de Conteúdo</h2>
            
            {/* ### MELHORIA 1: Dropdown/Select para o tipo de conteúdo ### */}
            <div className="mb-4 flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <label htmlFor="contentTypeSelect" className="text-sm text-gray-400 mb-1 block">Tipo de Conteúdo</label>
                    <select 
                        id="contentTypeSelect"
                        value={activeTab} 
                        onChange={(e) => setActiveTab(e.target.value)}
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2.5 text-sm"
                    >
                        {contentKeys.map(key => (<option key={key.id} value={key.id}>{key.name}</option>))}
                    </select>
                </div>
                <div className="flex-1">
                    <label htmlFor="filterInput" className="text-sm text-gray-400 mb-1 block">Filtrar por palavra-chave</label>
                    <input 
                        id="filterInput"
                        type="text" 
                        placeholder="Filtrar..." 
                        value={filtro} 
                        onChange={(e) => setFiltro(e.target.value)} 
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2.5 text-sm"
                    />
                </div>
            </div>

            {/* ### MELHORIA 2: Tabela com cabeçalho fixo e corpo rolável ### */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 300px)' }}>
                {isLoading ? <div className="p-8 flex justify-center items-center h-full"><Spinner/></div> : 
                <>
                    <div className="flex-shrink-0 overflow-x-auto">
                        <table className="w-full text-left table-auto">
                            <thead className="sticky top-0 bg-gray-700/80 backdrop-blur-sm z-10">
                                <tr>
                                    <th className="p-4 w-24">ID</th>
                                    {headers.map(header => <th key={header} className="p-4 capitalize">{header}</th>)}
                                    <th className="p-4 w-20 text-center">Ações</th>
                                </tr>
                            </thead>
                        </table>
                    </div>
                    <div className="flex-1 overflow-auto custom-scrollbar">
                        <table className="w-full text-left table-auto">
                            <tbody>
                                {filteredContent.map(item => (
                                    <tr key={item.id} className="border-b border-gray-700 hover:bg-gray-700/30">
                                        <td className="p-4 w-24 font-bold truncate">{item.id}</td>
                                        {headers.map(key => (
                                            <td key={key} className="p-4 text-sm text-gray-400">
                                                <p className="whitespace-normal break-words line-clamp-2">
                                                    {Array.isArray(item.data[key]) ? item.data[key].join(', ') : String(item.data[key] || '')}
                                                </p>
                                            </td>
                                        ))}
                                        <td className="p-4 w-20 text-center">
                                            <button onClick={() => setEditingItem(item)} className="p-2 rounded-lg hover:bg-purple-600" title="Editar"><EditIcon className="w-5 h-5"/></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredContent.length === 0 && <p className="text-center text-gray-500 p-8">Nenhum item encontrado.</p>}
                    </div>
                </>}
            </div>
        </> 
    );
};


// --- Componente Principal do Painel de Administração ---
const AdminPanel = () => {
    const [activeView, setActiveView] = useState('dashboard');
    const navItems = [
        { id: 'dashboard', label: 'Visão Geral', icon: <HomeIcon className="w-5 h-5" /> },
        { id: 'users', label: 'Usuários', icon: <UserIcon className="w-5 h-5" /> },
        { id: 'content', label: 'Conteúdo', icon: <BookIcon className="w-5 h-5" /> },
    ];
    
    const renderView = () => {
        switch (activeView) {
            case 'dashboard': return <AdminDashboardView />;
            case 'users': return <UserManagementView />;
            case 'content': return <ContentManagementView />;
            default: return <AdminDashboardView />;
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto h-full flex flex-col text-white">
            <div className="flex-shrink-0 border-b border-gray-700 px-4 md:px-6">
                <nav className="flex items-center -mb-px space-x-2 sm:space-x-4 overflow-x-auto">
                    {navItems.map(item => (
                        <button 
                            key={item.id} 
                            onClick={() => setActiveView(item.id)} 
                            className={`flex items-center gap-2 py-3 px-3 text-sm font-semibold whitespace-nowrap transition-colors ${activeView === item.id ? 'text-white border-b-2 border-purple-500' : 'text-gray-400 hover:text-white'}`}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>
            </div>
            <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
                {renderView()}
            </main>
        </div>
    );
};

export default AdminPanel;