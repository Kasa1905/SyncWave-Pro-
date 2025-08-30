/**
 * Route Setup
 * Configures all API routes for the Fastify application
 */

import { FastifyInstance } from 'fastify';
import { Config } from '@/config/index.js';

// Route imports
import { authRoutes } from './auth';
import { roomRoutes } from './rooms';
import { fileRoutes } from './files';
import { userRoutes } from './users';
import { healthRoutes } from './health';

export async function setupRoutes(app: FastifyInstance, config: Config): Promise<void> {
  // Simple health check route first
  app.get('/api/health', async (request, reply) => {
    return { status: 'healthy', timestamp: new Date().toISOString() };
  });

  // Health check routes (no prefix)
  await app.register(healthRoutes);

  // API routes with /api prefix
  await app.register(async function(app) {
    // Authentication routes
    await app.register(authRoutes, { prefix: '/auth' });
    
    // User routes
    await app.register(userRoutes, { prefix: '/users' });
    
    // Room routes
    await app.register(roomRoutes, { prefix: '/rooms' });
    
    // File routes
    await app.register(fileRoutes, { prefix: '/files' });
  }, { prefix: '/api' });

  app.log.info('Routes registered successfully');
}
