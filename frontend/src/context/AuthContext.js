import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  // Charger l'utilisateur au démarrage
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync('authToken');
      console.log('🔐 Loading user, token exists:', !!storedToken);
      
      if (storedToken) {
        setToken(storedToken);
        // Vérifier si le token est encore valide en récupérant le profil
        try {
          const response = await authService.getProfile();
          setUser(response.data.data.user);
          console.log('✅ User loaded successfully');
        } catch (error) {
          console.log('❌ Token invalid, clearing...');
          // Token invalide, on nettoie
          await SecureStore.deleteItemAsync('authToken');
          setToken(null);
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
      await SecureStore.deleteItemAsync('authToken');
    } finally {
      setLoading(false);
    }
  };

  const showSuccessMessage = (message) => {
    Alert.alert('Succès', message, [{ text: 'OK' }]);
  };

  const showErrorMessage = (message) => {
    Alert.alert('Erreur', message, [{ text: 'OK' }]);
  };

  const login = async (email, password, navigation) => {
    try {
      setLoading(true);
      const response = await authService.login(email, password);
      
      const { token: newToken, data } = response.data;
      
      setToken(newToken);
      setUser(data.user);
      
      // Stocker le token
      await SecureStore.setItemAsync('authToken', newToken);
      console.log('🔐 Token stored successfully');
      
      // Message de succès
      showSuccessMessage('Connexion réussie ! Bienvenue sur BloodLink.');
      
      // Redirection selon le rôle
      if (data.user.role === 'doctor') {
        navigation.navigate('DoctorDashboard');
      } else {
        navigation.navigate('DonorDashboard');
      }
      
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Erreur de connexion';
      showErrorMessage(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData, navigation) => {
    try {
      setLoading(true);
      const response = await authService.register(userData);

      const { token: newToken, data } = response.data;
      
      setToken(newToken);
      setUser(data.user);
      
      await SecureStore.setItemAsync('authToken', newToken);
      console.log('🔐 Token stored after registration');

      // Message de succès personnalisé
      const roleMessage = userData.role === 'doctor' 
        ? 'Compte médecin créé avec succès ! Vous pouvez maintenant créer des alertes.'
        : 'Compte donneur créé avec succès ! Vous recevrez des alertes près de chez vous.';
      
      showSuccessMessage(roleMessage);
      
      // Redirection selon le rôle
      if (data.user.role === 'doctor') {
        navigation.navigate('DoctorDashboard');
      } else {
        navigation.navigate('DonorDashboard');
      }
      
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Erreur lors de l\'inscription';
      showErrorMessage(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async (navigation) => {
    try {
      setUser(null);
      setToken(null);
      await SecureStore.deleteItemAsync('authToken');
      console.log('🔐 Token cleared on logout');
      
      // Redirection vers la page d'accueil
      navigation.navigate('Welcome');
      
      showSuccessMessage('Déconnexion réussie. À bientôt !');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const refreshToken = async () => {
    try {
      const response = await authService.getProfile();
      return { success: true, user: response.data.data.user };
    } catch (error) {
      // Token invalide, déconnecter l'utilisateur
      await logout({ navigate: (route) => console.log('Should navigate to:', route) });
      return { success: false, message: 'Session expirée' };
    }
  };

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    refreshToken,
    updateUser,
    isAuthenticated: !!user && !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};