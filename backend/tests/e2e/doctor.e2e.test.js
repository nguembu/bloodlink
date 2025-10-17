// tests/e2e/doctor.e2e.test.js
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

  // 🔹 Création médecin
  doctor = await User.create({
    name: 'Dr House',
    email: 'doctor@example.com',
    password: 'Password123',
    role: 'doctor',
    hospital: 'City Hospital', // obligatoire pour validation
  });
  doctorToken = doctor.generateAuthToken();

  // 🔹 Création donneur
  donor = await User.create({
    name: 'Alice Donor',
    email: 'donor@example.com',
    password: 'Password123',
    role: 'donor',
    bloodType: 'B+',
    fcmToken: 'fake_token' // nécessaire pour notifications
  });
  donorToken = donor.generateAuthToken();
});

afterAll(async () => {
  // 🔹 Fermeture propre de la connexion
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  // 🔹 Nettoyage des alertes et notifications après chaque test
  await Alert.deleteMany();
  await Notification.deleteMany();
});

describe('E2E Doctor Workflow', () => {

  test('Doctor creates an alert', async () => {
    const res = await request(app)
      .post('/api/alerts')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        bloodType: 'B+',
        hospitalName: doctor.hospital, // 🔹 correspond au modèle Alert
        urgency: 'high',
        radius: 50,
        hospitalLocation: { type: 'Point', coordinates: [11.5, 3.8] }
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.alert.bloodType).toBe('B+');
    alertId = res.body.data.alert._id;
  }, 20000); // 🔹 timeout augmenté à 20s

  test('Doctor fetches their own alerts', async () => {
    await Alert.create({
      bloodType: 'B+',
      hospitalName: doctor.hospital,
      urgency: 'high',
      doctor: doctor._id,
      hospitalLocation: { type: 'Point', coordinates: [11.5, 3.8] }
    });

    const res = await request(app)
      .get('/api/alerts/my/alerts')
      .set('Authorization', `Bearer ${doctorToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.results).toBeGreaterThan(0);
    expect(res.body.data.alerts[0]).toHaveProperty('bloodType');
  }, 20000);

  test('Doctor cancels an alert', async () => {
    const alert = await Alert.create({
      bloodType: 'B+',
      hospitalName: doctor.hospital,
      urgency: 'high',
      doctor: doctor._id,
      status: 'active',
      hospitalLocation: { type: 'Point', coordinates: [11.5, 3.8] }
    });

    const res = await request(app)
      .patch(`/api/alerts/${alert._id}/cancel`)
      .set('Authorization', `Bearer ${doctorToken}`);

    expect(res.statusCode).toBe(200);
    const updatedAlert = await Alert.findById(alert._id);
    expect(updatedAlert.status).toBe('cancelled');

    // 🔹 Vérification de la notification générée
    const notification = await Notification.findOne({ alert: alert._id, type: 'ALERT_CANCELLED' });
    expect(notification).not.toBeNull();
  }, 20000);

  test('Doctor views alert responses from donors', async () => {
    const alert = await Alert.create({
      bloodType: 'B+',
      hospitalName: doctor.hospital,
      urgency: 'high',
      doctor: doctor._id,
      responses: [{ donor: donor._id, status: 'accepted', message: 'Ready' }],
      hospitalLocation: { type: 'Point', coordinates: [11.5, 3.8] }
    });

    const res = await request(app)
      .get(`/api/alerts/${alert._id}`)
      .set('Authorization', `Bearer ${doctorToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.alert.responses.length).toBeGreaterThan(0);
    expect(res.body.data.alert.responses[0].donor._id.toString()).toBe(donor._id.toString());
  }, 20000);

});

