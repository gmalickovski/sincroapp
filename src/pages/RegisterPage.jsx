// Arquivo: src/pages/RegisterPage.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import RegisterModal from '../components/ui/RegisterModal'; // Importe o Modal
import * as Icons from '../components/ui/Icons';
import SuccessModal from '../components/ui/SuccessModal'; // Importe o Modal de Sucesso

const RegisterPage = () => {
    // O RegisterModal agora controla seu próprio estado,
    // mas a página precisa saber quando mostrar o sucesso e redirecionar.
    const [showSuccess, setShowSuccess] = useState(false);
    const navigate = useNavigate();

    const handleRegistrationComplete = () => {
        // Esta função será chamada pelo RegisterModal quando o passo 3 for ativado
        setShowSuccess(true);
    };

    const handleCloseSuccessAndLogin = () => {
        setShowSuccess(false);
        navigate('/login');
    };

    return (
        <>
            {/* O Modal de Registro agora é o principal elemento da página */}
            <RegisterModal
                onClose={() => navigate('/')} // Se o usuário fechar, volta para a landing page
                onComplete={handleRegistrationComplete} // Passa a função para ser chamada no sucesso
            />
            
            {/* O Modal de Sucesso será exibido após a conclusão */}
            {showSuccess && <SuccessModal onClose={handleCloseSuccessAndLogin} />}
        </>
    );
};

// --- Pequeno ajuste necessário no RegisterModal ---
// Para que o fluxo acima funcione, seu RegisterModal.jsx precisa chamar a prop `onComplete`.
// Altere a função `handleFinalSubmit` em `src/components/ui/RegisterModal.jsx` para ficar assim:

/*
// Dentro de src/components/ui/RegisterModal.jsx

const RegisterModal = ({ onClose, onComplete }) => { // Adicione onComplete aqui
    // ... resto do seu código ...

    const handleFinalSubmit = async (e) => {
        e.preventDefault();
        if (!isStep2Valid) return;

        setLoading(true);
        setError('');
        try {
            // A função no AuthContext agora se chama signupAndCreateUser
            await signupAndCreateUser(formData);
            
            // Em vez de setStep(3), chamamos a função do pai
            if (onComplete) {
                onComplete(); 
            } else {
                setStep(3); // Mantém o comportamento original se onComplete não for passado
            }

        } catch (err) {
            // ... resto do seu catch block ...
        } finally {
            setLoading(false);
        }
    };

    // ... resto do seu código ...
}
*/


export default RegisterPage;