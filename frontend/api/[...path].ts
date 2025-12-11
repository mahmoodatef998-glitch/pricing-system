// Vercel Serverless Function - Catch all API routes
// This handles all /api/* requests

import type { VercelRequest, VercelResponse } from '@vercel/node';

// Import Express app
let app: any;

async function getApp() {
  if (!app) {
    try {
      // Lazy load to avoid issues with Prisma in serverless
      const expressApp = await import('../../backend/src/app');
      app = expressApp.default;
    } catch (error) {
      console.error('Error loading Express app:', error);
      throw error;
    }
  }
  return app;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    const expressApp = await getApp();
    
    // Vercel passes the full path including /api
    // For example: /api/health, /api/products, etc.
    // Express app expects the same paths
    
    // Create Express-compatible request object
    const expressReq = {
      method: req.method,
      url: req.url || '/',
      originalUrl: req.url || '/',
      path: req.url?.split('?')[0] || '/',
      query: req.query || {},
      body: req.body,
      headers: req.headers || {},
      params: {},
      ip: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.socket?.remoteAddress,
    } as any;

    const expressRes = {
      statusCode: 200,
      status: function(code: number) {
        res.status(code);
        this.statusCode = code;
        return this;
      },
      json: function(data: any) {
        res.json(data);
        return this;
      },
      send: function(data: any) {
        res.send(data);
        return this;
      },
      setHeader: function(name: string, value: string) {
        res.setHeader(name, value);
        return this;
      },
      getHeader: function(name: string) {
        return res.getHeader(name);
      },
      end: function(data?: any) {
        if (data) {
          res.send(data);
        } else {
          res.end();
        }
        return this;
      },
    } as any;

    // Handle the request with Express app
    expressApp(expressReq, expressRes);
    
    // Return a promise that resolves when the response is sent
    return new Promise((resolve) => {
      if (expressRes.headersSent || res.headersSent) {
        resolve(undefined);
      } else {
        // If Express didn't send a response, send a default one
        setTimeout(() => {
          if (!res.headersSent) {
            res.status(404).json({ error: 'Not found' });
          }
          resolve(undefined);
        }, 100);
      }
    });
  } catch (error) {
    console.error('API Handler Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
