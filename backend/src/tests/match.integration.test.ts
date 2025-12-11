import request from 'supertest';
import app from '../app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Match API Integration Tests', () => {
  beforeAll(async () => {
    // Seed test data
    await prisma.product.createMany({
      data: [
        {
          description: 'ATS',
          size: '34',
          breakers: 'CONTACTORS',
          brand: 'LS',
          ipEnclosure: '54',
          pole: '3P',
          price: 'MANUAL',
        },
        {
          description: 'SYNCRO',
          size: 'TO',
          breakers: 'MCCB MOTORIZED',
          brand: 'EKF',
          ipEnclosure: '66',
          pole: '4P',
          price: null,
        },
      ],
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.product.deleteMany({
      where: {
        brand: {
          in: ['LS', 'EKF'],
        },
      },
    });
    await prisma.$disconnect();
  });

  describe('POST /api/match', () => {
    it('should return matched product for exact match', async () => {
      const response = await request(app)
        .post('/api/match')
        .send({
          description: 'ATS',
          size: '34',
          breakers: 'CONTACTORS',
          brand: 'LS',
          ipEnclosure: '54',
          pole: '3P',
        })
        .expect(200);

      expect(response.body.matched).toBe(true);
      expect(response.body.product).toBeDefined();
      expect(response.body.product.brand).toBe('LS');
      expect(response.body.product.price).toBe('MANUAL');
    });

    it('should match case-insensitively', async () => {
      const response = await request(app)
        .post('/api/match')
        .send({
          description: 'ats',
          size: '34',
          breakers: 'contactors',
          brand: 'ls',
          ipEnclosure: '54',
          pole: '3p',
        })
        .expect(200);

      expect(response.body.matched).toBe(true);
      expect(response.body.product).toBeDefined();
    });

    it('should match when optional fields are not provided', async () => {
      const response = await request(app)
        .post('/api/match')
        .send({
          description: 'SYNCRO',
          size: 'TO',
          breakers: 'MCCB MOTORIZED',
          brand: 'EKF',
          // ipEnclosure and pole not provided
        })
        .expect(200);

      expect(response.body.matched).toBe(true);
      expect(response.body.product).toBeDefined();
    });

    it('should return no match when product not found', async () => {
      const response = await request(app)
        .post('/api/match')
        .send({
          description: 'NONEXISTENT',
          size: '99',
          breakers: 'TEST',
          brand: 'TEST',
        })
        .expect(200);

      expect(response.body.matched).toBe(false);
      expect(response.body.product).toBeUndefined();
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/match')
        .send({
          description: 'ATS',
          // Missing size, breakers, brand
        })
        .expect(400);

      expect(response.body.error).toBeDefined();
    });
  });
});

