const express = require('express');
const {
  createAlert,
  getActiveAlerts,
  getMyAlerts,
  cancelAlert,
  fulfillAlert,
  getAlert,
  searchAlerts
} = require('../controllers/alertController');
const { protect, restrictTo } = require('../middleware/auth');
const { validateAlert } = require('../middleware/validation');

const router = express.Router();

// Middleware : toutes les routes nécessitent l'authentification
router.use(protect);

/**
 * @swagger
 * /alerts/active:
 *   get:
 *     summary: Récupère toutes les alertes actives
 *     tags: [Alertes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des alertes actives
 */
router.get('/active', getActiveAlerts);

/**
 * @swagger
 * /alerts/search:
 *   get:
 *     summary: Rechercher et filtrer les alertes
 *     tags: [Alertes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: bloodType
 *         schema:
 *           type: string
 *         description: Filtrer par type sanguin
 *       - in: query
 *         name: hospital
 *         schema:
 *           type: string
 *         description: Filtrer par hôpital
 *       - in: query
 *         name: urgency
 *         schema:
 *           type: string
 *         description: Filtrer par urgence
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de début
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de fin
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page de pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Nombre d’éléments par page
 *     responses:
 *       200:
 *         description: Résultats filtrés des alertes
 */
router.get('/search', searchAlerts);

/**
 * @swagger
 * /alerts/my/alerts:
 *   get:
 *     summary: Récupère les alertes du médecin connecté
 *     tags: [Alertes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des alertes du médecin
 */
router.get('/my/alerts', restrictTo('doctor'), getMyAlerts);

/**
 * @swagger
 * /alerts/{id}:
 *   get:
 *     summary: Récupère une alerte spécifique
 *     tags: [Alertes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l’alerte
 *     responses:
 *       200:
 *         description: Détails de l’alerte
 */
router.get('/:id', getAlert);

// Routes réservées aux médecins
router.use(restrictTo('doctor'));

/**
 * @swagger
 * /alerts:
 *   post:
 *     summary: Crée une nouvelle alerte
 *     tags: [Alertes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Alert'
 *     responses:
 *       201:
 *         description: Alerte créée avec succès
 */
router.post('/', validateAlert, createAlert);

/**
 * @swagger
 * /alerts/{id}/cancel:
 *   patch:
 *     summary: Annule une alerte
 *     tags: [Alertes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l’alerte à annuler
 *     responses:
 *       200:
 *         description: Alerte annulée avec succès
 */
router.patch('/:id/cancel', cancelAlert);

/**
 * @swagger
 * /alerts/{id}/fulfill:
 *   patch:
 *     summary: Marque une alerte comme remplie
 *     tags: [Alertes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l’alerte à remplir
 *     responses:
 *       200:
 *         description: Alerte remplie avec succès
 */
router.patch('/:id/fulfill', fulfillAlert);

module.exports = router;
