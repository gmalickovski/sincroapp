import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MoveIcon } from './Icons'; // Usando nosso novo ícone

const SortableCard = ({ id, children, isEditMode }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 0,
        opacity: isDragging ? 0.8 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="relative">
            {isEditMode && (
                <div 
                    {...attributes} 
                    {...listeners}
                    className="absolute top-4 right-4 z-10 p-2 bg-gray-900/50 rounded-full cursor-grab active:cursor-grabbing touch-none"
                    title="Mover card"
                >
                    <MoveIcon className="w-5 h-5 text-gray-400" />
                </div>
            )}
            {children}
        </div>
    );
};

export default SortableCard;