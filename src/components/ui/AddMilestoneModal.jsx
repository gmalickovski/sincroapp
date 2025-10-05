import React, { useState } from 'react';
import { XIcon } from './Icons';

const AddMilestoneModal = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');

  const handleSubmit = () => {
    if (title.trim()) {
      onSave(title.trim());
      setTitle(''); // Limpa o campo
      onClose(); // Fecha o modal
    } else {
      alert('Por favor, insira um título para o marco.');
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Adicionar Novo Marco</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <XIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label htmlFor="milestone-title" className="block text-sm font-medium text-gray-300 mb-1">
              Título do Marco
            </label>
            <input
              type="text"
              id="milestone-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              placeholder="Ex: Desenvolver o layout do site"
              autoFocus
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
          >
            Salvar Marco
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddMilestoneModal;