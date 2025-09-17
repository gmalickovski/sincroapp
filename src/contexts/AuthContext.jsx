// src/contexts/AuthContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, updatePassword as firebaseUpdatePassword, sendEmailVerification } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() { return useContext(AuthContext); }

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setCurrentUser(user);
                const userRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(userRef);
                if (docSnap.exists()) {
                    setUserData({ uid: user.uid, ...docSnap.data() });
                } else {
                    setUserData(null);
                }
            } else {
                setCurrentUser(null);
                setUserData(null);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    function login(email, password) { return signInWithEmailAndPassword(auth, email, password); }
    function logout() { return signOut(auth); }

    // Função única e robusta para o cadastro completo
    async function signupAndCreateUser(allData) {
        const { email, password, firstName, lastName, nome, dataNasc } = allData;
        
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const userRef = doc(db, "users", user.uid);
        
        const fullDocument = {
            email: user.email,
            firstName,
            lastName,
            nome,
            dataNasc,
            isAdmin: false,
            createdAt: serverTimestamp(),
        };

        await setDoc(userRef, fullDocument);
        await sendEmailVerification(user);

        // Não atualizamos o estado local aqui. A fonte da verdade será
        // o onAuthStateChanged quando o usuário fizer login.
        return userCredential;
    }
    
    function resetPassword(email) { return sendPasswordResetEmail(auth, email); }
    function updatePassword(newPassword) { return firebaseUpdatePassword(currentUser, newPassword); }

    const value = {
        currentUser, userData, loading,
        login, logout, signupAndCreateUser,
        resetPassword, updatePassword,
    };

    return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}