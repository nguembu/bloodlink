import API from './api';

export const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await API.post('/auth/login', { email, password });
      console.log('✅ Login API response:', response.data);
      
      return {
        token: response.data.token,
        user: response.data.data.user,
        bloodBank: response.data.data.bloodBank
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Erreur de connexion");
    }
  },

  register: async (userData: any) => {
    try {
      const response = await API.post('/auth/register', userData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Erreur lors de l'inscription");
    }
  },

  getProfile: async () => {
    try {
      const response = await API.get('/auth/profile');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Impossible de récupérer le profil");
    }
  },

  updateLocation: async (latitude: number, longitude: number, address: string = '') => {
    try {
      const response = await API.patch('/auth/location', { 
        latitude, 
        longitude, 
        address 
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Impossible de mettre à jour la localisation");
    }
  },

  updateFCMToken: async (fcmToken: string) => {
    try {
      const response = await API.patch('/auth/fcm-token', { fcmToken });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Impossible de mettre à jour le token FCM");
    }
  }
};