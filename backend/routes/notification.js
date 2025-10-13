const express = require('express');
const { protect } = require('../middleware/auth');
const { 
  getNotificationHistory, 
  markAsRead,
  updateFCMToken 
} = require('../utils/notification');

const router = express.Router();

// Toutes les routes protégées
router.use(protect);

// Obtenir l'historique des notifications
router.get('/history', async (req, res) => {
  try {
    const notifications = await getNotificationHistory(req.user.id);
    
    res.json({
      status: 'success',
      results: notifications.length,
      data: { notifications }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: 'Erreur lors de la récupération des notifications'
    });
  }
});

// Marquer une notification comme lue
router.patch('/:id/read', async (req, res) => {
  try {
    const success = await markAsRead(req.params.id);
    
    if (success) {
      res.json({
        status: 'success',
        message: 'Notification marquée comme lue'
      });
    } else {
      res.status(404).json({
        status: 'error',
        message: 'Notification non trouvée'
      });
    }
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: 'Erreur lors de la mise à jour de la notification'
    });
  }
});

// Mettre à jour le token FCM
router.post('/fcm-token', async (req, res) => {
  try {
    const { fcmToken } = req.body;
    
    if (!fcmToken) {
      return res.status(400).json({
        status: 'error',
        message: 'Token FCM requis'
      });
    }

    const success = await updateFCMToken(req.user.id, fcmToken);
    
    if (success) {
      res.json({
        status: 'success',
        message: 'Token FCM mis à jour avec succès'
      });
    } else {
      res.status(400).json({
        status: 'error',
        message: 'Erreur lors de la mise à jour du token FCM'
      });
    }
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: 'Erreur lors de la mise à jour du token FCM'
    });
  }
});

module.exports = router;