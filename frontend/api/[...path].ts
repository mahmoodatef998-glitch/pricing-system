// Vercel Serverless Function - Catch all API routes
// This handles all /api/* requests

import type { VercelRequest, VercelResponse } from '@vercel/node';

let serverlessHandler: any;

async function getHandler() {
  if (!serverlessHandler) {
    try {
      // Import serverless handler from Express app
      const appModule = await import('../../backend/src/app');
      serverlessHandler = appModule.serverlessHandler;
    } catch (error) {
      console.error('Error loading serverless handler:', error);
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
    
    // Convert Vercel request to AWS Lambda event format
    // (which serverless-http expects)
    const url = new URL(req.url || '/', `https://${req.headers.host || 'localhost'}`);
    
    const event = {
      httpMethod: req.method || 'GET',
      path: url.pathname,
      pathParameters: null,
      queryStringParameters: Object.fromEntries(url.searchParams) || {},
      multiValueQueryStringParameters: null,
      headers: req.headers || {},
      multiValueHeaders: {},
      body: req.body ? (typeof req.body === 'string' ? req.body : JSON.stringify(req.body)) : null,
      isBase64Encoded: false,
      requestContext: {
        requestId: `vercel-${Date.now()}`,
        stage: 'prod',
        httpMethod: req.method || 'GET',
        path: url.pathname,
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
    
    // Set status code
    res.status(result.statusCode || 200);
    
    // Set headers
    if (result.headers) {
      Object.entries(result.headers).forEach(([key, value]) => {
        if (value) {
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
