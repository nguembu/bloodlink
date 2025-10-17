// tests/e2e/bloodlink.e2e.test.js
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
  // 🔹 Initialisation de la base de données en mémoire
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  // 🔹 Création du médecin
  doctor = await User.create({ 
    name: 'Dr Strange', 
    email: 'doctor@example.com', 
    password: 'Password123', 
    role: 'doctor',
    hospital: 'Central Hospital' // obligatoire pour passer la validation
  });
  doctorToken = doctor.generateAuthToken();

  // 🔹 Création du donneur
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
  // 🔹 Nettoyage des collections après chaque test
  await Alert.deleteMany();
  await Notification.deleteMany();
});

describe('End-to-End Test: BloodLink Workflow', () => {

  test('Full flow: Doctor creates alert -> Donor responds -> Notification sent', async () => {
    // 🔹 Médecin crée une alerte
    const alertRes = await request(app)
      .post('/api/alerts')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        bloodType: 'A+',
        hospital: doctor.hospital,       // obligatoire pour validation
        urgency: 'critical',
        radius: 50,
        hospitalLocation: { type: 'Point', coordinates: [11.52, 3.87] }
      });
    expect(alertRes.statusCode).toBe(201);
    alertId = alertRes.body.data.alert._id;

    // 🔹 Donneur récupère les alertes à proximité
    const nearbyRes = await request(app)
      .get('/api/donors/nearby-alerts')
      .set('Authorization', `Bearer ${donorToken}`);
    expect(nearbyRes.body.results).toBeGreaterThan(0);

    // 🔹 Donneur répond à l'alerte
    const respondRes = await request(app)
      .post(`/api/donors/alert/${alertId}/respond`)
      .set('Authorization', `Bearer ${donorToken}`)
      .send({ status: 'accepted', message: 'I am available!' });
    expect(respondRes.statusCode).toBe(200);
    expect(respondRes.body.data.alert.responses[0].status).toBe('accepted');

    // 🔹 Vérifier que la notification a été générée pour le médecin
    const notifications = await Notification.find({ user: doctor._id });
    expect(notifications.length).toBeGreaterThan(0);
    expect(notifications[0].type).toBe('DONOR_ACCEPTED');
  }, 20000); // 🔹 augmenter le timeout du test à 20s
});
