import React, { useState, useEffect } from 'react';

const CookieBanner = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('sincro_cookie_consent');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('sincro_cookie_consent', 'true');
        setIsVisible(false);
    };

    if (!isVisible) {
        return null;
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-800/90 backdrop-blur-sm border-t border-gray-700 p-4 z-[100] animate-fade-in">
            <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-gray-300 text-center sm:text-left">
                    Utilizamos cookies essenciais para garantir o bom funcionamento do site, como manter sua sessão ativa. Ao continuar navegando, você concorda com nosso uso de cookies.
                </p>
                <button 
                    onClick={handleAccept}
                    className="bg-purple-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-purple-700 transition-colors flex-shrink-0"
                >
                    Entendi
                </button>
            </div>
        </div>
    );
};

export default CookieBanner;