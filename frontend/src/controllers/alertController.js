const Alert = require('../models/Alert');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { findUsersInRadius, calculateDistance } = require('../utils/geolocation');
const { notifyCompatibleDonors, sendPushNotification, NOTIFICATION_TYPES } = require('../utils/notification');

// Créer une alerte et notifier les donneurs compatibles
exports.createAlert = async (req, res) => {
  try {
    const { bloodType, hospital, location, urgency, radius, description } = req.body;

    // Validation des données requises
    if (!bloodType || !hospital || !location) {
      return res.status(400).json({
        status: 'error',
        message: 'Type sanguin, hôpital et localisation sont requis'
      });
    }

    // Vérifier que le médecin a un hôpital associé
    if (!req.user.hospital) {
      return res.status(400).json({
        status: 'error',
        message: 'Votre profil médecin doit avoir un hôpital associé'
      });
    }

    // Créer l'alerte
    const alert = await Alert.create({
      doctor: req.user.id,
      bloodType,
      hospital: hospital || req.user.hospital,
      hospitalLocation: {
        type: 'Point',
        coordinates: [location.longitude, location.latitude]
      },
      urgency: urgency || 'medium',
      radius: radius || 5,
      description: description || ''
    });

    // Populer les données du docteur immédiatement
    await alert.populate('doctor', 'name hospital phone');

    console.log(`🆕 Nouvelle alerte créée: ${alert.bloodType} à ${alert.hospital}`);

    // Trouver les donneurs compatibles dans le rayon
    let donorsInRadius = [];
    try {
      donorsInRadius = await findUsersInRadius(
        User, 
        location.latitude, 
        location.longitude, 
        radius || 5, 
        bloodType
      );
      
      console.log(`📍 ${donorsInRadius.length} donneurs ${bloodType} trouvés dans un rayon de ${radius || 5}km`);

    } catch (geoError) {
      console.error('Erreur recherche géographique:', geoError);
      // Continuer même si la recherche géo échoue
    }

    // Notifier les donneurs compatibles
    let notificationResult = { successful: 0, failed: 0, total: 0 };
    if (donorsInRadius.length > 0) {
      try {
        notificationResult = await notifyCompatibleDonors(alert);
        
        // Enregistrer les réponses initiales (tous en attente)
        alert.responses = donorsInRadius.map(donor => ({
          donor: donor._id,
          status: 'pending',
          notified: true
        }));
        
        await alert.save();
        
        console.log(`✅ ${notificationResult.successful} notifications envoyées avec succès`);

      } catch (notifyError) {
        console.error('Erreur envoi notifications:', notifyError);
        // Continuer même si les notifications échouent
      }
    }

    res.status(201).json({
      status: 'success',
      message: `Alerte créée avec succès. ${donorsInRadius.length} donneurs potentiels notifiés.`,
      data: { 
        alert,
        notifications: notificationResult
      }
    });

  } catch (error) {
    console.error('❌ Create alert error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Erreur lors de la création de l\'alerte',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
};

// Récupérer les alertes actives avec pagination
exports.getActiveAlerts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const alerts = await Alert.find({ 
      status: 'active',
      expiresAt: { $gt: new Date() }
    })
    .populate('doctor', 'name hospital phone')
    .populate('responses.donor', 'name bloodType phone')
    .sort({ urgency: -1, createdAt: -1 }) // Tri par urgence puis date
    .skip(skip)
    .limit(limit);

    const total = await Alert.countDocuments({ 
      status: 'active',
      expiresAt: { $gt: new Date() }
    });

    res.json({
      status: 'success',
      results: alerts.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: { alerts }
    });
  } catch (error) {
    console.error('❌ Get active alerts error:', error);
    res.status(400).json({
      status: 'error',
      message: 'Erreur lors de la récupération des alertes actives'
    });
  }
};

