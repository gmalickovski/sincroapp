// src/components/ui/EditGoalModal.jsx

import React, { useState, useEffect } from 'react';
import { XIcon, CheckIcon } from './Icons';

const EditGoalModal = ({ isOpen, onClose, onSave, goal }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (goal) {
      setTitle(goal.title);
      setDescription(goal.description);
    }
  }, [goal]);

  const handleSave = () => {
    if (title.trim() === '') {
      alert('O título da meta não pode ficar vazio.');
      return;
    }
    onSave({
      title: title.trim(),
      description: description.trim(),
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6 border border-purple-800/50" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Editar Meta</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><XIcon className="h-6 w-6" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label htmlFor="goal-title" className="block text-sm font-medium text-gray-300 mb-1">Título da Meta</label>
            <input
              type="text"
              id="goal-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Ex: Lançar meu podcast"
            />
          </div>
          <div>
            <label htmlFor="goal-description" className="block text-sm font-medium text-gray-300 mb-1">Por que essa meta é importante para você?</label>
            <textarea
              id="goal-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 h-28 resize-none"
              placeholder="Ex: Para compartilhar minhas ideias com o mundo..."
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            <CheckIcon className="h-5 w-5 mr-2" />
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditGoalModal;