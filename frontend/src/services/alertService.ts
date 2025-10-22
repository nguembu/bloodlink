import API from './api';

export const alertService = {
  // === MÉDECINS ===
  createAlert: (alertData: any) => {
    console.log('📤 Médecin crée alerte:', alertData);
    return API.post('/alerts', alertData);
  },

  getMyAlerts: () => {
    console.log('📥 Récupération alertes médecin');
    return API.get('/alerts/doctor');
  },

  // === BANQUES DE SANG ===
  getBloodBankAlerts: () => {
    console.log('🏥 Récupération alertes banque de sang');
    return API.get('/alerts/bloodbank');
  },

  notifyDonors: (alertId: string, radius: number = 10) => {
    console.log('🔔 Notification donneurs:', { alertId, radius });
    return API.post('/alerts/notify-donors', { alertId, radius });
  },

  // === DONNEURS ===
  getNearbyAlerts: (latitude: number, longitude: number, maxDistance: number = 50) => {
    console.log('📍 Alertes à proximité:', { latitude, longitude, maxDistance });
    return API.get('/donors/nearby-alerts', {
      params: { latitude, longitude, maxDistance }
    });
  },

  respondToAlert: (alertId: string, responseData: any) => {
    console.log('📝 Réponse à alerte:', alertId, responseData);
    return API.post(`/alerts/${alertId}/respond`, responseData);
  },

  getDonorStats: () => {
    console.log('📊 Statistiques donneur');
    return API.get('/donors/stats');
  }
};