// Récupérer les alertes d'un médecin avec filtres
exports.getMyAlerts = async (req, res) => {
  try {
    const { status, bloodType, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Construction de la requête
    let query = { doctor: req.user.id };
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (bloodType && bloodType !== 'all') {
      query.bloodType = bloodType;
    }

    const alerts = await Alert.find(query)
      .populate('responses.donor', 'name bloodType phone location')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Alert.countDocuments(query);

    // Calculer les statistiques
    const stats = {
      total: await Alert.countDocuments({ doctor: req.user.id }),
      active: await Alert.countDocuments({ doctor: req.user.id, status: 'active' }),
      fulfilled: await Alert.countDocuments({ doctor: req.user.id, status: 'fulfilled' }),
      cancelled: await Alert.countDocuments({ doctor: req.user.id, status: 'cancelled' })
    };

    res.json({
      status: 'success',
      results: alerts.length,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      stats,
      data: { alerts }
    });
  } catch (error) {
    console.error('❌ Get my alerts error:', error);
    res.status(400).json({
      status: 'error',
      message: 'Erreur lors de la récupération de vos alertes'
    });
  }
};

// Annuler une alerte et notifier les donneurs concernés
exports.cancelAlert = async (req, res) => {
  try {
    const alert = await Alert.findOne({
      _id: req.params.id,
      doctor: req.user.id
    }).populate('responses.donor');

    if (!alert) {
      return res.status(404).json({
        status: 'error',
        message: 'Alerte non trouvée'
      });
    }

    if (alert.status !== 'active') {
      return res.status(400).json({
        status: 'error',
        message: 'Seules les alertes actives peuvent être annulées'
      });
    }

    // Notifier les donneurs qui ont accepté ou sont en attente
    const donorsToNotify = await User.find({
      _id: { 
        $in: alert.responses
          .filter(r => r.status === 'accepted' || r.status === 'pending')
          .map(r => r.donor)
      },
      fcmToken: { $exists: true, $ne: null }
    });

    console.log(`🔔 Notification d'annulation à ${donorsToNotify.length} donneurs`);

    if (donorsToNotify.length > 0) {
      try {
        await Promise.allSettled(
          donorsToNotify.map(donor => 
            sendPushNotification(donor, alert, NOTIFICATION_TYPES.ALERT_CANCELLED)
          )
        );
      } catch (notifyError) {
        console.error('Erreur notification annulation:', notifyError);
      }
    }

    // Annuler l'alerte
    await alert.cancel();

    // Marquer les notifications comme obsolètes
    await Notification.updateMany(
      { alert: alert._id, read: false },
      { $set: { status: 'cancelled' } }
    );

    res.json({
      status: 'success',
      message: `Alerte annulée avec succès. ${donorsToNotify.length} donneurs notifiés.`,
      data: { alert: await alert.populate('responses.donor', 'name bloodType phone') }
    });
  } catch (error) {
    console.error('❌ Cancel alert error:', error);
    res.status(400).json({
      status: 'error',
      message: 'Erreur lors de l\'annulation de l\'alerte'
    });
  }
};

// Marquer une alerte comme remplie
exports.fulfillAlert = async (req, res) => {
  try {
    const alert = await Alert.findOne({
      _id: req.params.id,
      doctor: req.user.id
    });

    if (!alert) {
      return res.status(404).json({
        status: 'error',
        message: 'Alerte non trouvée'
      });
    }

    if (alert.status !== 'active') {
      return res.status(400).json({
        status: 'error',
        message: 'Seules les alertes actives peuvent être marquées comme remplies'
      });
    }

    await alert.fulfill();

    // Notifier les donneurs qui ont accepté
    const acceptedDonors = await User.find({
      _id: { 
        $in: alert.responses
          .filter(r => r.status === 'accepted')
          .map(r => r.donor)
      },
      fcmToken: { $exists: true, $ne: null }
    });

    if (acceptedDonors.length > 0) {
      try {
        await Promise.allSettled(
          acceptedDonors.map(donor => 
            sendPushNotification(donor, alert, NOTIFICATION_TYPES.DONATION_CONFIRMED)
          )
        );
      } catch (notifyError) {
        console.error('Erreur notification confirmation:', notifyError);
      }
    }

    res.json({
      status: 'success',
      message: `Alerte marquée comme remplie. ${acceptedDonors.length} donneurs remerciés.`,
      data: { alert: await alert.populate('responses.donor', 'name bloodType phone') }
    });
  } catch (error) {
    console.error('❌ Fulfill alert error:', error);
    res.status(400).json({
      status: 'error',
      message: 'Erreur lors de la mise à jour de l\'alerte'
    });
  }
};

// Obtenir les détails d'une alerte
exports.getAlert = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id)
      .populate('doctor', 'name hospital phone email')
      .populate('responses.donor', 'name bloodType phone location');

    if (!alert) {
      return res.status(404).json({
        status: 'error',
        message: 'Alerte non trouvée'
      });
    }

    // Calculer les statistiques de réponse
    const responseStats = {
      total: alert.responses.length,
      accepted: alert.responses.filter(r => r.status === 'accepted').length,
      declined: alert.responses.filter(r => r.status === 'declined').length,
      pending: alert.responses.filter(r => r.status === 'pending').length
    };

    res.json({
      status: 'success',
      data: { 
        alert,
        stats: responseStats
      }
    });
  } catch (error) {
    console.error('❌ Get alert error:', error);
    res.status(400).json({
      status: 'error',
      message: 'Erreur lors de la récupération de l\'alerte'
    });
  }
};

