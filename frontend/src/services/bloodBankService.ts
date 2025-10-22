import API from './api';

export const bloodBankService = {
  updateInventory: (bloodType: string, quantity: number) => {
    console.log('🩸 Mise à jour inventaire:', { bloodType, quantity });
    return API.patch('/bloodbanks/inventory', { bloodType, quantity });
  },

  getInventory: () => {
    console.log('📦 Récupération inventaire');
    return API.get('/bloodbanks/inventory');
  },

  getProfile: () => {
    console.log('🏥 Récupération profil banque de sang');
    return API.get('/bloodbanks/profile');
  },

  findNearbyBloodBanks: (latitude: number, longitude: number, maxDistance: number = 50) => {
    console.log('📍 Banques de sang à proximité:', { latitude, longitude, maxDistance });
    return API.get('/bloodbanks/nearby', {
      params: { latitude, longitude, maxDistance }
    });
  }
};