// context/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { authService } from '../services/authService';
import API from '../services/api';

interface User {
  _id: string;
  email: string;
  name: string;
  role: 'donor' | 'doctor';
  bloodType?: string;
  hospital?: string;
  phone?: string;
}

interface BloodBank {
  _id: string;
  hospitalName: string;
  address: string;
  phone: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  bloodBank: BloodBank | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string, userType: 'user' | 'bloodbank', navigation: any) => Promise<{ success: boolean; message?: string }>;
  register: (userData: any, userType: 'user' | 'bloodbank', navigation: any) => Promise<{ success: boolean; message?: string }>;
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
      const userType = await SecureStore.getItemAsync('userType');
      
      console.log('🔐 Chargement utilisateur:', { 
        tokenPresent: !!storedToken, 
        userType 
      });

      if (!storedToken) {
        console.log('🔐 Aucun token trouvé');
        setLoading(false);
        return;
      }

      setToken(storedToken);
      API.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;

      try {
        if (userType === 'bloodbank') {
          console.log('🩸 Chargement profil BloodBank...');
          const profileData = await authService.getBloodBankProfile();
          setBloodBank(profileData.data.bloodBank);
          setUser(null);
          console.log('✅ Profil BloodBank chargé');
        } else {
          console.log('👤 Chargement profil User...');
          const profileData = await authService.getProfile();
          setUser(profileData.data.user);
          setBloodBank(null);
          console.log('✅ Profil User chargé');
        }
      } catch (error: any) {
        console.log('❌ Erreur chargement profil:', error.message);
        // Nettoyer les données corrompues
        await SecureStore.deleteItemAsync('authToken');
        await SecureStore.deleteItemAsync('userType');
        setToken(null);
        setUser(null);
        setBloodBank(null);
        delete API.defaults.headers.common['Authorization'];
      }
    } catch (error) {
      console.error('Erreur chargement utilisateur:', error);
      await SecureStore.deleteItemAsync('authToken');
      await SecureStore.deleteItemAsync('userType');
    } finally {
      setLoading(false);
    }
  };

  const showSuccessMessage = (message: string) => 
    Alert.alert('Succès', message, [{ text: 'OK' }]);
  
  const showErrorMessage = (message: string) => 
    Alert.alert('Erreur', message, [{ text: 'OK' }]);

  const login = async (email: string, password: string, userType: 'user' | 'bloodbank', navigation: any) => {
    try {
      setLoading(true);
      console.log(`🔐 Tentative de connexion ${userType}:`, email);
      
      let response;
      if (userType === 'bloodbank') {
        response = await authService.loginBloodBank(email, password);
      } else {
        response = await authService.login(email, password);
      }

      const { token: newToken, user: newUser, bloodBank: newBloodBank } = response;

      if (!newToken) {
        throw new Error('Réponse de connexion invalide');
      }

      // 🔥 CORRECTION : S'assurer que c'est bien un string
      const tokenString = String(newToken);
      
      setToken(tokenString);
      setUser(newUser || null);
      setBloodBank(newBloodBank || null);

      // 🔥 CORRECTION : Sauvegarder comme strings
      await SecureStore.setItemAsync('authToken', tokenString);
      await SecureStore.setItemAsync('userType', userType);
      API.defaults.headers.common['Authorization'] = `Bearer ${tokenString}`;

      showSuccessMessage('Connexion réussie !');

      // Redirection selon le type d'utilisateur
      if (userType === 'bloodbank') {
        navigation.navigate('BloodBankDashboard');
      } else if (newUser?.role === 'doctor') {
        navigation.navigate('DoctorDashboard');
      } else if (newUser?.role === 'donor') {
        navigation.navigate('DonorDashboard');
      }

      return { success: true };
    } catch (error: any) {
      const message = error.message || 'Erreur de connexion';
      console.error('❌ Erreur connexion:', message);
      showErrorMessage(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any, userType: 'user' | 'bloodbank', navigation: any) => {
    try {
      setLoading(true);
      console.log(`📝 Tentative d'inscription ${userType}:`, userData.email);
      
      let response;
      if (userType === 'bloodbank') {
        response = await authService.registerBloodBank(userData);
      } else {
        response = await authService.register(userData);
      }

      // 🔥 CORRECTION : Extraire les données correctement
      const responseData = response.data || response;
      const newToken = responseData.token || responseData.data?.token;
      const newUser = responseData.user || responseData.data?.user;
      const newBloodBank = responseData.bloodBank || responseData.data?.bloodBank;

      if (!newToken) {
        console.error('❌ Token manquant dans la réponse:', responseData);
        throw new Error('Token manquant dans la réponse du serveur');
      }

      // 🔥 CORRECTION : Convertir en string
      const tokenString = String(newToken);
      
      setToken(tokenString);
      setUser(newUser || null);
      setBloodBank(newBloodBank || null);

      // 🔥 CORRECTION : Sauvegarder comme strings
      await SecureStore.setItemAsync('authToken', tokenString);
      await SecureStore.setItemAsync('userType', userType);
      API.defaults.headers.common['Authorization'] = `Bearer ${tokenString}`;

      const roleMessages: any = {
        doctor: 'Compte médecin créé ! Vous pouvez créer des alertes.',
        donor: 'Compte donneur créé ! Vous recevrez des alertes.',
        bloodbank: 'Compte banque de sang créé ! Vous pouvez gérer les stocks.'
      };

      showSuccessMessage(roleMessages[newUser?.role || 'bloodbank'] || 'Compte créé avec succès!');

      // Redirection
      if (userType === 'bloodbank') {
        navigation.navigate('BloodBankDashboard');
      } else if (newUser?.role === 'doctor') {
        navigation.navigate('DoctorDashboard');
      } else if (newUser?.role === 'donor') {
        navigation.navigate('DonorDashboard');
      }

      return { success: true };
    } catch (error: any) {
      const message = error.message || 'Erreur lors de l\'inscription';
      console.error('❌ Erreur inscription:', message);
      console.error('Détails erreur:', error);
      showErrorMessage(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async (navigation: any) => {
    try {
      console.log('🚪 Déconnexion...');
      setUser(null);
      setBloodBank(null);
      setToken(null);
      await SecureStore.deleteItemAsync('authToken');
      await SecureStore.deleteItemAsync('userType');
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
    isAuthenticated: !!(user || bloodBank) && !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};