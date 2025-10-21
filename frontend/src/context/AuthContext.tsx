import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { authService } from '../services/authService';
import API from '../services/api';

interface User {
  _id: string;
  email: string;
  name: string;
  role: 'donor' | 'doctor' | 'bloodbank';
  bloodType?: string;
  hospital?: string;
  phone?: string;
}

interface BloodBank {
  _id: string;
  hospitalName: string;
  address: string;
  phone: string;
}

interface AuthContextType {
  user: User | null;
  bloodBank: BloodBank | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string, navigation: any) => Promise<{ success: boolean; message?: string }>;
  register: (userData: any, navigation: any) => Promise<{ success: boolean; message?: string }>;
  logout: (navigation: any) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [bloodBank, setBloodBank] = useState<BloodBank | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync('authToken');
      console.log('🔐 Chargement utilisateur, token présent:', !!storedToken);

      if (storedToken) {
        setToken(storedToken);
        API.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;

        try {
          const profileData = await authService.getProfile();
          setUser(profileData.data.user);
          setBloodBank(profileData.data.bloodBank || null);
          console.log('✅ Utilisateur chargé avec succès');
        } catch (error) {
          console.log('❌ Token invalide, nettoyage...');
          await SecureStore.deleteItemAsync('authToken');
          setToken(null);
          setUser(null);
          setBloodBank(null);
          delete API.defaults.headers.common['Authorization'];
        }
      }
    } catch (error) {
      console.error('Erreur chargement utilisateur:', error);
      await SecureStore.deleteItemAsync('authToken');
    } finally {
      setLoading(false);
    }
  };

  const showSuccessMessage = (message: string) => 
    Alert.alert('Succès', message, [{ text: 'OK' }]);
  
  const showErrorMessage = (message: string) => 
    Alert.alert('Erreur', message, [{ text: 'OK' }]);

  const login = async (email: string, password: string, navigation: any) => {
    try {
      setLoading(true);
      const response = await authService.login(email, password);
      const { token: newToken, user: newUser, bloodBank: newBloodBank } = response;

      if (!newToken || !newUser) {
        throw new Error('Réponse de connexion invalide');
      }

      setToken(newToken);
      setUser(newUser);
      setBloodBank(newBloodBank || null);

      await SecureStore.setItemAsync('authToken', newToken);
      API.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      showSuccessMessage('Connexion réussie !');

      // Redirection selon le rôle
      if (newUser.role === 'doctor') {
        navigation.navigate('DoctorDashboard');
      } else if (newUser.role === 'donor') {
        navigation.navigate('DonorDashboard');
      } else if (newUser.role === 'bloodbank') {
        navigation.navigate('BloodBankDashboard');
      }

      return { success: true };
    } catch (error: any) {
      const message = error.message || 'Erreur de connexion';
      showErrorMessage(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any, navigation: any) => {
    try {
      setLoading(true);
      const response = await authService.register(userData);
      const { token: newToken, user: newUser, bloodBank: newBloodBank } = response.data;

      setToken(newToken);
      setUser(newUser);
      setBloodBank(newBloodBank || null);

      await SecureStore.setItemAsync('authToken', newToken);
      API.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      const roleMessages: any = {
        doctor: 'Compte médecin créé ! Vous pouvez créer des alertes.',
        donor: 'Compte donneur créé ! Vous recevrez des alertes.',
        bloodbank: 'Compte banque de sang créé ! Vous pouvez gérer les stocks.'
      };

      showSuccessMessage(roleMessages[newUser.role] || 'Compte créé avec succès!');

      // Redirection selon le rôle
      if (newUser.role === 'doctor') {
        navigation.navigate('DoctorDashboard');
      } else if (newUser.role === 'donor') {
        navigation.navigate('DonorDashboard');
      } else if (newUser.role === 'bloodbank') {
        navigation.navigate('BloodBankDashboard');
      }

      return { success: true };
    } catch (error: any) {
      const message = error.message || 'Erreur lors de l\'inscription';
      showErrorMessage(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async (navigation: any) => {
    try {
      setUser(null);
      setBloodBank(null);
      setToken(null);
      await SecureStore.deleteItemAsync('authToken');
      delete API.defaults.headers.common['Authorization'];

      navigation.navigate('Welcome');
      showSuccessMessage('Déconnexion réussie.');
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
  };

  const value: AuthContextType = {
    user,
    bloodBank,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user && !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};