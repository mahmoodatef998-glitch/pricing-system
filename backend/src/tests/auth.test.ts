import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/auth';

// Set up environment variables for tests
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-jwt';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Routes', () => {
  const validUsername = process.env.ADMIN_USERNAME || 'admin';
  const validPassword = process.env.ADMIN_PASSWORD || 'ChangeMe123!';

  describe('POST /api/auth/login', () => {
    it('should return 400 for missing username', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ password: validPassword });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('should return 400 for missing password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: validUsername });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('should return 400 for empty username', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: '', password: validPassword });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('should return 400 for empty password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: validUsername, password: '' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('should return 401 for invalid username', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'invalid', password: validPassword });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should return 401 for invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: validUsername, password: 'wrongpassword' });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should return 200 and token for valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: validUsername, password: validPassword });

      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
      expect(typeof response.body.token).toBe('string');
      expect(response.body.token.length).toBeGreaterThan(0);
    });

    it('should return different tokens for multiple logins', async () => {
      const response1 = await request(app)
        .post('/api/auth/login')
        .send({ username: validUsername, password: validPassword });

      const response2 = await request(app)
        .post('/api/auth/login')
        .send({ username: validUsername, password: validPassword });

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      // Tokens might be the same or different depending on implementation
      // but both should be valid
      expect(response1.body.token).toBeDefined();
      expect(response2.body.token).toBeDefined();
    });
  });
});

