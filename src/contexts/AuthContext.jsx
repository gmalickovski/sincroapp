import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    sendEmailVerification,
    sendPasswordResetEmail
} from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    const refreshUserData = async (userId) => {
        const userDocRef = doc(db, 'users', userId);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
            setUserData(userDocSnap.data());
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                await refreshUserData(user.uid);
            } else {
                setUserData(null);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    // Função 1: Cadastro inicial (apenas auth e dados básicos)
    async function signup(formData) {
        const { email, password, firstName, lastName } = formData;
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            email: user.email,
            nome: `${firstName} ${lastName}`,
            plano: 'gratuito',
            isAdmin: false,
            createdAt: serverTimestamp(),
            isProfileComplete: false
        });
        
        await sendEmailVerification(user);
    }
    
    // Função 2: Completar o perfil com os dados de análise
    async function completeUserProfile(uid, profileData) {
        const userDocRef = doc(db, 'users', uid);
        const dataToUpdate = {
            nomeNascimento: profileData.nomeNascimento,
            dataNasc: profileData.dataNasc,
            isProfileComplete: true
        };
        
        // Primeiro, atualiza o banco de dados
        await updateDoc(userDocRef, dataToUpdate);
        
        // *** CORREÇÃO CRÍTICA ***
        // Atualiza o estado local IMEDIATAMENTE após a escrita no banco.
        // Isso força a re-renderização do AppLayout com os dados corretos.
        setUserData(prevUserData => ({
            ...prevUserData,
            ...dataToUpdate
        }));
    }

    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    function logout() {
        return signOut(auth);
    }
    
    function resetPassword(email) {
        return sendPasswordResetEmail(auth, email);
    }

    const value = {
        currentUser,
        userData,
        loading,
        signup,
        completeUserProfile,
        login,
        logout,
        resetPassword
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}