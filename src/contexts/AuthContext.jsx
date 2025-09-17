// src/contexts/AuthContext.jsx

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
import { doc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubscribeFromSnapshot = () => {};

        const unsubscribeFromAuth = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            if (user) {
                const userDocRef = doc(db, 'users', user.uid);
                unsubscribeFromSnapshot = onSnapshot(userDocRef, (docSnap) => {
                    if (docSnap.exists()) {
                        setUserData(docSnap.data());
                    } else {
                        setUserData(null);
                    }
                    setLoading(false);
                }, (error) => {
                    console.error("Erro ao ouvir dados do usuário:", error);
                    setUserData(null);
                    setLoading(false);
                });
            } else {
                unsubscribeFromSnapshot();
                setUserData(null);
                setLoading(false);
            }
        });

        return () => {
            unsubscribeFromAuth();
            unsubscribeFromSnapshot();
        };
    }, []);

    async function signupAndCreateUser(formData) {
        const { email, password, firstName, lastName, nomeNascimento, dataNasc } = formData;
        
        // --- AQUI ESTÁ A CORREÇÃO CRÍTICA DA DATA ---
        // Converte a data de "YYYY-MM-DD" para "DD/MM/YYYY"
        const [ano, mes, dia] = dataNasc.split('-');
        const dataNascFormatada = `${dia}/${mes}/${ano}`;
        // ---------------------------------------------

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const userProfile = {
            uid: user.uid,
            email: user.email,
            nome: `${firstName} ${lastName}`,
            nomeNascimento: nomeNascimento,
            dataNasc: dataNascFormatada, // Salva a data já no formato correto
            plano: 'gratuito',
            isAdmin: false,
            createdAt: serverTimestamp(),
            isProfileComplete: true 
        };

        await setDoc(doc(db, "users", user.uid), userProfile);
        await sendEmailVerification(user);
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
        signupAndCreateUser,
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