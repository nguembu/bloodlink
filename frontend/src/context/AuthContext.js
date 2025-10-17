import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { authService } from '../services/authService';
import API from '../services/api'; // axios instance

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

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
        API.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;

        try {
          const profileData = await authService.getProfile();
          setUser(profileData.user);
          console.log('✅ User loaded successfully');
        } catch (error) {
          console.log('❌ Token invalid, clearing...');
          await SecureStore.deleteItemAsync('authToken');
          setToken(null);
          setUser(null);
          delete API.defaults.headers.common['Authorization'];
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
      await SecureStore.deleteItemAsync('authToken');
    } finally {
      setLoading(false);
    }
  };

  const showSuccessMessage = (message) => Alert.alert('Succès', message, [{ text: 'OK' }]);
  const showErrorMessage = (message) => Alert.alert('Erreur', message, [{ text: 'OK' }]);

  const login = async (email, password, navigation) => {
    try {
      setLoading(true);

      const response = await authService.login(email, password);
      const { token: newToken, user: newUser } = response;
      console.log('🔐 Login response received', { newUser, newToken });

      if (!newToken || !newUser) {
        throw new Error('Réponse de connexion invalide');
      }

      setToken(newToken);
      setUser(newUser);

      // Synchro SecureStore + Axios
      await SecureStore.setItemAsync('authToken', newToken);
      API.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      console.log('🔐 Token stored + synced with Axios');

      showSuccessMessage('Connexion réussie ! Bienvenue sur BloodLink.');

      if (newUser.role === 'doctor') {
        navigation.navigate('DoctorDashboard');
      } else {
        navigation.navigate('DonorDashboard');
      }

      return { success: true, data: response };
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
      const { token: newToken, user: newUser } = response;

      if (!newToken || !newUser) throw new Error("Réponse d'inscription invalide : token ou user manquant");

      setToken(newToken);
      setUser(newUser);

      // synchro SecureStore + axios
      await SecureStore.setItemAsync('authToken', newToken);
      API.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      console.log('🔐 Token stored after registration + synced with Axios');

      const roleMessage = userData.role === 'doctor'
        ? 'Compte médecin créé avec succès ! Vous pouvez maintenant créer des alertes.'
        : 'Compte donneur créé avec succès ! Vous recevrez des alertes près de chez vous.';

      showSuccessMessage(roleMessage);

      if (newUser.role === 'doctor') {
        navigation.navigate('DoctorDashboard');
      } else {
        navigation.navigate('DonorDashboard');
      }

      return { success: true, data: response };
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
      delete API.defaults.headers.common['Authorization'];

      console.log('🔐 Token cleared on logout');
      navigation.navigate('Welcome');
      showSuccessMessage('Déconnexion réussie. À bientôt !');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const refreshToken = async () => {
    try {
      const profileData = await authService.getProfile();
      return { success: true, user: profileData.user };
    } catch (error) {
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
