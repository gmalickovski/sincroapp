// src/components/ui/AISuggestionsModal.jsx

import React, { useState } from 'react';
// ### ALTERAÇÃO 1: Usar a nova função do aiService ###
import { generateSuggestionsWithDates } from '../../services/aiService';
import { XIcon, SparklesIcon, CheckIcon, CalendarIcon } from './Icons';
import Spinner from './Spinner';

// ### ALTERAÇÃO 2: Receber mais props para o contexto da IA ###
const AISuggestionsModal = ({ isOpen, onClose, onAddSuggestions, goalTitle, goalDescription, userBirthDate }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSuggestions, setSelectedSuggestions] = useState([]);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setSuggestions([]);
    setSelectedSuggestions([]);
    try {
      const result = await generateSuggestionsWithDates(goalTitle, goalDescription, userBirthDate, new Date());
      setSuggestions(result);
      // Pré-seleciona todas as sugestões por padrão
      setSelectedSuggestions(result);
    } catch (err) {
      console.error("Erro ao gerar sugestões:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelection = (suggestion) => {
    setSelectedSuggestions(prev => {
      const isSelected = prev.some(s => s.title === suggestion.title && s.date === suggestion.date);
      if (isSelected) {
        return prev.filter(s => s.title !== suggestion.title || s.date !== suggestion.date);
      } else {
        return [...prev, suggestion];
      }
    });
  };

  const handleAdd = () => {
    if (selectedSuggestions.length > 0) {
      onAddSuggestions(selectedSuggestions);
    }
    handleClose(); // Usar handleClose para limpar o estado
  };
  
  const handleClose = () => {
    setSuggestions([]);
    setSelectedSuggestions([]);
    setIsLoading(false);
    setError(null);
    onClose();
  };

  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}`;
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

        {error && (
            <div className="text-center my-8 bg-red-900/50 p-4 rounded-lg">
                <p className="text-red-300">Houve um erro: {error}</p>
                <button onClick={handleGenerate} className="mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                    Tentar Novamente
                </button>
            </div>
        )}

        {suggestions.length === 0 && !isLoading && !error && (
          <div className="text-center my-8">
            <p className="text-gray-400 mb-4">Quebre sua meta em marcos menores com a ajuda da IA. Ela também sugerirá as melhores datas!</p>
            <button onClick={handleGenerate} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
              Gerar Marcos Inteligentes
            </button>
          </div>
        )}
        
        {isLoading && (
          <div className="flex flex-col items-center justify-center my-8">
            <Spinner />
            <p className="text-gray-400 mt-4 text-center">Aguarde, a IA está analisando a melhor rota para sua meta...</p>
          </div>
        )}

        {suggestions.length > 0 && !isLoading && !error && (
          <>
            <p className="text-sm text-gray-400 mb-4">Selecione os marcos que deseja adicionar à sua jornada:</p>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
              {suggestions.map((s, index) => {
                const isSelected = selectedSuggestions.some(sel => sel.title === s.title && sel.date === s.date);
                return (
                  <div 
                    key={index} 
                    onClick={() => toggleSelection(s)}
                    className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors bg-gray-700/50 hover:bg-gray-700"
                  >
                    <div className={`w-5 h-5 flex-shrink-0 rounded-md border-2 flex items-center justify-center ${isSelected ? 'bg-purple-500 border-purple-500' : 'border-gray-500'}`}>
                      {isSelected && <CheckIcon className="w-3 h-3 text-white" />}
                    </div>
                    {/* ### ALTERAÇÃO 3: Exibir o marco e a data sugerida ### */}
                    <div className="flex-1">
                        <span className="text-gray-200">{s.title}</span>
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-purple-300">
                           <CalendarIcon className="w-3 h-3" />
                           <span>{formatDate(s.date)}</span>
                        </div>
                    </div>
                  </div>
                )
              })}
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