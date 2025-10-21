const Alert = require('../models/Alert');
const User = require('../models/User');
const { findUsersInRadius } = require('../utils/geolocation');
const { sendPushNotification } = require('../utils/notification');

// Banque de sang : Envoyer une alerte aux donneurs
exports.notifyDonors = async (req, res) => {
  try {
    const { alertId, radius = 10 } = req.body;

    const alert = await Alert.findById(alertId).populate('bloodBank');
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alerte non trouvée.'
      });
    }

    // Vérifier que l'utilisateur est la banque de sang concernée
    const bloodBank = await BloodBank.findOne({ user: req.user.id });
    if (!bloodBank || alert.bloodBank._id.toString() !== bloodBank._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à notifier les donneurs pour cette alerte.'
      });
    }

    // Trouver les donneurs compatibles dans le rayon
    const [bankLongitude, bankLatitude] = bloodBank.location.coordinates;
    const compatibleDonors = await findUsersInRadius(
      bankLatitude,
      bankLongitude,
      radius,
      alert.bloodType
    );

    // Notifier chaque donneur
    let notifiedCount = 0;
    for (const donor of compatibleDonors) {
      if (donor.status === 'available') {
        await sendPushNotification(
          donor,
          alert,
          'NEW_ALERT',
          `Urgence sang ${alert.bloodType} à ${bloodBank.hospitalName}`
        );
        notifiedCount++;
      }
    }

    res.json({
      success: true,
      message: `${notifiedCount} donneurs notifiés avec succès.`,
      data: { notifiedCount }
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Donneur : Répondre à une alerte
exports.respondToAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    const { status, message } = req.body;

    if (req.user.role !== 'donor') {
      return res.status(403).json({
        success: false,
        message: 'Seuls les donneurs peuvent répondre aux alertes.'
      });
    }

    const alert = await Alert.findById(alertId).populate('bloodBank');
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alerte non trouvée.'
      });
    }

    // Vérifier la compatibilité du groupe sanguin
    if (req.user.bloodType !== alert.bloodType) {
      return res.status(400).json({
        success: false,
        message: 'Votre groupe sanguin ne correspond pas à celui requis.'
      });
    }

    // Ajouter ou mettre à jour la réponse
    const existingResponse = alert.responses.find(
      response => response.donor.toString() === req.user.id.toString()
    );

    if (existingResponse) {
      existingResponse.status = status;
      existingResponse.message = message;
      existingResponse.respondedAt = new Date();
    } else {
      alert.responses.push({
        donor: req.user.id,
        status,
        message,
        respondedAt: new Date()
      });
    }

    await alert.save();

    // Notifier la banque de sang si le donneur accepte
    if (status === 'accepted') {
      const bloodBankUser = await User.findById(alert.bloodBank.user);
      await sendPushNotification(
        bloodBankUser,
        alert,
        'DONOR_ACCEPTED',
        `Donneur ${req.user.name} a accepté votre alerte`
      );
    }

    res.json({
      success: true,
      message: `Réponse ${status === 'accepted' ? 'acceptée' : 'déclinée'} avec succès.`,
      data: { alert }
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Donneur : Obtenir les alertes à proximité
exports.getNearbyAlerts = async (req, res) => {
  try {
    const { latitude, longitude, maxDistance = 50 } = req.query;

    let userCoords;
    if (latitude && longitude) {
      userCoords = [parseFloat(longitude), parseFloat(latitude)];
    } else if (req.user.location && req.user.location.coordinates) {
      userCoords = req.user.location.coordinates;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Localisation requise.'
      });
    }

    // Trouver les banques de sang à proximité
    const bloodBanks = await BloodBank.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: userCoords
          },
          $maxDistance: maxDistance * 1000
        }
      }
    });

    const bloodBankIds = bloodBanks.map(bank => bank._id);

    // Trouver les alertes actives de ces banques
    const alerts = await Alert.find({
      bloodBank: { $in: bloodBankIds },
      status: { $in: ['pending', 'approved'] },
      expiresAt: { $gt: new Date() }
    })
    .populate('bloodBank', 'hospitalName address phone')
    .populate('doctor', 'name hospital')
    .sort({ urgency: -1, createdAt: -1 });

    res.json({
      success: true,
      data: { alerts }
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};