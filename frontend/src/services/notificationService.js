import API from './api';

export const notificationService = {
  // Obtenir l'historique des notifications
  getHistory: () => {
    return API.get('/notifications/history');
  },

  // Marquer une notification comme lue
  markAsRead: (notificationId) => {
    return API.patch(`/notifications/${notificationId}/read`);
  },

  // Mettre à jour le token FCM
  updateFCMToken: (fcmToken) => {
    return API.post('/notifications/fcm-token', { fcmToken });
  }
};