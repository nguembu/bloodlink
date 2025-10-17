const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getMyNotifications,
  markNotificationAsRead,
  updateMyFCMToken
} = require('../controllers/notificationController');

const router = express.Router();

// Toutes les routes protégées
router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Gestion des notifications push et de leur historique
 */

/**
 * @swagger
 * /api/notifications/history:
 *   get:
 *     summary: Récupérer l'historique des notifications de l'utilisateur connecté
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Historique des notifications récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: integer
 *                   example: 2
 *                 data:
 *                   type: object
 *                   properties:
 *                     notifications:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 6529f7eabc1e90f11f45231a
 *                           title:
 *                             type: string
 *                             example: 🚨 Besoin urgent de sang
 *                           body:
 *                             type: string
 *                             example: Urgence O+ à Yaoundé - Haute urgence
 *                           read:
 *                             type: boolean
 *                             example: false
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *       401:
 *         description: Non autorisé
 */

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: Marquer une notification comme lue
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la notification à marquer comme lue
 *         schema:
 *           type: string
 *           example: 6529f7eabc1e90f11f45231a
 *     responses:
 *       200:
 *         description: Notification marquée comme lue avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Notification marquée comme lue
 *       404:
 *         description: Notification non trouvée
 *       401:
 *         description: Non autorisé
 */

/**
 * @swagger
 * /api/notifications/fcm-token:
 *   post:
 *     summary: Mettre à jour le token FCM pour les notifications push
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fcmToken:
 *                 type: string
 *                 example: dskfjsdf8sd7f9s8d7fsd9f8sd8f9sd8f
 *     responses:
 *       200:
 *         description: Token FCM mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Token FCM mis à jour avec succès
 *       400:
 *         description: Token FCM manquant ou invalide
 *       401:
 *         description: Non autorisé
 */

router.get('/history', getMyNotifications);
router.patch('/:id/read', markNotificationAsRead);
router.post('/fcm-token', updateMyFCMToken);

module.exports = router;
