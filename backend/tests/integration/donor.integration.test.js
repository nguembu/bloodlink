require('dotenv').config({ path: '.env.test' });

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../server'); // ton serveur Express
const User = require('../../models/User');
const Alert = require('../../models/Alert');

let mongoServer;
let donorToken;
let donor;
let alert;
let doctor;

// ---------- 🔹 Initialisation MongoDB en mémoire ----------
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}, 20000);

// ---------- 🔹 Fermeture MongoDB ----------
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// ---------- 🔹 Préparation des données ----------
beforeEach(async () => {
  await User.deleteMany();
  await Alert.deleteMany();

  // 🔹 Création d'un médecin
  doctor = await User.create({
    name: 'Dr Strange',
    email: 'doctor@example.com',
    password: 'Password123',
    role: 'doctor',
    hospital: 'Central Hospital',
  });

  // 🔹 Création d'un donneur
  donor = await User.create({
    name: 'John Doe',
    email: 'donor@example.com',
    password: 'Password123',
    role: 'donor',
    bloodType: 'A+',
    location: {
      type: 'Point',
      coordinates: [11.52, 3.87],
      address: 'Yaoundé, Cameroon',
    },
    fcmToken: 'fake_token',
  });
  donorToken = donor.generateAuthToken();

  // 🔹 Création d'une alerte valide
  alert = await Alert.create({
    bloodType: 'A+',
    hospital: doctor.hospital,
    doctor: doctor._id,
    urgency: 'high',
    status: 'active',
    hospitalLocation: {
      type: 'Point',
      coordinates: [11.51, 3.86],
    },
  });
});

// ---------- 🔹 Suite de tests ----------
describe('Donor API', () => {

  test('GET /api/donors/nearby-alerts - should return nearby alerts', async () => {
    const res = await request(app)
      .get('/api/donors/nearby-alerts')
      .set('Authorization', `Bearer ${donorToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data.alerts)).toBe(true);
  }, 20000);

  test('GET /api/donors/donation-history - should return empty donation history', async () => {
    const res = await request(app)
      .get('/api/donors/donation-history')
      .set('Authorization', `Bearer ${donorToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.history).toEqual([]);
  }, 20000);

  test('GET /api/donors/stats - should return donor statistics', async () => {
    const res = await request(app)
      .get('/api/donors/stats')
      .set('Authorization', `Bearer ${donorToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('stats');
    expect(res.body.data.stats).toHaveProperty('totalDonations');
    expect(res.body.data.stats).toHaveProperty('responseRate');
  }, 20000);

  // test('POST /api/donors/alert/:alertId/respond - should allow donor to respond', async () => {
  //   const res = await request(app)
  //     .post(`/api/donors/alert/${alert._id}/respond`)
  //     .set('Authorization', `Bearer ${donorToken}`)
  //     .send({ status: 'accepted', message: 'Je suis disponible' });

  //   expect(res.statusCode).toBe(200);
  //   expect(res.body.status).toBe('success');
  //   expect(res.body.data.alert.responses[0].message).toBe('Je suis disponible');
  // }, 20000);

  test('POST /api/donors/alert/:alertId/respond - should fail with invalid alertId', async () => {
    const res = await request(app)
      .post(`/api/donors/alert/invalidId/respond`)
      .set('Authorization', `Bearer ${donorToken}`)
      .send({ status: 'accepted' });

    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe('error');
  }, 20000);

});
