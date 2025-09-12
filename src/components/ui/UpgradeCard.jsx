import React from 'react';
import { StarIcon } from './Icons';

const UpgradeCard = ({ title, featureText }) => {
    return (
        <div className="bg-gray-800/80 backdrop-blur-lg border-2 border-dashed border-purple-500/50 rounded-2xl p-6 shadow-lg flex flex-col items-center justify-center text-center h-full">
            <StarIcon className="h-8 w-8 text-yellow-400 mb-3" />
            <h3 className="font-bold text-white mb-2">{title}</h3>
            <p className="text-sm text-gray-400 mb-4">{featureText}</p>
            <button className="bg-purple-600 text-white font-bold py-2 px-5 rounded-full hover:bg-purple-700 transition-transform hover:scale-105 text-sm">
                Seja Premium
            </button>
        </div>
    );
};

export default UpgradeCard;