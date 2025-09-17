import React, { useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import { useAuth } from './contexts/AuthContext';
import OnboardingModal from './components/ui/OnboardingModal';
import numerologyEngine from './services/numerologyEngine';
import Spinner from './components/ui/Spinner';

const AppLayout = () => {
    const { userData, loading: authLoading } = useAuth();

    // useMemo garante que o motor de cálculo só rode quando os dados do usuário mudarem.
    // Esta é a forma correta de conectar os dados do AuthContext ao motor.
    const numerologyData = useMemo(() => {
        // Se o perfil está completo, rodamos o cálculo.
        if (userData?.isProfileComplete) {
            try {
                return numerologyEngine(userData.nomeNascimento, userData.dataNasc);
            } catch (error) {
                console.error("Erro ao executar o motor de numerologia:", error);
                return null; // Em caso de erro, evitamos que o app quebre.
            }
        }
        // Se o perfil não está completo, não há dados para calcular.
        return null;
    }, [userData]);

    // ESTADO 1: Se a autenticação inicial ainda está carregando.
    if (authLoading) {
        return <div className="flex justify-center items-center h-screen bg-gray-900"><Spinner /></div>;
    }

    // ESTADO 2: Se o usuário está logado, mas o perfil está incompleto, mostramos o onboarding.
    // O 'onComplete' agora está vazio, pois o 'AuthContext' vai forçar a re-renderização desta página.
    if (userData && !userData.isProfileComplete) {
        return <OnboardingModal onComplete={() => {}} />;
    }

    // ESTADO 3: Se o perfil está completo, mas os cálculos ainda não foram gerados
    // (cobrindo o pequeno delay entre a atualização do banco e a renderização).
    if (userData?.isProfileComplete && !numerologyData) {
         return <div className="flex justify-center items-center h-screen bg-gray-900"><Spinner /></div>;
    }

    // ESTADO FINAL: Se tudo estiver pronto, mostramos o app.
    return (
        <div className="flex h-screen bg-gray-900 text-white">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-900 p-4 md:p-6">
                    <Outlet context={{ numerologyData }} />
                </main>
            </div>
        </div>
    );
};

export default AppLayout;