const {
  getNotificationHistory,
  markAsRead,
  updateFCMToken
} = require('../utils/notification');

/**
 * @desc    Récupérer l'historique des notifications de l'utilisateur connecté
 * @route   GET /api/notifications/history
 * @access  Private
 */
exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await getNotificationHistory(req.user.id);
    res.status(200).json({
      status: 'success',
      results: notifications.length,
      data: { notifications }
    });
  } catch (error) {
    console.error('❌ Error in getMyNotifications:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la récupération des notifications'
    });
  }
};

/**
 * @desc    Marquer une notification comme lue
 * @route   PATCH /api/notifications/:id/read
 * @access  Private
 */
exports.markNotificationAsRead = async (req, res) => {
  try {
    const success = await markAsRead(req.params.id);

    if (!success) {
      return res.status(404).json({
        status: 'error',
        message: 'Notification non trouvée'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Notification marquée comme lue'
    });
  } catch (error) {
    console.error('❌ Error in markNotificationAsRead:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la mise à jour de la notification'
    });
  }
};

/**
 * @desc    Mettre à jour le token FCM pour les notifications push
 * @route   POST /api/notifications/fcm-token
 * @access  Private
 */
exports.updateMyFCMToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;

    if (!fcmToken) {
      return res.status(400).json({
        status: 'error',
        message: 'Token FCM requis'
      });
    }

    const success = await updateFCMToken(req.user.id, fcmToken);

    if (!success) {
      return res.status(500).json({
        status: 'error',
        message: 'Erreur lors de la mise à jour du token FCM'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Token FCM mis à jour avec succès'
    });
  } catch (error) {
    console.error('❌ Error in updateMyFCMToken:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la mise à jour du token FCM'
    });
  }
};