// Statistiques des alertes pour le médecin
exports.getAlertStats = async (req, res) => {
  try {
    const doctorId = req.user.id;

    const stats = await Alert.aggregate([
      { $match: { doctor: mongoose.Types.ObjectId(doctorId) } },
      {
        $group: {
          _id: null,
          totalAlerts: { $sum: 1 },
          activeAlerts: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          fulfilledAlerts: {
            $sum: { $cond: [{ $eq: ['$status', 'fulfilled'] }, 1, 0] }
          },
          totalResponses: { $sum: { $size: '$responses' } },
          acceptedResponses: {
            $sum: {
              $size: {
                $filter: {
                  input: '$responses',
                  as: 'response',
                  cond: { $eq: ['$$response.status', 'accepted'] }
                }
              }
            }
          },
          bloodTypeDistribution: {
            $push: {
              bloodType: '$bloodType',
              count: 1
            }
          }
        }
      }
    ]);

    const bloodTypeStats = await Alert.aggregate([
      { $match: { doctor: mongoose.Types.ObjectId(doctorId) } },
      {
        $group: {
          _id: '$bloodType',
          count: { $sum: 1 },
          avgResponses: { $avg: { $size: '$responses' } }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const result = stats[0] || {
      totalAlerts: 0,
      activeAlerts: 0,
      fulfilledAlerts: 0,
      totalResponses: 0,
      acceptedResponses: 0
    };

    result.bloodTypeStats = bloodTypeStats;

    res.json({
      status: 'success',
      data: { stats: result }
    });
  } catch (error) {
    console.error('❌ Get alert stats error:', error);
    res.status(400).json({
      status: 'error',
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
};

// Recherche et filtrage des alertes
exports.searchAlerts = async (req, res) => {
  try {
    const { bloodType, hospital, urgency, dateFrom, dateTo, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = { status: 'active', expiresAt: { $gt: new Date() } };

    // Filtres
    if (bloodType && bloodType !== 'all') {
      query.bloodType = bloodType;
    }

    if (hospital) {
      query.hospital = { $regex: hospital, $options: 'i' };
    }

    if (urgency && urgency !== 'all') {
      query.urgency = urgency;
    }

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const alerts = await Alert.find(query)
      .populate('doctor', 'name hospital phone')
      .populate('responses.donor', 'name bloodType')
      .sort({ urgency: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Alert.countDocuments(query);

    res.json({
      status: 'success',
      results: alerts.length,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      data: { alerts }
    });
  } catch (error) {
    console.error('❌ Search alerts error:', error);
    res.status(400).json({
      status: 'error',
      message: 'Erreur lors de la recherche des alertes'
    });
  }
};