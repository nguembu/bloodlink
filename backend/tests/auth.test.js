require('dotenv').config({ path: '.env.test' });

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const User = require('../models/User');

let mongoServer;
let authToken;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany();
});

describe('Auth API', () => {

  const userData = {
    email: 'donor@example.com',
    password: 'Password123',
    role: 'donor',
    name: 'John Doe',
    bloodType: 'A+'
  };

  test('Register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(userData);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.data.user.email).toBe(userData.email);
  });

  test('Login with registered user', async () => {
    // First register
    await User.create(userData);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: userData.email, password: userData.password });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    authToken = res.body.token; // save for protected routes
  });

  test('Get user profile', async () => {
    const user = await User.create(userData);
    authToken = user.generateAuthToken();

    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.user.email).toBe(userData.email);
  });

  test('Update user profile', async () => {
    const user = await User.create(userData);
    authToken = user.generateAuthToken();

    const res = await request(app)
      .patch('/api/auth/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Jane Doe', phone: '+237123456789' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.user.name).toBe('Jane Doe');
    expect(res.body.data.user.phone).toBe('+237123456789');
  });

  test('Update user location', async () => {
    const user = await User.create(userData);
    authToken = user.generateAuthToken();

    const res = await request(app)
      .patch('/api/auth/location')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ latitude: 3.87, longitude: 11.52, address: 'Yaoundé, Cameroon' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.location.coordinates).toEqual([11.52, 3.87]);
    expect(res.body.data.location.address).toBe('Yaoundé, Cameroon');
  });

  test('Update FCM token', async () => {
    const user = await User.create(userData);
    authToken = user.generateAuthToken();

    const res = await request(app)
      .patch('/api/auth/fcm-token')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ fcmToken: 'sample_fcm_token' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.fcmToken).toBe('sample_fcm_token');
  });

});
