// frontend/services/api.ts
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';

// =============================
// 🌍 Configuration Backend
// =============================

// 💡 Met automatiquement la bonne URL selon l’environnement
const BACKEND_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://bloodlink-backend-ytdc.onrender.com' // 🔗 URL Render (hébergée)
    : 'http://192.168.1.100:5000'; // 🖥️ Ton IP locale quand tu testes en réseau local

console.log('🎯 Backend URL utilisée :', BACKEND_URL);

// =============================
// ⚙️ Création de l’instance Axios
// =============================
const API = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// =============================
// 📡 Intercepteurs (Logs)
// =============================
API.interceptors.request.use(
  (config) => {
    console.log(`📤 [${config.method?.toUpperCase()}] ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Erreur requête Axios :', error);
    return Promise.reject(error);
  }
);

API.interceptors.response.use(
  (response) => {
    console.log(`📥 [${response.status}] ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ Erreur API :', error.message);

    // Message d’erreur clair selon le cas
    if (error.code === 'ERR_NETWORK') {
      const message =
        process.env.NODE_ENV === 'production'
          ? `Le serveur distant (${BACKEND_URL}) est injoignable.\n\nVérifie que le backend Render est bien démarré.`
          : `Le backend local (${BACKEND_URL}) est injoignable.\n\nAssure-toi que :
• Le backend tourne (npm start)
• Le téléphone est sur le MÊME réseau Wi-Fi
• Le port 5000 est ouvert`;

      Alert.alert('🌐 Connexion impossible', message);
    }

    return Promise.reject(error);
  }
);

// =============================
// 🧪 Test de connexion
// =============================
export const testConnection = async () => {
  try {
    console.log('🧪 Test de connexion au backend...');
    const response = await API.get('/health');
    console.log('✅ Backend accessible !');
    return { success: true, data: response.data };
  } catch (error: any) {
    console.log('❌ Backend inaccessible :', error.message);
    return { success: false, error: error.message };
  }
};

export default API;
