// services/authService.ts
import API from './api';

export const authService = {
  // === USER (Donneur/Médecin) ===
  login: async (email: string, password: string) => {
    try {
      const response = await API.post('/auth/login', { email, password });
      console.log('✅ Login User response:', response.data);
      
      // 🔥 CORRECTION : Retourner les données directement
      return {
        token: response.data.token,
        user: response.data.data?.user,
        bloodBank: null
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Erreur de connexion");
    }
  },

  register: async (userData: any) => {
    try {
      const response = await API.post('/auth/register', userData);
      console.log('✅ Register User response:', response.data);
      return response;
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

  // === BLOODBANK ===
  loginBloodBank: async (email: string, password: string) => {
    try {
      const response = await API.post('/auth/bloodbank/login', { email, password });
      console.log('✅ Login BloodBank response:', response.data);
      
      // 🔥 CORRECTION : Retourner les données directement
      return {
        token: response.data.token,
        user: null,
        bloodBank: response.data.data?.bloodBank
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Erreur de connexion");
    }
  },

  registerBloodBank: async (bloodBankData: any) => {
    try {
      const response = await API.post('/auth/bloodbank/register', bloodBankData);
      console.log('✅ Register BloodBank response:', response.data);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Erreur lors de l'inscription");
    }
  },

  getBloodBankProfile: async () => {
    try {
      const response = await API.get('/auth/bloodbank/profile');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Impossible de récupérer le profil");
    }
  },
};