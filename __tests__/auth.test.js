const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../server');
const User = require('../models/User');

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('Auth Routes', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          passphrase: 'TestPass123!'
        });
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
    });

    it('should not register a user with invalid passphrase', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          passphrase: 'weak'
        });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login a registered user', async () => {
      // First register a user
      await request(app)
        .post('/api/auth/register')
        .send({
          passphrase: 'TestPass123!'
        });

      // Then try to login
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          passphrase: 'TestPass123!'
        });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
    });

    it('should not login with incorrect passphrase', async () => {
      // First register a user
      await request(app)
        .post('/api/auth/register')
        .send({
          passphrase: 'TestPass123!'
        });

      // Then try to login with incorrect passphrase
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          passphrase: 'WrongPass123!'
        });
      expect(res.statusCode).toBe(400);
    });
  });
});
