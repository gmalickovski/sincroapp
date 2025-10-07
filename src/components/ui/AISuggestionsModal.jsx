// src/components/ui/AISuggestionsModal.jsx

import React, { useState } from 'react';
import { generateSuggestionsWithDates } from '../../services/aiService';
import { XIcon, SparklesIcon, CheckIcon, CalendarIcon, ArrowLeftIcon } from './Icons';
import Spinner from './Spinner';

const CHARACTER_LIMIT = 300;

// ### CORREÇÃO: Componentes de estado movidos para fora do componente principal ###
// Isso garante que eles não sejam recriados a cada renderização, resolvendo o bug de perda de foco.

const InitialState = ({ additionalInfo, setAdditionalInfo, onGenerate }) => (
  <div className="text-center py-4 px-2">
    <h3 className="text-lg font-semibold text-white mb-2">Quebre sua meta em marcos inteligentes</h3>
    <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
      A IA analisará seu contexto para sugerir os melhores passos e datas. Adicione detalhes para sugestões mais precisas.
    </p>
    <div className="mb-6 text-left relative">
      <label htmlFor="additional-info" className="block text-xs font-medium text-gray-400 mb-1">
        Adicionar contexto para a IA (opcional):
      </label>
      <textarea
        id="additional-info"
        value={additionalInfo}
        onChange={(e) => setAdditionalInfo(e.target.value)}
        className="w-full bg-gray-900 border-2 border-gray-700 rounded-lg p-3 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
        placeholder="Ex: Tenho 2 horas por dia, prefiro tarefas práticas, estou me sentindo desmotivado, etc."
        rows="4"
        maxLength={CHARACTER_LIMIT}
      />
      <div className="absolute bottom-2 right-2 text-xs text-gray-500">
        {additionalInfo.length} / {CHARACTER_LIMIT}
      </div>
    </div>
    <button onClick={onGenerate} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-transform hover:scale-105">
      Gerar Marcos
    </button>
  </div>
);

const LoadingState = ({ message }) => (
  <div className="flex flex-col items-center justify-center h-80">
    <Spinner />
    <p className="text-gray-300 mt-4 text-center text-sm">{message}</p>
  </div>
);

const ErrorState = ({ error, onRetry }) => (
  <div className="text-center py-8 px-4 bg-red-900/20 rounded-lg my-8">
    <h3 className="font-semibold text-red-300">Ocorreu um Erro</h3>
    <p className="text-red-400/80 text-sm mt-2 mb-4">{error}</p>
    <button onClick={onRetry} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-5 rounded-lg text-sm">
      Tentar Novamente
    </button>
  </div>
);

const SuggestionsList = ({ suggestions, selectedSuggestions, onToggleSelection, onBack, onAdd, formatDate }) => (
  <>
    <p className="text-sm text-gray-400 mb-4 px-1">Selecione os marcos que deseja adicionar à sua jornada:</p>
    <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
      {suggestions.map((s, index) => {
        const isSelected = selectedSuggestions.some(sel => sel.title === s.title && sel.date === s.date);
        return (
          <div key={index} onClick={() => onToggleSelection(s)} className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all duration-200 ${isSelected ? 'bg-purple-500/20' : 'bg-gray-700/50 hover:bg-gray-700'}`}>
            <div className={`w-6 h-6 flex-shrink-0 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${isSelected ? 'bg-purple-500 border-purple-500' : 'border-gray-500 group-hover:border-purple-400'}`}>
              {isSelected && <CheckIcon className="w-4 h-4 text-white" />}
            </div>
            <div className="flex-1">
              <span className={`font-medium ${isSelected ? 'text-white' : 'text-gray-200'}`}>{s.title}</span>
              <div className="flex items-center gap-1.5 mt-1.5 text-xs text-purple-300">
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>{formatDate(s.date)}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
    <div className="mt-8 pt-6 border-t border-gray-700 flex justify-between items-center">
      <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-white transition-colors">
        <ArrowLeftIcon className="w-4 h-4" />
        Voltar
      </button>
      <button onClick={onAdd} disabled={selectedSuggestions.length === 0} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-6 rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors">
        Adicionar {selectedSuggestions.length > 0 ? selectedSuggestions.length : ''} {selectedSuggestions.length === 1 ? 'Marco' : 'Marcos'}
      </button>
    </div>
  </>
);


const AISuggestionsModal = ({
  isOpen,
  onClose,
  onAddSuggestions,
  goalTitle,
  goalDescription,
  userBirthDate,
  onBack,
  userTasks,
  existingMilestones,
  numerologyData
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSuggestions, setSelectedSuggestions] = useState([]);
  const [error, setError] = useState(null);
  const [additionalInfo, setAdditionalInfo] = useState('');

  const isFetchingContext = userTasks === null;

  const handleGenerate = async () => {
    if (isFetchingContext) return;
    setIsLoading(true);
    setError(null);
    setSuggestions([]);
    setSelectedSuggestions([]);
    try {
      const result = await generateSuggestionsWithDates(
          goalTitle,
          goalDescription,
          userBirthDate,
          new Date(),
          additionalInfo,
          userTasks,
          existingMilestones,
          numerologyData
      );
      setSuggestions(result);
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
    handleClose();
  };
  
  const handleClose = () => {
    setSuggestions([]);
    setSelectedSuggestions([]);
    setIsLoading(false);
    setError(null);
    setAdditionalInfo('');
    onClose();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const parts = dateString.split('-');
    if (parts.length < 3) return dateString;
    const [year, month, day] = parts;
    return `${day}/${month}`;
  };

  if (!isOpen) {
    return null;
  }
  
  const renderContent = () => {
    if (error) return <ErrorState error={error} onRetry={handleGenerate} />;
    if (isLoading) return <LoadingState message="Aguarde, a IA está analisando a melhor rota..." />;
    if (isFetchingContext) return <LoadingState message="Buscando seu histórico para personalizar..." />;
    if (suggestions.length === 0) return <InitialState additionalInfo={additionalInfo} setAdditionalInfo={setAdditionalInfo} onGenerate={handleGenerate} />;
    return <SuggestionsList suggestions={suggestions} selectedSuggestions={selectedSuggestions} onToggleSelection={toggleSelection} onBack={onBack} onAdd={handleAdd} formatDate={formatDate} />;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4" onClick={handleClose}>
      <div className="bg-gray-800 rounded-2xl shadow-xl p-6 w-full max-w-lg border border-purple-800/50 h-auto max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-700 flex-shrink-0">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <SparklesIcon className="w-6 h-6 text-purple-400" />
            Sugestões da IA
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700 transition-colors">
            <XIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="overflow-y-auto custom-scrollbar -mr-2 pr-2">
            {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AISuggestionsModal;