// src/contexts/AuthContext.jsx

import React, { useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updatePassword as firebaseUpdatePassword // Renomeado para evitar conflito
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import Spinner from '../components/ui/Spinner';

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
          setShowDetailsModal(false);
        } else {
          // Novo usuário que precisa completar o perfil
          setUserData(null);
          setShowDetailsModal(true);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function signup(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  async function logout() {
    await signOut(auth);
    // O redirecionamento será tratado pelo componente de Rota Protegida
  }

  async function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  async function updatePassword(newPassword) {
    if (currentUser) {
      return firebaseUpdatePassword(currentUser, newPassword);
    }
    throw new Error("Nenhum usuário logado para atualizar a senha.");
  }

  async function saveUserDetails(details) {
    if (currentUser) {
      const newUserData = { 
        email: currentUser.email, 
        nome: details.nome, 
        dataNasc: details.dataNasc, 
        plano: "gratuito", 
        isAdmin: false 
      };
      await setDoc(doc(db, "users", currentUser.uid), newUserData);
      setUserData(newUserData);
      setShowDetailsModal(false);
      return newUserData;
    }
  }

  const value = {
    currentUser,
    userData,
    loading,
    showDetailsModal,
    login,
    signup,
    logout,
    resetPassword,
    updatePassword,
    saveUserDetails
  };

  // Se estiver carregando, mostra um spinner em tela cheia.
  // Isso evita que a aplicação "pisque" antes de saber se o usuário está logado.
  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <Spinner />
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}