const BloodBank = require('../models/BloodBank');
const User = require('../models/User');

// Mettre à jour l'inventaire de sang
exports.updateInventory = async (req, res) => {
  try {
    const { bloodType, quantity } = req.body;

    const bloodBank = await BloodBank.findOne({ user: req.user.id });
    if (!bloodBank) {
      return res.status(403).json({
        success: false,
        message: 'Accès réservé aux banques de sang.'
      });
    }

    await bloodBank.updateInventory(bloodType, quantity);

    res.json({
      success: true,
      message: 'Inventaire mis à jour avec succès.',
      data: { bloodBank }
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Obtenir l'inventaire
exports.getInventory = async (req, res) => {
  try {
    const bloodBank = await BloodBank.findOne({ user: req.user.id });
    if (!bloodBank) {
      return res.status(403).json({
        success: false,
        message: 'Accès réservé aux banques de sang.'
      });
    }

    res.json({
      success: true,
      data: {
        inventory: bloodBank.bloodInventory,
        bloodBank: {
          hospitalName: bloodBank.hospitalName,
          address: bloodBank.address,
          phone: bloodBank.phone
        }
      }
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Trouver les banques de sang à proximité
exports.findNearbyBloodBanks = async (req, res) => {
  try {
    const { latitude, longitude, maxDistance = 50 } = req.query;

    const bloodBanks = await BloodBank.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: maxDistance * 1000
        }
      },
      isActive: true
    })
    .populate('user', 'name phone')
    .select('-bloodInventory');

    res.json({
      success: true,
      data: { bloodBanks }
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};