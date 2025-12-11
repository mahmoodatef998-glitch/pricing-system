import request from 'supertest';
import app from '../app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Products API Integration Tests', () => {
  let authToken: string;
  let testProductId: number;

  beforeAll(async () => {
    // Login to get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: process.env.ADMIN_USERNAME || 'admin',
        password: process.env.ADMIN_PASSWORD || 'ChangeMe123!',
      });

    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    // Clean up test data
    if (testProductId) {
      await prisma.product.delete({
        where: { id: testProductId },
      }).catch(() => {});
    }
    await prisma.$disconnect();
  });

  describe('POST /api/products', () => {
    it('should create a product with valid data', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'ATS',
          size: '34',
          breakers: 'CONTACTOR',
          brand: 'LS',
          ipEnclosure: '54',
          pole: '3P',
          price: '1000',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.description).toBe('ATS');
      expect(response.body.brand).toBe('LS');
      testProductId = response.body.id;
    });

    it('should reject product creation without required fields', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'ATS',
          // Missing required fields
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject product creation without authentication', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({
          description: 'ATS',
          size: '34',
          breakers: 'CONTACTOR',
          brand: 'LS',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/products', () => {
    it('should get all products', async () => {
      const response = await request(app)
        .get('/api/products');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('products');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('limit');
    });

    it('should filter products by brand', async () => {
      const response = await request(app)
        .get('/api/products?brand=LS');

      expect(response.status).toBe(200);
      expect(response.body.products).toBeInstanceOf(Array);
    });

    it('should search products across fields', async () => {
      const response = await request(app)
        .get('/api/products?search=ATS');

      expect(response.status).toBe(200);
      expect(response.body.products).toBeInstanceOf(Array);
    });

    it('should paginate products', async () => {
      const response = await request(app)
        .get('/api/products?page=1&limit=5');

      expect(response.status).toBe(200);
      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(5);
    });
  });

  describe('GET /api/products/:id', () => {
    it('should get a single product', async () => {
      if (!testProductId) {
        // Create a test product first
        const createResponse = await request(app)
          .post('/api/products')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            description: 'TEST',
            size: '10',
            breakers: 'TEST',
            brand: 'TEST',
          });
        testProductId = createResponse.body.id;
      }

      const response = await request(app)
        .get(`/api/products/${testProductId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body.id).toBe(testProductId);
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app)
        .get('/api/products/99999');

      expect(response.status).toBe(404);
    });

    it('should return 400 for invalid product ID', async () => {
      const response = await request(app)
        .get('/api/products/invalid');

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/products/:id', () => {
    it('should update a product', async () => {
      if (!testProductId) {
        const createResponse = await request(app)
          .post('/api/products')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            description: 'TEST',
            size: '10',
            breakers: 'TEST',
            brand: 'TEST',
          });
        testProductId = createResponse.body.id;
      }

      const response = await request(app)
        .put(`/api/products/${testProductId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'UPDATED',
        });

      expect(response.status).toBe(200);
      expect(response.body.description).toBe('UPDATED');
    });

    it('should reject update without authentication', async () => {
      const response = await request(app)
        .put(`/api/products/${testProductId}`)
        .send({
          description: 'UPDATED',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('should delete a product', async () => {
      // Create a product to delete
      const createResponse = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'DELETE_TEST',
          size: '10',
          breakers: 'TEST',
          brand: 'TEST',
        });
      const deleteId = createResponse.body.id;

      const response = await request(app)
        .delete(`/api/products/${deleteId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });

    it('should reject delete without authentication', async () => {
      const response = await request(app)
        .delete(`/api/products/${testProductId}`);

      expect(response.status).toBe(401);
    });
  });
});

