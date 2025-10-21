import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';

const API = axios.create({
  baseURL: 'http://192.168.88.155:5000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token automatiquement
API.interceptors.request.use(
  async (config: any) => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('✅ Token added to request:', config.url);
      }
    } catch (error) {
      console.error('Error getting token from SecureStore:', error);
    }
    return config;
  },
  (error: any) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs globales
API.interceptors.response.use(
  (response: any) => {
    console.log('✅ API Response:', response.status, response.config.url);
    return response;
  },
  async (error: any) => {
    console.error('❌ API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });
    
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('authToken');
      Alert.alert('Session expirée', 'Votre session a expiré. Veuillez vous reconnecter.');
    }
    
    if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      Alert.alert('Erreur de connexion', 'Impossible de se connecter au serveur.');
    }
    
    return Promise.reject(error);
  }
);

export default API;