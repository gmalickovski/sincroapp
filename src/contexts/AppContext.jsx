// src/contexts/AppContext.jsx

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, setDoc, collection, addDoc, updateDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { auth, db } from '../services/firebase';

// 1. Cria o Contexto
const AppContext = createContext(null);

// 2. Cria o componente Provedor
export function AppProvider({ children }) {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const userDocRef = doc(db, "users", currentUser.uid);

                const unsubscribeUser = onSnapshot(userDocRef, (doc) => {
                    if (doc.exists()) {
                        setUserData(doc.data());
                        setShowDetailsModal(false);
                    } else {
                        setUserData(null);
                        setShowDetailsModal(true);
                    }
                    setIsLoading(false);
                }, (error) => {
                    console.error("Erro ao ouvir dados do usuário:", error);
                    setIsLoading(false);
                });

                return () => unsubscribeUser();
            } else {
                setUser(null);
                setUserData(null);
                setIsLoading(false);
            }
        });

        return () => unsubscribeAuth();
    }, []);

    const handleSaveUserDetails = async ({ nomeAnalise, dataNasc }) => {
        if (user) {
            const displayName = user.displayName || '';
            const nameParts = displayName.split(' ');
            const primeiroNome = nameParts[0] || '';
            const sobrenome = nameParts.slice(1).join(' ') || '';
            const newUserData = { email: user.email, primeiroNome, sobrenome, nomeAnalise, dataNasc, plano: "gratuito", isAdmin: false };
            await setDoc(doc(db, "users", user.uid), newUserData);
            // O onSnapshot já vai atualizar o estado, mas podemos fazer isso manualmente para agilizar a UI
            setUserData(newUserData);
            setShowDetailsModal(false);
        }
    };

    const taskUpdater = useCallback(async (action) => {
        if (!user) return;
        const { type, payload } = action;
        const tasksRef = collection(db, 'users', user.uid, 'tasks');
        if (type === 'ADD') {
            await addDoc(tasksRef, { text: payload.text, completed: false, createdAt: Timestamp.fromDate(payload.date) });
        } else if (type === 'UPDATE') {
            const { id, ...updates } = payload;
            await updateDoc(doc(tasksRef, id), updates);
        } else if (type === 'DELETE') {
            await deleteDoc(doc(tasksRef, payload.id));
        }
    }, [user]);

    // 3. Monta o objeto de valor que será compartilhado
    const value = {
        user,
        userData,
        isLoading,
        showDetailsModal,
        handleSaveUserDetails,
        taskUpdater,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}

// 4. Cria um hook customizado para facilitar o uso do contexto
export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext deve ser usado dentro de um AppProvider');
    }
    return context;
};