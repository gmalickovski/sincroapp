// src/components/ui/ScheduleMilestoneModal.jsx

import React, { useState, useEffect } from 'react';
import { CalendarIcon, CheckIcon, XIcon, RefreshCwIcon, SparklesIcon } from './Icons';

const formatDateForInput = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const ScheduleMilestoneModal = ({ isOpen, onClose, onSchedule, milestoneTitle, onAiSuggest }) => {
  const [title, setTitle] = useState(milestoneTitle);
  const [startDate, setStartDate] = useState(formatDateForInput(new Date()));
  const [isRecurrent, setIsRecurrent] = useState(false);
  const [endDate, setEndDate] = useState(formatDateForInput(new Date()));
  const [weekdays, setWeekdays] = useState({ mon: false, tue: false, wed: false, thu: false, fri: false, sat: false, sun: false });
  const daysOrder = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const daysLabels = { sun: 'D', mon: 'S', tue: 'T', wed: 'Q', thu: 'Q', fri: 'S', sat: 'S' };

  useEffect(() => {
    if (isOpen) {
      setTitle(milestoneTitle || '');
      const today = formatDateForInput(new Date());
      setStartDate(today);
      setEndDate(today);
      setIsRecurrent(false);
      setWeekdays({ mon: false, tue: false, wed: false, thu: false, fri: false, sat: false, sun: false });
    }
  }, [milestoneTitle, isOpen]);

  const handleToggleWeekday = (day) => { setWeekdays(prev => ({ ...prev, [day]: !prev[day] })); };
  const handleSchedule = () => {
    const selectedDays = Object.keys(weekdays).filter(day => weekdays[day]);
    if (title.trim() === '' || startDate === '') { alert("Título e data de início são obrigatórios."); return; }
    if (isRecurrent && new Date(endDate) < new Date(startDate)) { alert("A data de término não pode ser anterior à data de início."); return; }
    if (isRecurrent && selectedDays.length === 0) { alert("Selecione pelo menos um dia da semana para a recorrência."); return; }
    onSchedule({ title: title.trim(), startDate, isRecurrent, endDate, weekdays: selectedDays });
    onClose();
  };
  const handleContentClick = (e) => e.stopPropagation();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 border border-purple-800/50" onClick={handleContentClick}>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white">Adicionar Marcos</h2>
            <button onClick={onAiSuggest} className="p-1 rounded-full text-purple-400 hover:bg-purple-900/50 transition-colors" title="Sugerir marcos com IA"><SparklesIcon className="w-5 h-5"/></button>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><XIcon className="h-6 w-6" /></button>
        </div>
        <div className="space-y-4">
          <div><label htmlFor="milestone-title" className="block text-sm font-medium text-gray-300 mb-1">Título do Marco</label><input type="text" id="milestone-title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500" autoFocus /></div>
          <div><label htmlFor="milestone-date" className="block text-sm font-medium text-gray-300 mb-1">Data de Início</label><div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><CalendarIcon className="h-5 w-5 text-gray-400" /></span><input type="date" id="milestone-date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-gray-700/50 border border-gray-600 rounded-lg pl-10 pr-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 custom-date-input" /></div></div>
          <div className="flex items-center justify-between bg-gray-700/30 p-3 rounded-lg"><div className="flex items-center"><RefreshCwIcon className="h-5 w-5 text-purple-400 mr-3"/><span className="text-white font-medium">Tornar recorrente</span></div><label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={isRecurrent} onChange={() => setIsRecurrent(!isRecurrent)} className="sr-only peer" /><div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div></label></div>
          {isRecurrent && (<div className="space-y-4 p-4 bg-gray-900/50 rounded-lg animate-fade-in"><div><label className="block text-sm font-medium text-gray-300 mb-2">Repetir nos dias</label><div className="flex justify-between space-x-1">{daysOrder.map(day => (<button key={day} onClick={() => handleToggleWeekday(day)} className={`w-10 h-10 rounded-full text-sm font-bold transition-colors ${weekdays[day] ? 'bg-purple-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}>{daysLabels[day]}</button>))}</div></div><div><label htmlFor="end-date" className="block text-sm font-medium text-gray-300 mb-1">Data de Término</label><div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><CalendarIcon className="h-5 w-5 text-gray-400" /></span><input type="date" id="end-date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full bg-gray-700/50 border border-gray-600 rounded-lg pl-10 pr-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 custom-date-input" /></div></div></div>)}
        </div>
        <div className="mt-6 flex justify-end"><button onClick={handleSchedule} className="flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"><CheckIcon className="h-5 w-5 mr-2" />Salvar e Agendar</button></div>
      </div>
    </div>
  );
};

export default ScheduleMilestoneModal;