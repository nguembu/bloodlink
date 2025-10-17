const express = require('express');
const {
  respondToAlert,
  getNearbyAlerts,
  getDonationHistory,
  getDonorStats
} = require('../controllers/donorController');
const { protect, restrictTo } = require('../middleware/auth');
const { validateAlertResponse } = require('../middleware/validation');

const router = express.Router();

// 🔒 Toutes les routes protégées pour le rôle "donor"
router.use(protect);
router.use(restrictTo('donor'));

/**
 * @swagger
 * /api/donor/nearby-alerts:
 *   get:
 *     summary: Récupérer les alertes proches du donneur connecté
 *     tags: [Donor]
 *     responses:
 *       200:
 *         description: Liste des alertes actives à proximité
 */
router.get('/nearby-alerts', getNearbyAlerts);

/**
 * @swagger
 * /api/donor/donation-history:
 *   get:
 *     summary: Historique des dons du donneur
 *     tags: [Donor]
 *     responses:
 *       200:
 *         description: Liste des dons effectués
 */
router.get('/donation-history', getDonationHistory);

/**
 * @swagger
 * /api/donor/stats:
 *   get:
 *     summary: Statistiques globales du donneur
 *     tags: [Donor]
 *     responses:
 *       200:
 *         description: Statistiques de dons et taux de réponse
 */
router.get('/stats', getDonorStats);

/**
 * @swagger
 * /api/donor/alert/{alertId}/respond:
 *   post:
 *     summary: Répondre à une alerte (accepter ou refuser)
 *     tags: [Donor]
 *     parameters:
 *       - name: alertId
 *         in: path
 *         required: true
 *         description: ID de l’alerte
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [accepted, declined]
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *     responses:
 *       200:
 *         description: Réponse enregistrée avec succès
 *       400:
 *         description: Erreur de validation ou alerte non trouvée
 */
router.post('/alert/:alertId/respond', validateAlertResponse, respondToAlert);

module.exports = router;
