import React, { useState } from 'react';
import { BookIcon, XIcon, ChevronLeft } from './Icons'; // Importa os novos ícones
import Spinner from './Spinner';
import { db, auth } from '../../services/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import numerologyEngine from '../../services/numerologyEngine';

const CalendarActionModal = ({ day, onClose, userData }) => {
    const [showNoteField, setShowNoteField] = useState(false);
    const [noteContent, setNoteContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const formattedDate = day.date.toLocaleDateString('pt-BR', {
        weekday: 'long', day: 'numeric', month: 'long'
    });

    const handleSaveNote = async () => {
        if (noteContent.trim() === '' || !auth.currentUser || !userData?.dataNasc) {
            alert('Por favor, digite algo na anotação.');
            return;
        }

        setIsSaving(true);
        try {
            const userUid = auth.currentUser.uid;
            const personalDayForNote = numerologyEngine.calculatePersonalDayForDate(day.date, userData.dataNasc);
            
            await addDoc(collection(db, 'users', userUid, 'journalEntries'), {
                content: noteContent,
                createdAt: Timestamp.fromDate(day.date),
                personalDay: personalDayForNote,
            });

            onClose(); // Fecha o modal após salvar com sucesso
        } catch (error) {
            console.error("Erro ao salvar anotação:", error);
            alert("Erro ao salvar anotação. Tente novamente.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-gray-800 text-white p-6 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-sm text-center relative" // Adicionado 'relative' aqui
                onClick={(e) => e.stopPropagation()}
            >
                {/* Botão de Fechar (X) - Topo Direito */}
                <button 
                    onClick={onClose}
                    className="absolute top-3 right-3 p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                >
                    <XIcon className="h-5 w-5" />
                </button>

                {/* Botão de Voltar/Cancelar Anotação (Seta para Esquerda) - Topo Esquerdo */}
                {showNoteField && (
                    <button 
                        onClick={() => setShowNoteField(false)}
                        className="absolute top-3 left-3 p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                )}
                
                <span className="text-sm font-semibold text-purple-300">Vibração {day.personalDay}</span>
                <h3 className="text-xl font-bold text-white mt-1 mb-6 capitalize">{formattedDate}</h3>
                
                {!showNoteField ? (
                    <button 
                        onClick={() => setShowNoteField(true)}
                        className="w-full bg-purple-600 font-bold py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                    >
                        <BookIcon className="h-5 w-5" />
                        Adicionar Anotação Rápida
                    </button>
                ) : (
                    <div className="text-left mt-4"> {/* Ajustado margem superior */}
                        <textarea
                            value={noteContent}
                            onChange={(e) => setNoteContent(e.target.value)}
                            placeholder="Escreva sua anotação para este dia..."
                            rows="4"
                            className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-sm text-gray-200 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
                            autoFocus
                        />
                        <button 
                            onClick={handleSaveNote}
                            disabled={isSaving || noteContent.trim() === ''}
                            className="mt-3 w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center h-10"
                        >
                            {isSaving ? <Spinner /> : 'Salvar Anotação'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CalendarActionModal;