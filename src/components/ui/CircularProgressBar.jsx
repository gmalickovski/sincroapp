import React from 'react';

const CircularProgressBar = ({ progress = 0, size = 120, strokeWidth = 10, children }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    // Garante que o progresso nunca seja menor que 0 ou maior que 100
    const safeProgress = Math.max(0, Math.min(100, progress));
    const offset = circumference - (safeProgress / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
                {/* Círculo de fundo */}
                <circle
                    stroke="#374151" // gray-700
                    fill="transparent"
                    strokeWidth={strokeWidth}
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                {/* Círculo de progresso */}
                <circle
                    className="text-purple-500"
                    stroke="currentColor"
                    fill="transparent"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                    style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
                />
            </svg>
            {/* Conteúdo centralizado (porcentagem + textos filhos) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-2">
                <span className="text-3xl font-bold tracking-tight">
                    {`${Math.round(safeProgress)}%`}
                </span>
                {/* Os textos customizados são renderizados aqui */}
                {children}
            </div>
        </div>
    );
};

export default CircularProgressBar;