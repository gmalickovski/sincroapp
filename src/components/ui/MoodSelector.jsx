// src/components/ui/MoodSelector.jsx

import React from 'react';

const moods = [
  { id: 1, emoji: '😔', label: 'Péssimo' },
  { id: 2, emoji: '😟', label: 'Ruim' },
  { id: 3, emoji: '😐', label: 'Normal' },
  { id: 4, emoji: '😊', label: 'Bom' },
  { id: 5, emoji: '😄', label: 'Ótimo' },
];

const MoodSelector = ({ selectedMood, onMoodSelect }) => {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      {moods.map((mood) => (
        <button
          key={mood.id}
          type="button"
          onClick={() => onMoodSelect(mood.id)}
          className={`relative group p-2 rounded-full transition-all duration-200 ease-in-out focus:outline-none ${
            selectedMood === mood.id
              ? 'bg-purple-600/50 scale-125'
              : 'hover:bg-gray-700'
          }`}
          aria-label={mood.label}
        >
          <span className="text-2xl">{mood.emoji}</span>
          {/* Tooltip para instruir o usuário */}
          <div className="absolute bottom-full mb-2 w-max px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            {mood.label}
          </div>
        </button>
      ))}
    </div>
  );
};

export default MoodSelector;