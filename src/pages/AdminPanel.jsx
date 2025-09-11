// /src/pages/AdminPanel.jsx

import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { doc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import Spinner from '../components/ui/Spinner';
import { EditIcon, XIcon, HomeIcon, UserIcon, BookIcon } from '../components/ui/Icons';

// --- Subcomponente: Seção de Visão Geral (Dashboard do Admin) ---
const AdminDashboardView = () => {
    const [stats, setStats] = useState({ userCount: 0 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const usersCollectionRef = collection(db, 'users');
                const userSnapshot = await getDocs(usersCollectionRef);
                setStats({ userCount: userSnapshot.size });
            } catch (error) {
                console.error("Erro ao buscar estatísticas:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (isLoading) {
        return <div className="flex justify-center p-8"><Spinner /></div>;
    }

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Visão Geral</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                    <h3 className="text-sm font-medium text-gray-400">Total de Usuários</h3>
                    <p className="text-3xl font-bold mt-2">{stats.userCount}</p>
                </div>
            </div>
        </div>
    );
};

// --- Subcomponente: Seção de Gerenciamento de Usuários ---
const UserManagementView = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [filtro, setFiltro] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const usersCollectionRef = collection(db, 'users');
                const querySnapshot = await getDocs(usersCollectionRef);
                const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setUsers(usersList);
            } catch (err) {
                setError('Você não tem permissão para ver esta página.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const handlePlanChange = async (userId, newPlan) => {
        if (!window.confirm(`Tem certeza que deseja alterar o plano do usuário para ${newPlan}?`)) return;
        
        const userDocRef = doc(db, 'users', userId);
        try {
            await updateDoc(userDocRef, { plano: newPlan });
            setUsers(users.map(user => user.id === userId ? { ...user, plano: newPlan } : user));
        } catch (error) {
            console.error("Erro ao alterar o plano:", error);
            alert("Não foi possível alterar o plano.");
        }
    };
    
    const filteredUsers = users.filter(user => 
        user.email.toLowerCase().includes(filtro.toLowerCase()) || 
        (user.nome && user.nome.toLowerCase().includes(filtro.toLowerCase()))
    );

    if (isLoading) return <div className="p-8 flex justify-center"><Spinner /></div>;
    if (error) return <div className="p-8 text-center text-red-400">{error}</div>;

    return (
         <div className="p-6">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <h2 className="text-2xl font-bold">Usuários ({users.length})</h2>
                 <input 
                    type="text"
                    placeholder="Filtrar por nome ou email..."
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                    className="bg-gray-900 border border-gray-600 rounded-lg px-3 py-1.5 text-sm w-full sm:w-auto"
                />
            </div>
            <div className="overflow-x-auto bg-gray-800/50 border border-gray-700 rounded-lg">
                <table className="w-full text-left">
                    <thead className="bg-gray-700/50">
                        <tr>
                            <th className="p-4">Email</th>
                            <th className="p-4">Nome</th>
                            <th className="p-4">Plano</th>
                            <th className="p-4">Admin</th>
                            <th className="p-4 text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-700/30">
                                <td className="p-4">{user.email}</td>
                                <td className="p-4">{user.nome}</td>
                                <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.plano === 'premium' ? 'bg-green-500/30 text-green-300' : 'bg-gray-600 text-gray-200'}`}>{user.plano}</span></td>
                                <td className="p-4">{user.isAdmin ? 'Sim' : 'Não'}</td>
                                <td className="p-4 text-center">
                                    <button 
                                        onClick={() => handlePlanChange(user.id, user.plano === 'gratuito' ? 'premium' : 'gratuito')}
                                        className="text-xs font-semibold text-purple-300 hover:text-white bg-purple-600/50 hover:bg-purple-600 px-3 py-1 rounded-full transition-colors"
                                    >
                                        {user.plano === 'gratuito' ? 'Tornar Premium' : 'Tornar Gratuito'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- Subcomponente: Seção de Gerenciamento de Conteúdo ---
const EditContentModal = ({ contentData, onClose, onSave, contentKey }) => {
    const [data, setData] = useState(contentData.data);
    const [isSaving, setIsSaving] = useState(false);
    const handleChange = (e) => { const { name, value } = e.target; const finalValue = name === 'tags' || name === 'potencializar' || name === 'atencao' ? value.split(',').map(tag => tag.trim()) : value; setData(prev => ({ ...prev, [name]: finalValue })); };
    const handleSave = async () => { setIsSaving(true); await onSave(contentData.id, data); setIsSaving(false); onClose(); };
    const renderField = (key, value) => {
        if (key === 'numero' || key === 'id') return null;
        const label = key.charAt(0).toUpperCase() + key.slice(1);
        const isTextarea = key === 'desc' || key === 'descricao';
        const isArray = Array.isArray(value);
        if (isTextarea) return (<div key={key}><label className="text-sm text-gray-400">{label}</label><textarea name={key} value={value || ''} onChange={handleChange} rows="4" className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 mt-1" /></div>);
        return (<div key={key}><label className="text-sm text-gray-400">{isArray ? `${label} (separado por vírgulas)` : label}</label><input name={key} value={isArray ? (value || []).join(', ') : (value || '')} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 mt-1" /></div>);
    };
    return (<div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in p-4" onClick={onClose}><div className="bg-gray-800 text-white p-6 rounded-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}><div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold">Editando: {contentKey} (ID: {contentData.id})</h2><button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700"><XIcon className="w-5 h-5" /></button></div><div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">{Object.entries(data).map(([key, value]) => renderField(key, value))}</div><div className="flex justify-end mt-6"><button onClick={handleSave} disabled={isSaving} className="bg-purple-600 font-bold py-2 px-6 rounded-lg hover:bg-purple-700 disabled:bg-gray-600">{isSaving ? <Spinner /> : 'Salvar Alterações'}</button></div></div></div>);
};
const ContentManagementView = () => {
    const [content, setContent] = useState({});
    const [activeTab, setActiveTab] = useState('textosArcanos');
    const [isLoading, setIsLoading] = useState(true);
    const [filtro, setFiltro] = useState('');
    const [editingItem, setEditingItem] = useState(null);
    const contentKeys = [ { id: 'textosArcanos', name: 'Arcanos' }, { id: 'textosDiaPessoal', name: 'Dia Pessoal' }, { id: 'textosCiclosDeVida', name: 'Ciclos de Vida' }, { id: 'bussolaAtividades', name: 'Bússola' }, { id: 'textosTooltips', name: 'Tooltips' }];
    useEffect(() => { const fetchAllContent = async () => { try { const fetchedContent = {}; for (const key of contentKeys) { const docRef = doc(db, "textos_sistema", key.id); const docSnap = await getDoc(docRef); if (docSnap.exists()) { const data = docSnap.data(); const arrayData = Object.keys(data).map(itemKey => ({ id: itemKey, data: data[itemKey] })); fetchedContent[key.id] = arrayData; }} setContent(fetchedContent); } catch (err) { console.error("Erro:", err); } finally { setIsLoading(false); }}; fetchAllContent(); }, []);
    const handleSave = async (id, dataToSave) => { try { await updateDoc(doc(db, "textos_sistema", activeTab), { [id]: dataToSave }); setContent(prev => ({ ...prev, [activeTab]: prev[activeTab].map(item => item.id === id ? { id, data: dataToSave } : item) })); } catch (error) { console.error("Erro:", error); alert("Erro ao salvar."); }};
    const activeContent = content[activeTab] || [];
    const filteredContent = activeContent.filter(item => { const searchTerm = filtro.toLowerCase(); if (item.id.toString().includes(searchTerm)) return true; for (const key in item.data) { if (String(item.data[key]).toLowerCase().includes(searchTerm)) return true; } return false; }).sort((a, b) => { const numA = parseInt(a.id); const numB = parseInt(b.id); if (!isNaN(numA) && !isNaN(numB)) return numA - numB; return a.id.localeCompare(b.id); });
    const renderTable = () => {
        if (!activeContent.length) return <p className="p-4 text-gray-400">Nenhum conteúdo.</p>;
        const sampleItem = filteredContent[0]?.data || activeContent[0].data;
        const headers = ['ID', ...Object.keys(sampleItem)];
        return (<div className="overflow-x-auto"><table className="w-full text-left table-fixed"><thead><tr className="bg-gray-700/50"><th className="p-4 w-24 capitalize">ID</th>{headers.slice(1).map(header => <th key={header} className="p-4 capitalize">{header}</th>)}<th className="p-4 w-20 text-center">Ações</th></tr></thead><tbody>{filteredContent.map(item => (<tr key={item.id} className="border-b border-gray-700 hover:bg-gray-700/30"><td className="p-4 font-bold truncate">{item.id}</td>{Object.keys(sampleItem).map(key => (<td key={key} className="p-4 text-sm text-gray-400"><p className="whitespace-normal break-words line-clamp-3">{Array.isArray(item.data[key]) ? item.data[key].join(', ') : item.data[key]}</p></td>))}<td className="p-4 text-center"><button onClick={() => setEditingItem(item)} className="p-2 rounded-lg hover:bg-purple-600" title="Editar"><EditIcon className="w-5 h-5"/></button></td></tr>))}</tbody></table></div>);
    };
    return (
        <>{editingItem && <EditContentModal contentData={editingItem} onClose={() => setEditingItem(null)} onSave={handleSave} contentKey={contentKeys.find(c => c.id === activeTab)?.name} />}
        <div className="p-6"><h2 className="text-2xl font-bold mb-6">Gerenciamento de Conteúdo</h2><div className="flex items-center border-b border-gray-700 mb-6 overflow-x-auto">{contentKeys.map(key => (<button key={key.id} onClick={() => setActiveTab(key.id)} className={`px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors ${activeTab === key.id ? 'text-white border-b-2 border-purple-500' : 'text-gray-400 hover:text-white'}`}>{key.name}</button>))}</div><div className="bg-gray-800/50 border border-gray-700 rounded-lg"><div className="p-4 border-b border-gray-700 flex justify-between items-center flex-wrap gap-4"><h2 className="text-xl font-semibold">{contentKeys.find(c => c.id === activeTab)?.name}</h2><input type="text" placeholder="Filtrar..." value={filtro} onChange={(e) => setFiltro(e.target.value)} className="bg-gray-900 border border-gray-600 rounded-lg px-3 py-1.5 text-sm w-full sm:w-auto"/></div>{isLoading ? <div className="p-8 flex justify-center"><Spinner/></div> : renderTable()}</div></div></>
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
        <div className="p-4 md:p-8 text-white w-full h-full flex flex-col lg:flex-row gap-8">
            <aside className="lg:w-64 flex-shrink-0">
                <nav className="space-y-2">
                    {navItems.map(item => (
                        <button key={item.id} onClick={() => setActiveView(item.id)} className={`w-full flex items-center p-3 rounded-lg transition-colors text-left ${activeView === item.id ? 'bg-purple-600 text-white' : 'hover:bg-gray-800 hover:text-white'}`}>
                            {item.icon}
                            <span className="ml-3 font-medium">{item.label}</span>
                        </button>
                    ))}
                </nav>
            </aside>
            
            <main className="flex-1 bg-gray-900/50 rounded-2xl border border-gray-700 overflow-y-auto">
                {renderView()}
            </main>
        </div>
    );
};

export default AdminPanel;