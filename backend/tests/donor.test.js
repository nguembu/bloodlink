// tests/donor.test.js
const donorController = require('../controllers/donorController');
const Alert = require('../models/Alert');

describe('Donor Controller Unit Tests', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: {
        id: 'donorId',
        _id: 'donorId',
        role: 'donor',
        bloodType: 'A+',
        location: { coordinates: [3.8, 11.5] },
        name: 'Test Donor',
        createdAt: new Date()
      },
      params: {},
      query: {},
      body: {}
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    next = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // -----------------------------
  // getNearbyAlerts
  // -----------------------------
  test('getNearbyAlerts should return alerts', async () => {
    req.query = { latitude: '11.5', longitude: '3.8', maxDistance: '50' };

    const fakeAlerts = [
      {
        _id: 'alert1',
        bloodType: 'A+',
        hospitalLocation: { coordinates: [3.8, 11.5] },
        radius: 50,
        responses: [],
        toObject: function () { return this; }
      }
    ];

    Alert.findActiveNearLocation = jest.fn().mockResolvedValue(fakeAlerts);

    await donorController.getNearbyAlerts(req, res, next);

    expect(Alert.findActiveNearLocation).toHaveBeenCalledWith(3.8, 11.5, 50000);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      results: 1,
      data: { alerts: expect.any(Array) }
    });
  });

  // -----------------------------
  // getDonationHistory
  // -----------------------------
  test('getDonationHistory should return donation history', async () => {
    const fakeAlerts = [
      {
        _id: 'alert1',
        bloodType: 'A+',
        hospital: 'Hospital 1',
        doctor: { name: 'Dr Test' },
        createdAt: new Date(),
        status: 'active',
        urgency: 'high'
      }
    ];

    Alert.find = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue(fakeAlerts)
    });

    await donorController.getDonationHistory(req, res, next);

    expect(Alert.find).toHaveBeenCalledWith({
      'responses.donor': req.user.id,
      'responses.status': 'accepted'
    });
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      results: 1,
      data: { history: expect.any(Array) }
    });
  });

  // -----------------------------
  // respondToAlert
  // -----------------------------
  // test.step('respondToAlert should allow donor to respond', async () => {
  //   req.params.alertId = 'alertId';
  //   req.body.status = 'accepted';
  //   req.body.message = '';

  //   const fakeAlert = {
  //     _id: 'alertId',
  //     status: 'active',
  //     bloodType: 'A+',
  //     hospitalLocation: { coordinates: [3.8, 11.5] },
  //     radius: 50,
  //     responses: [],
  //     save: jest.fn().mockResolvedValue(true),
  //     populate: jest.fn().mockImplementation(() => Promise.resolve(fakeAlert)),
  //     doctor: { _id: 'doc1', name: 'Dr Test' }
  //   };

  //   Alert.findById = jest.fn().mockResolvedValue(fakeAlert);

  //   await donorController.respondToAlert(req, res, next);

  //   expect(Alert.findById).toHaveBeenCalledWith('alertId');
  //   expect(fakeAlert.responses.length).toBe(1);
  //   expect(res.json).toHaveBeenCalledWith({
  //     status: 'success',
  //     message: 'Réponse enregistrée: Accepté',
  //     data: { alert: fakeAlert }
  //   });
  // });

  // test.step('respondToAlert should return 404 if alert not found', async () => {
  //   req.params.alertId = 'invalidId';
  //   Alert.findById = jest.fn().mockResolvedValue(null);

  //   await donorController.respondToAlert(req, res, next);

  //   expect(res.status).toHaveBeenCalledWith(404);
  //   expect(res.json).toHaveBeenCalledWith({
  //     status: 'error',
  //     message: 'Alerte non trouvée'
  //   });
  // });

  test('respondToAlert should return 403 if user not donor', async () => {
    req.user.role = 'doctor';
    req.params.alertId = 'alertId';

    await donorController.respondToAlert(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Seuls les donneurs peuvent répondre aux alertes'
    });
  });
});
