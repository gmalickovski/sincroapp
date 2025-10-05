import React, { useState, useEffect } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { XIcon, SparklesIcon, CheckIcon, CheckSquareIcon, SquareIcon } from './Icons';
import Spinner from './Spinner'; // Importando o componente de loading

const AISuggestionsModal = ({ isOpen, onClose, onAddSuggestions, goalTitle, goalDescription }) => {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState('');

  // Efeito que chama a IA quando o modal é aberto
  useEffect(() => {
    if (isOpen) {
      // Reseta o estado ao abrir
      setLoading(true);
      setSuggestions([]);
      setSelected([]);
      setError('');
      
      const generateMilestones = httpsCallable(getFunctions(), 'generateMilestones');
      generateMilestones({ goalTitle, goalDescription })
        .then((result) => {
          setSuggestions(result.data.milestones || []);
          setError('');
        })
        .catch((err) => {
          console.error("Erro ao chamar a Cloud Function:", err);
          setError("Não foi possível gerar as sugestões. Tente novamente.");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, goalTitle, goalDescription]);

  const handleToggleSelection = (suggestion) => {
    setSelected(prevSelected =>
      prevSelected.includes(suggestion)
        ? prevSelected.filter(s => s !== suggestion)
        : [...prevSelected, suggestion]
    );
  };

  const handleAddSelected = () => {
    onAddSuggestions(selected);
    onClose();
  };

  const handleContentClick = (e) => e.stopPropagation();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6 border border-purple-800/50 flex flex-col" onClick={handleContentClick} style={{ maxHeight: '80vh' }}>
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <SparklesIcon className="w-6 h-6 text-purple-400"/>
            <h2 className="text-xl font-bold text-white">Sugestões da IA</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><XIcon className="h-6 w-6" /></button>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
          <p className="text-sm text-gray-400 mb-4">Analisando a meta: <span className="font-bold text-gray-200">"{goalTitle}"</span></p>
          
          {loading && (
            <div className="flex flex-col items-center justify-center py-10">
              <Spinner />
              <p className="text-gray-400 mt-4">Analisando e gerando marcos...</p>
            </div>
          )}

          {error && <p className="text-red-400 text-center py-10">{error}</p>}
          
          {!loading && !error && (
            <div className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <div 
                  key={index}
                  onClick={() => handleToggleSelection(suggestion)}
                  className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${selected.includes(suggestion) ? 'bg-purple-900/50' : 'bg-gray-700/50 hover:bg-gray-700'}`}
                >
                  {selected.includes(suggestion) ? <CheckSquareIcon className="w-5 h-5 text-purple-400 mr-3"/> : <SquareIcon className="w-5 h-5 text-gray-500 mr-3"/>}
                  <span className="text-gray-200">{suggestion}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end flex-shrink-0">
          <button
            onClick={handleAddSelected}
            className="flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
            disabled={loading || selected.length === 0}
          >
            <CheckIcon className="h-5 w-5 mr-2" />
            Adicionar {selected.length > 0 ? selected.length : ''} Marco(s)
          </button>
        </div>
      </div>
    </div>
  );
};

export default AISuggestionsModal;