// src/AppLayout.jsx

import React, { useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Spinner from './components/ui/Spinner';
import numerologyEngine from './services/numerologyEngine';

const AppLayout = () => {
    const { userData } = useAuth();

    // Calcula os dados da numerologia.
    // useMemo garante que o cálculo pesado só aconteça se os dados essenciais mudarem.
    const numerologyData = useMemo(() => {
        // A verificação crucial: só calcule se os dados necessários existirem.
        if (userData?.nomeNascimento && userData?.dataNasc) {
            return numerologyEngine(userData.nomeNascimento, userData.dataNasc);
        }
        return null;
    }, [userData]); // Reage a qualquer mudança no objeto userData

    // ESTADO DE CARREGAMENTO:
    // Mostre o spinner se `userData` ainda não foi carregado pelo AuthContext
    // OU se `numerologyData` ainda não pôde ser calculado.
    // Com o onSnapshot, isso deve ser muito rápido.
    if (!userData || !numerologyData) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-900">
                <Spinner />
            </div>
        );
    }

    // ESTADO FINAL: Dados carregados e calculados. Renderize a aplicação.
    return (
        <div className="flex h-screen bg-gray-900 text-white">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-900 p-4 md:p-8">
                    {/* Passa os dados para o Dashboard e outras páginas */}
                    <Outlet context={{ numerologyData, userData }} />
                </main>
            </div>
        </div>
    );
};

export default AppLayout;