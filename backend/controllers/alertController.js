const Alert = require('../models/Alert');
const User = require('../models/User');
const BloodBank = require('../models/BloodBank');
const { findNearestBloodBanks } = require('../utils/geolocation');
const { sendPushNotification } = require('../utils/notification');

// Médecin : Envoyer une alerte à la banque de sang
exports.createAlert = async (req, res) => {
  try {
    const { bloodType, quantity, urgency, patientInfo } = req.body;

    // Vérifier que l'utilisateur est un médecin
    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Seuls les médecins peuvent créer des alertes.'
      });
    }

    // Trouver la banque de sang de l'hôpital du médecin
    let bloodBank = await BloodBank.findOne({ 
      hospitalName: req.user.hospital 
    });

    if (!bloodBank) {
      return res.status(404).json({
        success: false,
        message: 'Aucune banque de sang trouvée pour votre hôpital.'
      });
    }

    // Créer l'alerte
    const alert = await Alert.create({
      doctor: req.user.id,
      bloodBank: bloodBank._id,
      bloodType,
      quantity,
      urgency,
      patientInfo
    });

    // Notifier la banque de sang
    await sendPushNotification(
      bloodBank.user,
      alert,
      'BLOOD_REQUEST',
      `Demande de sang ${bloodType} - ${quantity} unité(s)`
    );

    res.status(201).json({
      success: true,
      message: 'Alerte créée avec succès',
      data: { alert }
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Banque de sang : Recevoir une requête et la propager si nécessaire
exports.propagateAlert = async (req, res) => {
  try {
    const { alertId } = req.params;

    const alert = await Alert.findById(alertId)
      .populate('doctor')
      .populate('bloodBank');

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
        message: 'Non autorisé à propager cette alerte.'
      });
    }

    // Vérifier si la banque a du sang disponible
    if (bloodBank.hasBloodAvailable(alert.bloodType, alert.quantity)) {
      return res.status(400).json({
        success: false,
        message: 'Votre banque a déjà ce sang disponible. Pas besoin de propagation.'
      });
    }

    // Trouver les banques de sang les plus proches
    const nearestBanks = await findNearestBloodBanks(
      bloodBank.location.coordinates[1],
      bloodBank.location.coordinates[0],
      5 // 5 banques les plus proches
    );

    // Filtrer pour exclure la banque actuelle
    const otherBanks = nearestBanks.filter(bank => 
      bank._id.toString() !== bloodBank._id.toString()
    );

    // Propager l'alerte aux autres banques
    for (const bank of otherBanks) {
      await alert.propagateToBloodBank(bank._id);
      
      // Notifier la banque de sang
      const bankUser = await User.findById(bank.user);
      await sendPushNotification(
        bankUser,
        alert,
        'BLOOD_REQUEST',
        `Demande propagée: Sang ${alert.bloodType} - ${alert.quantity} unité(s)`
      );
    }

    res.json({
      success: true,
      message: `Alerte propagée à ${otherBanks.length} banques de sang.`,
      data: { propagatedTo: otherBanks.length }
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Banque de sang : Valider la réception de sang
exports.validateReception = async (req, res) => {
  try {
    const { alertId } = req.params;

    const alert = await Alert.findById(alertId);
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alerte non trouvée.'
      });
    }

    // Vérifier les permissions
    const bloodBank = await BloodBank.findOne({ user: req.user.id });
    if (!bloodBank) {
      return res.status(403).json({
        success: false,
        message: 'Accès réservé aux banques de sang.'
      });
    }

    // Marquer comme rempli
    await alert.fulfill();

    // Mettre à jour l'inventaire
    await bloodBank.updateInventory(alert.bloodType, alert.quantity);

    // Notifier le médecin
    const doctor = await User.findById(alert.doctor);
    await sendPushNotification(
      doctor,
      alert,
      'BLOOD_RECEIVED',
      `Sang ${alert.bloodType} reçu avec succès`
    );

    res.json({
      success: true,
      message: 'Réception de sang validée avec succès.',
      data: { alert }
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Banque de sang : Annuler une alerte
exports.cancelAlert = async (req, res) => {
  try {
    const { alertId } = req.params;

    const alert = await Alert.findById(alertId);
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alerte non trouvée.'
      });
    }

    // Vérifier les permissions
    const bloodBank = await BloodBank.findOne({ user: req.user.id });
    if (!bloodBank || alert.bloodBank.toString() !== bloodBank._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à annuler cette alerte.'
      });
    }

    await alert.cancel();

    // Notifier le médecin
    const doctor = await User.findById(alert.doctor);
    await sendPushNotification(
      doctor,
      alert,
      'ALERT_CANCELLED',
      'Alerte annulée par la banque de sang'
    );

    res.json({
      success: true,
      message: 'Alerte annulée avec succès.',
      data: { alert }
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Obtenir les alertes pour une banque de sang
exports.getBloodBankAlerts = async (req, res) => {
  try {
    const bloodBank = await BloodBank.findOne({ user: req.user.id });
    if (!bloodBank) {
      return res.status(403).json({
        success: false,
        message: 'Accès réservé aux banques de sang.'
      });
    }

    const alerts = await Alert.find({
      $or: [
        { bloodBank: bloodBank._id },
        { 'propagatedTo.bloodBank': bloodBank._id }
      ]
    })
    .populate('doctor', 'name hospital phone')
    .populate('bloodBank', 'hospitalName')
    .sort({ createdAt: -1 });

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