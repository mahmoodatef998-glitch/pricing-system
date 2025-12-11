// Vercel Serverless Function - Catch all API routes
// This handles all /api/* requests

import type { VercelRequest, VercelResponse } from '@vercel/node';

// Import Express app
let app: any;

async function getApp() {
  if (!app) {
    try {
      // Lazy load to avoid issues with Prisma in serverless
      const expressApp = await import('../backend/src/app');
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
    
    // Convert Vercel request to Express format
    const expressReq = req as any;
    const expressRes = res as any;
    
    // Handle the request
    return expressApp(expressReq, expressRes);
  } catch (error) {
    console.error('API Handler Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
