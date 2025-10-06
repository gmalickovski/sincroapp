// src/components/ui/AISuggestionsModal.jsx

import React, { useState } from 'react';
import { generateSuggestions } from '../../services/aiService';
import { XIcon, SparklesIcon, CheckIcon } from './Icons';
import Spinner from './Spinner';

const AISuggestionsModal = ({ isOpen, onClose, onAddSuggestions, goalTitle, goalDescription }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSuggestions, setSelectedSuggestions] = useState([]);

  const handleGenerate = async () => {
    setIsLoading(true);
    setSuggestions([]);
    setSelectedSuggestions([]);
    try {
      const result = await generateSuggestions(goalTitle, goalDescription);
      setSuggestions(result);
      // Pré-seleciona todas as sugestões por padrão
      setSelectedSuggestions(result);
    } catch (error) {
      console.error("Erro ao gerar sugestões:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelection = (suggestion) => {
    setSelectedSuggestions(prev => 
      prev.includes(suggestion) 
        ? prev.filter(s => s !== suggestion)
        : [...prev, suggestion]
    );
  };

  const handleAdd = () => {
    if (selectedSuggestions.length > 0) {
      onAddSuggestions(selectedSuggestions);
    }
    onClose();
  };
  
  // Limpa o estado quando o modal fecha
  const handleClose = () => {
    setSuggestions([]);
    setSelectedSuggestions([]);
    setIsLoading(false);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4" onClick={handleClose}>
      <div className="bg-gray-800 rounded-2xl shadow-xl p-6 w-full max-w-lg border border-purple-500/30" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <SparklesIcon className="w-6 h-6 text-purple-400" />
            Sugestões da IA
          </h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-white">
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        {suggestions.length === 0 && !isLoading && (
          <div className="text-center my-8">
            <p className="text-gray-400 mb-4">Quebre sua meta em marcos menores com a ajuda da IA.</p>
            <button onClick={handleGenerate} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
              Gerar Marcos
            </button>
          </div>
        )}
        
        {isLoading && (
          <div className="flex flex-col items-center justify-center my-8">
            <Spinner />
            <p className="text-gray-400 mt-4">Aguarde, a IA está criando os marcos...</p>
          </div>
        )}

        {suggestions.length > 0 && !isLoading && (
          <>
            <p className="text-sm text-gray-400 mb-4">Selecione os marcos que deseja adicionar à sua jornada:</p>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              {suggestions.map((s, index) => (
                <div 
                  key={index} 
                  onClick={() => toggleSelection(s)}
                  className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors bg-gray-700/50 hover:bg-gray-700"
                >
                  <div className={`w-5 h-5 flex-shrink-0 rounded-md border-2 flex items-center justify-center ${selectedSuggestions.includes(s) ? 'bg-purple-500 border-purple-500' : 'border-gray-500'}`}>
                    {selectedSuggestions.includes(s) && <CheckIcon className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-gray-200">{s}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button 
                onClick={handleAdd} 
                disabled={selectedSuggestions.length === 0}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                Adicionar {selectedSuggestions.length} {selectedSuggestions.length === 1 ? 'Marco' : 'Marcos'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AISuggestionsModal;