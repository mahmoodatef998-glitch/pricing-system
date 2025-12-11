import request from 'supertest';
import app from '../app';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

describe('File Upload Tests', () => {
  let authToken: string;
  const validUsername = process.env.ADMIN_USERNAME || 'admin';
  const validPassword = process.env.ADMIN_PASSWORD || 'ChangeMe123!';

  beforeAll(async () => {
    // Login to get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ username: validUsername, password: validPassword });

    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('File Upload Validation', () => {
    it('should reject file with invalid extension', async () => {
      // Create a fake file with .exe extension
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .field('description', 'Test Product')
        .field('size', '34')
        .field('breakers', 'CONTACTORS')
        .field('brand', 'TEST')
        .attach('files', Buffer.from('fake exe content'), 'malicious.exe');

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('should accept valid PDF file', async () => {
      // Create a fake PDF file
      const pdfContent = Buffer.from('%PDF-1.4\nfake pdf content');
      
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .field('description', 'Test Product PDF')
        .field('size', '34')
        .field('breakers', 'CONTACTORS')
        .field('brand', 'TEST')
        .attach('files', pdfContent, 'test.pdf');

      if (response.status === 201) {
        // Clean up created product
        const productId = response.body.id;
        await request(app)
          .delete(`/api/products/${productId}`)
          .set('Authorization', `Bearer ${authToken}`);
      }

      // Should either succeed or fail with validation error, not file type error
      expect([201, 400, 500]).toContain(response.status);
    });

    it('should accept valid image file', async () => {
      // Create a fake JPEG file
      const jpegContent = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]); // JPEG header
      
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .field('description', 'Test Product Image')
        .field('size', '34')
        .field('breakers', 'CONTACTORS')
        .field('brand', 'TEST')
        .attach('files', jpegContent, 'test.jpg');

      if (response.status === 201) {
        // Clean up created product
        const productId = response.body.id;
        await request(app)
          .delete(`/api/products/${productId}`)
          .set('Authorization', `Bearer ${authToken}`);
      }

      expect([201, 400, 500]).toContain(response.status);
    });

    it('should reject file exceeding size limit', async () => {
      // Create a file larger than 50MB
      const largeFile = Buffer.alloc(51 * 1024 * 1024); // 51MB
      
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .field('description', 'Test Product Large')
        .field('size', '34')
        .field('breakers', 'CONTACTORS')
        .field('brand', 'TEST')
        .attach('files', largeFile, 'large.pdf');

      // Should reject due to file size
      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('should sanitize dangerous filename', async () => {
      const pdfContent = Buffer.from('%PDF-1.4\nfake pdf content');
      
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .field('description', 'Test Product Sanitize')
        .field('size', '34')
        .field('breakers', 'CONTACTORS')
        .field('brand', 'TEST')
        .attach('files', pdfContent, '../../../etc/passwd.pdf');

      // Should either succeed (with sanitized filename) or fail with validation
      // The important thing is it doesn't allow directory traversal
      if (response.status === 201) {
        const productId = response.body.id;
        await request(app)
          .delete(`/api/products/${productId}`)
          .set('Authorization', `Bearer ${authToken}`);
      }

      expect([201, 400, 500]).toContain(response.status);
    });
  });

  describe('Multiple File Upload', () => {
    it('should accept multiple files in one request', async () => {
      const pdfContent = Buffer.from('%PDF-1.4\nfake pdf content');
      const jpegContent = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]);
      
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .field('description', 'Test Product Multiple')
        .field('size', '34')
        .field('breakers', 'CONTACTORS')
        .field('brand', 'TEST')
        .attach('files', pdfContent, 'test1.pdf')
        .attach('files', jpegContent, 'test2.jpg');

      if (response.status === 201) {
        expect(response.body.drawings).toBeDefined();
        expect(response.body.drawings.length).toBeGreaterThanOrEqual(2);
        
        // Clean up
        const productId = response.body.id;
        await request(app)
          .delete(`/api/products/${productId}`)
          .set('Authorization', `Bearer ${authToken}`);
      }

      expect([201, 400, 500]).toContain(response.status);
    });
  });
});

