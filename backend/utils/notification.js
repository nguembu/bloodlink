const User = require('../models/User');
const Notification = require('../models/Notification');

// Types de notifications
const NOTIFICATION_TYPES = {
  NEW_ALERT: 'NEW_ALERT',
  ALERT_CANCELLED: 'ALERT_CANCELLED',
  DONATION_CONFIRMED: 'DONATION_CONFIRMED',
  DONOR_ACCEPTED: 'DONOR_ACCEPTED'
};

// Envoyer une notification push (version simulée pour le développement)
const sendPushNotification = async (user, alert, type = NOTIFICATION_TYPES.NEW_ALERT) => {
  try {
    if (!user.fcmToken) {
      console.log(`User ${user.email} has no FCM token`);
      return false;
    }

    let title, body;

    switch (type) {
      case NOTIFICATION_TYPES.NEW_ALERT:
        title = '🚨 Besoin urgent de sang';
        body = `Urgence ${alert.bloodType} à ${alert.hospital} - ${getUrgencyText(alert.urgency)}`;
        break;
      
      case NOTIFICATION_TYPES.ALERT_CANCELLED:
        title = '✅ Alerte annulée';
        body = `L'urgence ${alert.bloodType} à ${alert.hospital} a été résolue`;
        break;
      
      case NOTIFICATION_TYPES.DONOR_ACCEPTED:
        title = '👍 Donneur disponible';
        body = `${user.name} a accepté votre alerte ${alert.bloodType}`;
        break;
      
      default:
        title = 'BloodLink Notification';
        body = 'Nouvelle mise à jour';
    }

    // En développement, on simule l'envoi
    console.log(`📤 [DEV] Notification envoyée à ${user.email}:`, {
      title,
      body,
      type
    });

    // Sauvegarder la notification dans MongoDB
    await Notification.create({
      user: user._id,
      alert: alert._id,
      type,
      title,
      body,
      data: {
        alertId: alert._id.toString(),
        type,
        bloodType: alert.bloodType,
        hospital: alert.hospital
      },
      status: 'sent'
    });

    return true;
  } catch (error) {
    console.error('Error sending push notification:', error);
    
    // Sauvegarder l'échec
    await Notification.create({
      user: user._id,
      alert: alert._id,
      type,
      title,
      body,
      status: 'failed',
      error: error.message
    });
    
    return false;
  }
};

// Notifier plusieurs utilisateurs
const notifyUsers = async (users, alert, type = NOTIFICATION_TYPES.NEW_ALERT) => {
  const results = await Promise.allSettled(
    users.map(user => sendPushNotification(user, alert, type))
  );

  const successful = results.filter(result => result.status === 'fulfilled' && result.value).length;
  const failed = results.length - successful;

  console.log(`📊 Notifications: ${successful} envoyées, ${failed} échecs`);

  return {
    successful,
    failed,
    total: results.length
  };
};

// Notifier les donneurs compatibles
const notifyCompatibleDonors = async (alert) => {
  try {
    // Trouver tous les donneurs avec le même groupe sanguin dans le rayon
    const donors = await User.find({
      role: 'donor',
      bloodType: alert.bloodType,
      isActive: true,
      fcmToken: { $exists: true, $ne: null }
    });

    console.log(`🎯 ${donors.length} donneurs ${alert.bloodType} trouvés pour notification`);

    if (donors.length > 0) {
      const result = await notifyUsers(donors, alert, NOTIFICATION_TYPES.NEW_ALERT);
      console.log(`✅ ${result.successful} donneurs notifiés pour l'alerte ${alert._id}`);
      return result;
    }

    return { successful: 0, failed: 0, total: 0 };
  } catch (error) {
    console.error('Error notifying compatible donors:', error);
    throw error;
  }
};

// Mettre à jour le token FCM
const updateFCMToken = async (userId, fcmToken) => {
  try {
    await User.findByIdAndUpdate(userId, { fcmToken });
    console.log(`FCM token updated for user ${userId}`);
    return true;
  } catch (error) {
    console.error('Error updating FCM token:', error);
    return false;
  }
};

// Récupérer l'historique des notifications
const getNotificationHistory = async (userId, limit = 50) => {
  try {
    return await Notification.find({ user: userId })
      .populate('alert', 'bloodType hospital urgency')
      .sort({ createdAt: -1 })
      .limit(limit);
  } catch (error) {
    console.error('Error getting notification history:', error);
    return [];
  }
};

// Marquer une notification comme lue
const markAsRead = async (notificationId) => {
  try {
    await Notification.findByIdAndUpdate(notificationId, { read: true });
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
};

// Helper function
const getUrgencyText = (urgency) => {
  const texts = {
    low: 'Faible urgence',
    medium: 'Urgence moyenne',
    high: 'Haute urgence',
    critical: 'URGENCE CRITIQUE'
  };
  return texts[urgency] || 'Urgence';
};

module.exports = {
  sendPushNotification,
  notifyUsers,
  notifyCompatibleDonors,
  updateFCMToken,
  getNotificationHistory,
  markAsRead,
  NOTIFICATION_TYPES
};