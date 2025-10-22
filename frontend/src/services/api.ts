// services/api.ts
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';

// 🔥 LA BONNE IP DE VOTRE PC
const BACKEND_URL = 'http://10.2.8.135:5000';

console.log('🎯 Backend URL:', BACKEND_URL);

const API = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Logging
API.interceptors.request.use(
  (config) => {
    console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Erreur requête:', error);
    return Promise.reject(error);
  }
);

API.interceptors.response.use(
  (response) => {
    console.log(`📥 ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ Erreur API:', error.message);

    if (error.code === 'ERR_NETWORK') {
      Alert.alert(
        'Connexion Impossible',
        `URL: ${BACKEND_URL}\n\n` +
        `Vérifiez que:\n` +
        `• Votre téléphone est sur le MÊME réseau\n` +
        `• Le firewall autorise le port 5000\n` +
        `• Le serveur backend est démarré`
      );
    }

    return Promise.reject(error);
  }
);

export const testConnection = async () => {
  try {
    console.log('🧪 Test connexion...');
    const response = await API.get('/health');
    console.log('✅ Backend accessible!');
    return { success: true, data: response.data };
  } catch (error: any) {
    console.log('❌ Backend inaccessible:', error.message);
    return { success: false, error: error.message };
  }
};

export default API;