// tests/e2e/donor.e2e.test.js
require('dotenv').config({ path: '.env.test' });

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../server');
const User = require('../../models/User');
const Alert = require('../../models/Alert');
const Notification = require('../../models/Notification');

let mongoServer;
let doctor, donor;
let doctorToken, donorToken;
let alertId;

beforeAll(async () => {
  // 🔹 Démarrage de la base Mongo en mémoire
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  // 🔹 Création médecin avec hospital obligatoire
  doctor = await User.create({
    name: 'Dr Strange',
    email: 'doctor@example.com',
    password: 'Password123',
    role: 'doctor',
    hospital: 'Central Hospital', // obligatoire pour la validation
  });
  doctorToken = doctor.generateAuthToken();

  // 🔹 Création donneur
  donor = await User.create({
    name: 'John Doe',
    email: 'donor@example.com',
    password: 'Password123',
    role: 'donor',
    bloodType: 'A+',
    fcmToken: 'fake_token'
  });
  donorToken = donor.generateAuthToken();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Alert.deleteMany();
  await Notification.deleteMany();
});

describe('E2E BloodLink Workflow', () => {

  test('Doctor creates alert, donor responds, notification sent', async () => {
    // Médecin crée une alerte
    const alertRes = await request(app)
      .post('/api/alerts')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        bloodType: 'A+',
        hospitalName: doctor.hospital, // 🔹 utiliser hospitalName pour correspondre au modèle
        urgency: 'critical',
        radius: 50,
        hospitalLocation: { type: 'Point', coordinates: [11.52, 3.87] }
      });

    expect(alertRes.statusCode).toBe(201);
    alertId = alertRes.body.data.alert._id;

    // Donneur récupère les alertes à proximité
    const nearbyRes = await request(app)
      .get('/api/donors/nearby-alerts')
      .set('Authorization', `Bearer ${donorToken}`);
    expect(nearbyRes.statusCode).toBe(200);
    expect(nearbyRes.body.results).toBeGreaterThan(0);

    // Donneur répond à l'alerte
    const respondRes = await request(app)
      .post(`/api/donors/alert/${alertId}/respond`)
      .set('Authorization', `Bearer ${donorToken}`)
      .send({ status: 'accepted', message: 'Ready to donate!' });
    expect(respondRes.statusCode).toBe(200);
    expect(respondRes.body.data.alert.responses[0].status).toBe('accepted');

    // Vérifier que la notification a été générée
    const notifications = await Notification.find({ type: 'DONOR_ACCEPTED' });
    expect(notifications.length).toBe(1);
    expect(notifications[0].user.toString()).toBe(doctor._id.toString());
  });

  test('Donor updates FCM token', async () => {
    const res = await request(app)
      .post('/api/donors/fcm-token')
      .set('Authorization', `Bearer ${donorToken}`)
      .send({ fcmToken: 'updated_token' });

    expect(res.statusCode).toBe(200);

    const updatedDonor = await User.findById(donor._id);
    expect(updatedDonor.fcmToken).toBe('updated_token');
  });

  test('Donor retrieves donation history', async () => {
    // Créer une alerte acceptée pour l’historique
    const alert = await Alert.create({
      bloodType: 'A+',
      hospitalName: doctor.hospital,
      urgency: 'high',
      status: 'active',
      responses: [{ donor: donor._id, status: 'accepted' }],
      hospitalLocation: { type: 'Point', coordinates: [11.52, 3.87] }
    });

    const res = await request(app)
      .get('/api/donors/donation-history')
      .set('Authorization', `Bearer ${donorToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.results).toBeGreaterThan(0);
    expect(res.body.data.history[0].status).toBe('active');
  });

  test('Donor retrieves stats', async () => {
    const res = await request(app)
      .get('/api/donors/stats')
      .set('Authorization', `Bearer ${donorToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.data.stats).toHaveProperty('totalDonations');
    expect(res.body.data.stats).toHaveProperty('responseRate');
  });

});
