import API from './api';

export const alertService = {
  // === MÉDECINS ===
  createAlert: (alertData) => {
    console.log('📤 Médecin crée alerte:', alertData);
    return API.post('/alerts', alertData);
  },

  getMyAlerts: (filters = {}) => {
    console.log('📥 Récupération alertes médecin');
    return API.get('/alerts/my/alerts', { params: filters });
  },

  cancelAlert: (alertId) => {
    console.log('❌ Annulation alerte:', alertId);
    return API.patch(`/alerts/${alertId}/cancel`);
  },

  // === BANQUES DE SANG ===
  getBloodBankAlerts: () => {
    console.log('🏥 Récupération alertes banque de sang');
    return API.get('/alerts/bloodbank');
  },

  propagateAlert: (alertId) => {
    console.log('🔄 Propagation alerte:', alertId);
    return API.post(`/alerts/${alertId}/propagate`);
  },

  validateReception: (alertId) => {
    console.log('✅ Validation réception sang:', alertId);
    return API.patch(`/alerts/${alertId}/validate`);
  },

  notifyDonors: (alertId, radius = 10) => {
    console.log('🔔 Notification donneurs:', { alertId, radius });
    return API.post('/donors/notify', { alertId, radius });
  },

  // === DONNEURS ===
  getNearbyAlerts: (latitude, longitude, maxDistance = 50) => {
    console.log('📍 Alertes à proximité:', { latitude, longitude, maxDistance });
    return API.get('/donors/nearby-alerts', {
      params: { latitude, longitude, maxDistance }
    });
  },

  respondToAlert: (alertId, responseData) => {
    console.log('📝 Réponse à alerte:', alertId, responseData);
    return API.post(`/donors/alert/${alertId}/respond`, responseData);
  },

  getDonationHistory: () => {
    console.log('📚 Historique des dons');
    return API.get('/donors/donation-history');
  },

  getDonorStats: () => {
    console.log('📊 Statistiques donneur');
    return API.get('/donors/stats');
  }
};