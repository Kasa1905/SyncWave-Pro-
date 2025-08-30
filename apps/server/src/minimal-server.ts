/**
 * Minimal Server for Testing
 * Gradually adding middleware to identify the issue
 */

import fastify from 'fastify';
import { loadConfig, getConfig } from './config/index.js';

async function createMinimalApp() {
  const config = getConfig();
  const app = fastify({
    logger: {
      level: 'info',
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss UTC',
          ignore: 'pid,hostname',
        },
      },
    },
  });

  // Simple route without any middleware
  app.get('/api/health', async (request, reply) => {
    return { 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    };
  });

  // Test authentication endpoint
  app.post('/api/auth/register', async (request, reply) => {
    return {
      success: true,
      message: 'User registration endpoint working',
      data: { userId: 'test-123' }
    };
  });

  // Test rooms endpoint
  app.get('/api/rooms', async (request, reply) => {
    return {
      success: true,
      data: [
        { id: '1', name: 'Test Room 1', participants: [] },
        { id: '2', name: 'Test Room 2', participants: [] }
      ]
    };
  });

  // Test files endpoint
  app.get('/api/files', async (request, reply) => {
    return {
      success: true,
      data: [],
      message: 'File listing endpoint working'
    };
  });

  return app;
}

async function start() {
  try {
    // Load config first
    loadConfig();
    const config = getConfig();
    const app = await createMinimalApp();
    
    await app.listen({ 
      port: config.port, 
      host: '0.0.0.0' 
    });
    
    console.log(`🚀 Minimal server running on http://localhost:${config.port}`);
  } catch (error) {
    console.error('Failed to start minimal server:', error);
    process.exit(1);
  }
}

// Start the server
start();
