// Vercel Serverless Function - Catch all API routes
// This handles all /api/* requests

import type { VercelRequest, VercelResponse } from '@vercel/node';
import serverless from 'serverless-http';

let app: any;
let serverlessHandler: any;

async function getApp() {
  if (!app) {
    try {
      // Lazy load to avoid Prisma issues in serverless
      const expressApp = await import('../../backend/src/app');
      app = expressApp.default;
    } catch (error) {
      console.error('Error loading Express app:', error);
      console.error('Error details:', error instanceof Error ? error.stack : error);
      throw error;
    }
  }
  return app;
}

async function getHandler() {
  if (!serverlessHandler) {
    try {
      const expressApp = await getApp();
      // Wrap Express app with serverless-http
      serverlessHandler = serverless(expressApp, {
        binary: ['image/*', 'application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
      });
    } catch (error) {
      console.error('Error creating serverless handler:', error);
      console.error('Error details:', error instanceof Error ? error.stack : error);
      throw error;
    }
  }
  return serverlessHandler;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    const handler = await getHandler();
    
    // serverless-http can handle Vercel Request/Response directly
    // Convert to Lambda format for compatibility
    const url = new URL(req.url || '/', `https://${req.headers.host || 'localhost'}`);
    
    // Ensure path starts with /api for Express
    const path = url.pathname.startsWith('/api') ? url.pathname : `/api${url.pathname}`;
    
    const event = {
      httpMethod: req.method || 'GET',
      path: path,
      pathParameters: null,
      queryStringParameters: Object.fromEntries(url.searchParams) || null,
      multiValueQueryStringParameters: null,
      headers: req.headers || {},
      multiValueHeaders: Object.entries(req.headers || {}).reduce((acc, [key, value]) => {
        acc[key] = Array.isArray(value) ? value : [value];
        return acc;
      }, {} as Record<string, string[]>),
      body: req.body 
        ? (typeof req.body === 'string' ? req.body : JSON.stringify(req.body))
        : null,
      isBase64Encoded: false,
      requestContext: {
        requestId: `vercel-${Date.now()}`,
        stage: 'prod',
        httpMethod: req.method || 'GET',
        path: path,
        protocol: 'HTTP/1.1',
        requestTime: new Date().toISOString(),
        requestTimeEpoch: Date.now(),
        identity: {
          sourceIp: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown',
        },
      },
    };

    const context = {
      callbackWaitsForEmptyEventLoop: false,
      functionName: 'api-handler',
      functionVersion: '$LATEST',
      invokedFunctionArn: 'arn:aws:lambda:us-east-1:123456789012:function:api-handler',
      memoryLimitInMB: '512',
      awsRequestId: `vercel-${Date.now()}`,
      logGroupName: '/aws/lambda/api-handler',
      logStreamName: '2023/01/01/[$LATEST]abcdef123456',
      getRemainingTimeInMillis: () => 30000,
      done: () => {},
      fail: () => {},
      succeed: () => {},
    };

    // Call serverless handler
    const result = await handler(event, context);
    
    // Convert Lambda response to Vercel response
    res.status(result.statusCode || 200);
    
    // Set headers
    if (result.headers) {
      Object.entries(result.headers).forEach(([key, value]) => {
        if (value && key.toLowerCase() !== 'content-length') {
          res.setHeader(key, Array.isArray(value) ? value[0] : value as string);
        }
      });
    }
    
    // Send body
    if (result.body) {
      const body = result.isBase64Encoded 
        ? Buffer.from(result.body, 'base64').toString()
        : result.body;
      
      // Try to parse as JSON, otherwise send as text
      try {
        const jsonBody = JSON.parse(body);
        res.json(jsonBody);
      } catch {
        res.send(body);
      }
    } else {
      res.end();
    }
    
  } catch (error) {
    console.error('API Handler Error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    console.error('Request URL:', req.url);
    console.error('Request Method:', req.method);
    
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: process.env.NODE_ENV === 'development' 
          ? (error instanceof Error ? error.stack : undefined)
          : undefined
      });
    }
  }
}
