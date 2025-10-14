import API from './api';

export const alertService = {
  // Pour les médecins
  createAlert: (alertData) => {
    console.log('📤 Creating alert:', alertData);
    return API.post('/alerts', alertData);
  },

  getMyAlerts: () => {
    console.log('📥 Fetching my alerts');
    return API.get('/alerts/my/alerts');
  },

  cancelAlert: (alertId) => {
    console.log('❌ Canceling alert:', alertId);
    return API.patch(`/alerts/${alertId}/cancel`);
  },

  fulfillAlert: (alertId) => {
    console.log('✅ Fulfilling alert:', alertId);
    return API.patch(`/alerts/${alertId}/fulfill`);
  },

  // Pour tous les utilisateurs
  getActiveAlerts: () => {
    console.log('📥 Fetching active alerts');
    return API.get('/alerts/active');
  },

  getAlert: (alertId) => {
    console.log('📥 Fetching alert:', alertId);
    return API.get(`/alerts/${alertId}`);
  },

  // Pour les donneurs
  getNearbyAlerts: (latitude, longitude, maxDistance = 50) => {
    console.log('📍 Fetching nearby alerts:', { latitude, longitude, maxDistance });
    return API.get('/donors/nearby-alerts', {
      params: { latitude, longitude, maxDistance }
    });
  },

  respondToAlert: (alertId, responseData) => {
    console.log('📝 Responding to alert:', alertId, responseData);
    return API.post(`/donors/alert/${alertId}/respond`, responseData);
  },

  getDonationHistory: () => {
    console.log('📚 Fetching donation history');
    return API.get('/donors/donation-history');
  },

  getDonorStats: () => {
    console.log('📊 Fetching donor stats');
    return API.get('/donors/stats');
  }
};