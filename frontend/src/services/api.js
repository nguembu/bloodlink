import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';

// Configuration de base d'axios
const getBaseURL = () => {
  return 'http://10.185.28.40:5000/api'; // Votre IP locale
};

const API = axios.create({
  baseURL: getBaseURL(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag pour éviter les boucles de redéconnexion
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Intercepteur pour ajouter le token automatiquement
API.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('✅ Token added to request:', config.url);
      } else {
        console.log('❌ No token available for request:', config.url);
      }
    } catch (error) {
      console.error('❌ Error getting token from SecureStore:', error);
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs globales
API.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    console.error('❌ API Error:', {
      url: originalRequest?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });
    
    // Si erreur 401 et ce n'est pas une tentative de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      if (isRefreshing) {
        // Si un refresh est déjà en cours, on met la requête en attente
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = 'Bearer ' + token;
          return API(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        console.log('🔄 Attempting token refresh...');
        
        // Essayer de rafraîchir le token en récupérant le profil
        const token = await SecureStore.getItemAsync('authToken');
        if (token) {
          // Simuler un refresh en récupérant le profil
          const refreshResponse = await API.get('/auth/profile');
          if (refreshResponse.status === 200) {
            console.log('✅ Token is still valid');
            isRefreshing = false;
            processQueue(null, token);
            originalRequest.headers.Authorization = 'Bearer ' + token;
            return API(originalRequest);
          }
        }
      } catch (refreshError) {
        console.log('❌ Token refresh failed, logging out...');
        isRefreshing = false;
        processQueue(refreshError, null);
        
        // Nettoyer le token expiré
        await SecureStore.deleteItemAsync('authToken');
        
        // Afficher une alerte à l'utilisateur
        Alert.alert(
          'Session expirée',
          'Votre session a expiré. Veuillez vous reconnecter.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Vous pouvez rediriger vers l'écran de login ici
                // navigation.navigate('Login');
              }
            }
          ]
        );
        
        return Promise.reject(refreshError);
      }
    }
    
    // Pour les autres erreurs, rejeter normalement
    return Promise.reject(error);
  }
);

export default API;