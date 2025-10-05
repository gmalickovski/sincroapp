import React from 'react';
import { SparklesIcon } from './Icons';
import { textosDescritivos } from '../../data/content'; // 1. Importa a fonte dos textos

const DicaDoDiaCard = ({ personalDayNumber, className = '' }) => {
  // 2. Se não receber um número, o card não é renderizado.
  if (!personalDayNumber) {
    return null;
  }

  // 3. Usa o número recebido para buscar o objeto de texto correspondente.
  const infoDia = textosDescritivos.diaPessoal[personalDayNumber] || textosDescritivos.diaPessoal.default;

  const finalClasses = `bg-gray-800/70 border border-purple-800/50 rounded-2xl p-6 flex flex-col justify-center ${className}`.trim();

  return (
    <div className={finalClasses}>
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <SparklesIcon className="h-6 w-6 text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Sincronize com o Hoje</h3>
          {/* 4. Monta a frase final usando as informações buscadas */}
          <p className="text-sm text-gray-300 mt-1">
            Hoje a vibração é do <span className="font-bold text-purple-300">Dia Pessoal {personalDayNumber}</span> ({infoDia.titulo}). {infoDia.descricaoCurta}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DicaDoDiaCard;