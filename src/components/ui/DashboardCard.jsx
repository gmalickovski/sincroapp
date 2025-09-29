import React from 'react';

// Este componente recebe propriedades (props) como título, ícone e o conteúdo (children)
// para criar um cartão de forma consistente.
const DashboardCard = ({ title, icon, children, className = '' }) => (
    <div className={`bg-gray-800/80 backdrop-blur-lg border border-gray-700 rounded-2xl p-6 shadow-lg ${className}`}>
        <div className="flex items-center text-gray-300 mb-4">
            {/* O ícone é opcional e é renderizado aqui se for passado como prop */}
            {icon && React.cloneElement(icon, { className: "h-6 w-6 mr-3 text-purple-400" })}
            <h3 className="font-bold text-white">{title}</h3>
        </div>
        {/* 'children' é onde o conteúdo específico de cada cartão será inserido */}
        <div>{children}</div>
    </div>
);

export default DashboardCard;
