// src/pages/Goals.jsx

import React, { useState, useEffect } from 'react';
// Adicionando as funções necessárias do Firebase
import { collection, onSnapshot, addDoc, doc, deleteDoc, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import CreateGoalModal from '../components/ui/CreateGoalModal';
import GoalDetail from './GoalDetail';
// Adicionando o ícone de Lixeira
import { PlusIcon, IconTarget, CalendarIcon, TrashIcon } from '../components/ui/Icons';
import Spinner from '../components/ui/Spinner';

const Goals = ({ data, userData }) => {
  const [goals, setGoals] = useState([]);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;
  
  const anoPessoal = data?.numeros?.anoPessoal;

  useEffect(() => {
    if (user) {
      const goalsColRef = collection(db, 'users', user.uid, 'goals');
      const unsubscribe = onSnapshot(goalsColRef, (snapshot) => {
        const userGoals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setGoals(userGoals);
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [user]);

  const handleSaveGoal = async (goalData) => {
    if (user) {
      const goalsColRef = collection(db, 'users', user.uid, 'goals');
      await addDoc(goalsColRef, { ...goalData, progress: 0, createdAt: new Date(), userId: user.uid });
    }
  };

  // ### NOVA FUNÇÃO: Deletar a meta e seus marcos ###
  const handleDeleteGoal = async (e, goalIdToDelete) => {
    e.stopPropagation(); // Impede que o clique no botão abra a tela de detalhes
    if (!user) return;
    
    // Mensagem de confirmação, como solicitado
    if (window.confirm("Tem certeza que deseja excluir esta meta? Todos os seus marcos e tarefas associados serão perdidos para sempre.")) {
      try {
        // 1. Encontrar e deletar todos os marcos (tasks) associados
        const tasksRef = collection(db, 'users', user.uid, 'tasks');
        const q = query(tasksRef, where('goalId', '==', goalIdToDelete));
        const querySnapshot = await getDocs(q);
        const batch = writeBatch(db);
        querySnapshot.forEach((doc) => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        
        // 2. Deletar a meta principal
        await deleteDoc(doc(db, 'users', user.uid, 'goals', goalIdToDelete));

      } catch (error) {
        console.error("Erro ao deletar meta e seus marcos:", error);
        alert("Ocorreu um erro ao tentar deletar a meta.");
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Data não definida';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (selectedGoal) {
    return <GoalDetail goal={selectedGoal} onBack={() => setSelectedGoal(null)} data={data} userData={userData} />;
  }

  return (
    <>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Minhas Metas</h1>
        </div>
        {loading ? ( <div className="flex justify-center items-center h-64"><Spinner /></div> ) : 
        goals.length === 0 ? (
          <div className="text-center bg-gray-800 p-8 rounded-lg shadow-lg mt-4">
            <IconTarget className="h-16 w-16 mx-auto text-purple-400 mb-4" />
            <h2 className="text-2xl font-semibold text-white mb-2">Defina o seu primeiro grande objetivo</h2>
            <p className="text-gray-400 mb-6">Metas são o primeiro passo para transformar o invisível em visível.</p>
            <button onClick={() => setIsModalOpen(true)} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg">Criar minha primeira meta</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map(goal => (
              <div 
                key={goal.id} 
                onClick={() => setSelectedGoal(goal)}
                className="bg-gray-800 rounded-lg shadow-lg p-5 flex flex-col justify-between cursor-pointer hover:border-purple-500 border-2 border-transparent transition-all group relative"
              >
                {/* ### BOTÃO DE EXCLUIR ADICIONADO AQUI ### */}
                <button 
                  onClick={(e) => handleDeleteGoal(e, goal.id)}
                  className="absolute top-3 right-3 p-1.5 rounded-full text-gray-500 bg-gray-800/50 hover:bg-red-500/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  title="Excluir meta"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
                
                <div>
                  <h3 className="text-xl font-bold text-white mb-2 pr-6">{goal.title}</h3>
                  <p className="text-gray-400 text-sm mb-4 h-16 overflow-hidden">{goal.description}</p>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2"><span className="text-sm font-medium text-gray-300">Progresso</span><span className="text-sm font-medium text-purple-400">{goal.progress}%</span></div>
                  <div className="w-full bg-gray-700 rounded-full h-2.5 mb-3"><div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${goal.progress}%` }}></div></div>
                  <div className="flex items-center justify-end text-xs"><CalendarIcon className="w-4 h-4 mr-1.5 text-gray-400" /><span className="text-gray-400 mr-1">Alvo:</span><span className="font-semibold text-purple-300">{formatDate(goal.targetDate)}</span></div>
                </div>
              </div>
            ))}
          </div>
        )}
        <CreateGoalModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveGoal} anoPessoal={anoPessoal} />
      </div>
      {!isModalOpen && goals.length > 0 && (
        <button onClick={() => setIsModalOpen(true)} className="fixed bottom-6 right-6 bg-purple-600 text-white rounded-full p-4 shadow-lg hover:bg-purple-700 transition-transform hover:scale-110" aria-label="Criar Nova Meta">
          <PlusIcon className="w-7 h-7" />
        </button>
      )}
    </>
  );
};

export default Goals;