import React, { useState } from 'react';
import { XIcon, InfoIcon } from './Icons';

const CreateGoalModal = ({ isOpen, onClose, onSave, anoPessoal }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');

  const handleSubmit = () => {
    if (title && targetDate) {
      onSave({
        title,
        description,
        targetDate,
      });
      setTitle('');
      setDescription('');
      setTargetDate('');
      onClose();
    } else {
      alert('Por favor, preencha pelo menos o título e a data alvo.');
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Criar Nova Meta</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <XIcon className="h-6 w-6" />
          </button>
        </div>
        
        {anoPessoal && anoPessoal.numero && (
          <div className="bg-purple-900/50 border border-purple-700/50 rounded-lg p-3 mb-4 flex items-start space-x-3">
            <InfoIcon className="h-5 w-5 text-purple-300 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-purple-200">Sincronize com sua jornada!</h4>
              <p className="text-sm text-purple-300">
                Você está em um <span className="font-bold">Ano Pessoal {anoPessoal.numero}</span>. {anoPessoal.descricaoCurta}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="goal-title" className="block text-sm font-medium text-gray-300 mb-1">
              Título da Meta
            </label>
            <input
              type="text"
              id="goal-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              placeholder="Ex: Lançar meu e-commerce"
            />
          </div>
          <div>
            <label htmlFor="goal-description" className="block text-sm font-medium text-gray-300 mb-1">
              Descrição (O seu "porquê")
            </label>
            <textarea
              id="goal-description"
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              placeholder="Descreva o que te motiva a alcançar esta meta."
            ></textarea>
          </div>
          <div>
            <label htmlFor="goal-date" className="block text-sm font-medium text-gray-300 mb-1">
              Data Alvo
            </label>
            <input
              type="date"
              id="goal-date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500 custom-date-input"
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
            Salvar Meta
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGoalModal;