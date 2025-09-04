import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs } from "firebase/firestore";
import Spinner from '../components/ui/Spinner';

const AdminPanel = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // Referência para a coleção 'users'
                const usersCollectionRef = collection(db, 'users');
                const querySnapshot = await getDocs(usersCollectionRef);
                
                const usersList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setUsers(usersList);
            } catch (err) {
                console.error("Erro ao buscar usuários:", err);
                setError('Você não tem permissão para ver esta página. Apenas administradores podem acessar este recurso.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, []);

    if (isLoading) {
        return <div className="p-8 flex justify-center"><Spinner /></div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-400">{error}</div>;
    }

    return (
        <div className="p-8 text-white max-w-6xl mx-auto w-full">
            <h1 className="text-3xl font-bold mb-6">Painel de Administração</h1>
            
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl">
                <div className="p-4 border-b border-gray-700">
                    <h2 className="text-xl font-semibold">Usuários Cadastrados ({users.length})</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-700/50">
                            <tr>
                                <th className="p-4">Email</th>
                                <th className="p-4">Nome</th>
                                <th className="p-4">Plano</th>
                                <th className="p-4">Admin</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-700/30">
                                    <td className="p-4">{user.email}</td>
                                    <td className="p-4">{user.nome}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.plano === 'premium' ? 'bg-green-500/30 text-green-300' : 'bg-gray-600'}`}>
                                            {user.plano}
                                        </span>
                                    </td>
                                    <td className="p-4">{user.isAdmin ? 'Sim' : 'Não'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;