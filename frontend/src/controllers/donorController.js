const Alert = require('../models/Alert');
const User = require('../models/User');
const { calculateDistance } = require('../utils/geolocation');
const { sendPushNotification, NOTIFICATION_TYPES } = require('../utils/notification');

// Répondre à une alerte
exports.respondToAlert = async (req, res) => {
  try {
    const { status, message } = req.body;
    const alertId = req.params.alertId;

    console.log(`📝 Donor ${req.user.id} responding to alert ${alertId} with status: ${status}`);

    // Vérifier que l'utilisateur est bien un donneur
    if (req.user.role !== 'donor') {
      return res.status(403).json({
        status: 'error',
        message: 'Seuls les donneurs peuvent répondre aux alertes'
      });
    }

    const alert = await Alert.findById(alertId).populate('doctor');
    
    if (!alert) {
      return res.status(404).json({
        status: 'error',
        message: 'Alerte non trouvée'
      });
    }

    if (alert.status !== 'active') {
      return res.status(400).json({
        status: 'error',
        message: 'Cette alerte n\'est plus active'
      });
    }

    // Vérifier la compatibilité du groupe sanguin
    if (req.user.bloodType !== alert.bloodType) {
      return res.status(400).json({
        status: 'error',
        message: `Votre groupe sanguin (${req.user.bloodType}) ne correspond pas à celui requis (${alert.bloodType})`
      });
    }

    // Vérifier si le donneur est dans le rayon (si la localisation est disponible)
    if (req.user.location && req.user.location.coordinates && alert.hospitalLocation.coordinates) {
      const [donorLon, donorLat] = req.user.location.coordinates;
      const [hospitalLon, hospitalLat] = alert.hospitalLocation.coordinates;
      
      const distance = calculateDistance(
        hospitalLat, hospitalLon, 
        donorLat, donorLat
      );

      if (distance > alert.radius) {
        return res.status(400).json({
          status: 'error',
          message: `Vous êtes à ${distance.toFixed(1)}km de l'hôpital, hors du rayon de ${alert.radius}km`
        });
      }
    }

    // Vérifier si le donneur a déjà répondu
    const existingResponse = alert.responses.find(
      response => response.donor.toString() === req.user.id.toString()
    );

    if (existingResponse) {
      // Mettre à jour la réponse existante
      existingResponse.status = status;
      existingResponse.message = message || '';
      existingResponse.respondedAt = new Date();
    } else {
      // Ajouter une nouvelle réponse
      alert.responses.push({
        donor: req.user.id,
        status,
        message: message || '',
        respondedAt: new Date()
      });
    }

    await alert.save();

    // Notifier le médecin si le donneur accepte
    if (status === 'accepted') {
      try {
        await sendPushNotification(
          alert.doctor, 
          alert, 
          NOTIFICATION_TYPES.DONOR_ACCEPTED
        );
        console.log(`✅ Médecin notifié de l'acceptation du donneur ${req.user.name}`);
      } catch (notificationError) {
        console.error('Erreur notification médecin:', notificationError);
      }
    }

    // Recharger l'alerte avec les données peuplées
    await alert.populate('doctor', 'name hospital phone');
    await alert.populate('responses.donor', 'name bloodType phone');

    console.log(`✅ Donor ${req.user.id} successfully responded to alert ${alertId}`);

    res.json({
      status: 'success',
      message: `Réponse enregistrée: ${status === 'accepted' ? 'Accepté' : 'Décliné'}`,
      data: { alert }
    });

  } catch (error) {
    console.error('❌ Respond to alert error:', error);
    res.status(400).json({
      status: 'error',
      message: 'Erreur lors de la réponse à l\'alerte',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
};

// Obtenir les alertes à proximité
exports.getNearbyAlerts = async (req, res) => {
  try {
    const { latitude, longitude, maxDistance = 50 } = req.query;

    console.log(`📍 Fetching nearby alerts for donor ${req.user.id}`, { latitude, longitude, maxDistance });

    let userCoords;
    if (latitude && longitude) {
      userCoords = [parseFloat(longitude), parseFloat(latitude)];
    } else if (req.user.location && req.user.location.coordinates) {
      userCoords = req.user.location.coordinates;
    } else {
      return res.status(400).json({
        status: 'error',
        message: 'Localisation requise. Activez la géolocalisation ou fournissez des coordonnées.'
      });
    }

    // Utiliser la méthode statique du modèle Alert
    const alerts = await Alert.findActiveNearLocation(
      userCoords[0], 
      userCoords[1], 
      maxDistance * 1000 // Convertir en mètres
    );

    // Ajouter des informations de distance et statut de réponse
    const alertsWithDistance = alerts.map(alert => {
      const [alertLon, alertLat] = alert.hospitalLocation.coordinates;
      const distance = calculateDistance(
        userCoords[1], userCoords[0],
        alertLat, alertLon
      );

      const hasResponded = alert.responses.some(
        response => response.donor?.toString() === req.user.id.toString()
      );

      const myResponse = hasResponded ? 
        alert.responses.find(r => r.donor?.toString() === req.user.id.toString()) : 
        null;

      return {
        ...alert.toObject(),
        distance: Math.round(distance * 10) / 10, // 1 décimale
        hasResponded,
        myResponse
      };
    });

    console.log(`✅ Found ${alertsWithDistance.length} alerts near donor ${req.user.id}`);

    res.json({
      status: 'success',
      results: alertsWithDistance.length,
      data: { alerts: alertsWithDistance }
    });

  } catch (error) {
    console.error('❌ Get nearby alerts error:', error);
    res.status(400).json({
      status: 'error',
      message: 'Erreur lors de la récupération des alertes à proximité',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
};

// Historique des dons
exports.getDonationHistory = async (req, res) => {
  try {
    if (req.user.role !== 'donor') {
      return res.status(403).json({
        status: 'error',
        message: 'Accès réservé aux donneurs'
      });
    }

    const alerts = await Alert.find({
      'responses.donor': req.user.id,
      'responses.status': 'accepted'
    })
    .populate('doctor', 'name hospital')
    .sort({ createdAt: -1 });

    const history = alerts.map(alert => ({
      alertId: alert._id,
      bloodType: alert.bloodType,
      hospital: alert.hospital,
      doctor: alert.doctor.name,
      date: alert.createdAt,
      status: alert.status,
      urgency: alert.urgency
    }));

    res.json({
      status: 'success',
      results: history.length,
      data: { history }
    });

  } catch (error) {
    console.error('❌ Get donation history error:', error);
    res.status(400).json({
      status: 'error',
      message: 'Erreur lors de la récupération de l\'historique'
    });
  }
};

// Statistiques du donneur
exports.getDonorStats = async (req, res) => {
  try {
    if (req.user.role !== 'donor') {
      return res.status(403).json({
        status: 'error',
        message: 'Accès réservé aux donneurs'
      });
    }

    const totalDonations = await Alert.countDocuments({
      'responses.donor': req.user.id,
      'responses.status': 'accepted'
    });

    const recentAlerts = await Alert.countDocuments({
      'responses.donor': req.user.id,
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // 30 derniers jours
    });

    const responseRate = await Alert.aggregate([
      { $match: { 'responses.donor': req.user._id } },
      { $unwind: '$responses' },
      { $match: { 'responses.donor': req.user._id } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          accepted: {
            $sum: { $cond: [{ $eq: ['$responses.status', 'accepted'] }, 1, 0] }
          }
        }
      }
    ]);

    const rate = responseRate.length > 0 ? 
      Math.round((responseRate[0].accepted / responseRate[0].total) * 100) : 0;

    res.json({
      status: 'success',
      data: {
        stats: {
          totalDonations,
          recentAlerts,
          responseRate: rate,
          bloodType: req.user.bloodType,
          memberSince: req.user.createdAt
        }
      }
    });

  } catch (error) {
    console.error('❌ Get donor stats error:', error);
    res.status(400).json({
      status: 'error',
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
};