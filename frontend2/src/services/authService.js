import API from './api';

export const authService = {
  login: async (email, password) => {
    try {
      const response = await API.post('/auth/login', { email, password });
      console.log('✅ Login API response:', response.data);
      
      return {
        token: response.data.token,
        user: response.data.data.user,
        bloodBank: response.data.data.bloodBank // Nouveau: données banque de sang
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || "Erreur de connexion");
    }
  },

  register: async (userData) => {
    try {
      const response = await API.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Erreur d'inscription");
    }
  },

  getProfile: async () => {
    try {
      const response = await API.get('/auth/profile');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Impossible de récupérer le profil");
    }
  },

  updateLocation: async (latitude, longitude, address = '') => {
    try {
      const response = await API.patch('/auth/location', { 
        latitude, 
        longitude, 
        address 
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Impossible de mettre à jour la localisation");
    }
  }
};