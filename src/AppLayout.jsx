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
    const numerologyData = useMemo(() => {
        if (userData?.isProfileComplete) {
            try {
                // Chama o motor de cálculo com os dados vindos do banco
                return numerologyEngine(userData.nomeNascimento, userData.dataNasc);
            } catch (error) {
                console.error("Erro fatal no motor de numerologia:", error);
                return null; // Retorna nulo para indicar que o cálculo falhou
            }
        }
        return null; // Retorna nulo se o perfil ainda não está completo
    }, [userData]); // A dependência é apenas o objeto userData

    // ESTADO 1: Carregando a autenticação inicial.
    if (authLoading) {
        return <div className="flex justify-center items-center h-screen bg-gray-900"><Spinner /></div>;
    }

    // ESTADO 2: Usuário carregado, mas o perfil está incompleto -> Mostrar Onboarding.
    if (userData && !userData.isProfileComplete) {
        return <OnboardingModal />;
    }
    
    // ESTADO 3: Perfil completo, mas os dados de cálculo ainda não estão prontos -> Mostrar Spinner.
    // Isso cobre o delay entre a atualização do Firestore e a re-renderização com os dados calculados.
    if (userData?.isProfileComplete && !numerologyData) {
        return <div className="flex justify-center items-center h-screen bg-gray-900"><Spinner /></div>;
    }

    // ESTADO FINAL: Tudo pronto, mostrar o aplicativo.
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