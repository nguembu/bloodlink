import API from './api';

let mockUsers = [];
let mockAlerts = [];

export const authService = {
  login: async (email, password) => {
    if (!email || !password) {
      throw new Error("Email et mot de passe requis");
    }

    try {
      const response = await API.post('/auth/login', { email, password });
      console.log('✅ Login API response:', response.data);

      // Ici je récupère directement le user et le token depuis l’API
      const token = response?.data?.token;
      const user = response?.data?.data?.user;

      // (optionnel) je garde un historique côté front
      mockUsers.push({
        ...user,
        _id: user?._id || Date.now().toString(),
        createdAt: user?.createdAt || new Date()
      });
      console.log('📝 Mock Users History:', {user, token});

      return {
        status: 'success',
        token,
        user
      };
    } catch (error) {
      console.log('❌ Login error:', error);
      throw new Error(error.response?.data?.message || "Une erreur est survenue lors de la connexion");
    }
  },

  register: async (userData) => {
    if (!userData.email || !userData.password) {
      throw new Error("Email et mot de passe requis");
    }

    try {
      const response = await API.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Une erreur est survenue lors de l'inscription");
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

  updateProfile: async (profileData) => {
    try {
      const response = await API.put('/auth/profile', profileData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Impossible de mettre à jour le profil");
    }
  },

  updateLocation: async (locationData) => {
    try {
      const response = await API.post('/auth/location', locationData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Impossible de mettre à jour la localisation");
    }
  },

  updateFCMToken: async (fcmToken) => {
    try {
      const response = await API.post('/auth/fcm-token', { fcmToken });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Impossible de mettre à jour le token FCM");
    }
  },

  logout: async () => {
    try {
      const response = await API.post('/auth/logout');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Impossible de se déconnecter");
    }
  }
};
