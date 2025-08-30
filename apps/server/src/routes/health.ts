/**
 * Health Check Routes
 * Basic health monitoring endpoints
 */

import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { createSuccessResponse } from '@syncwave/shared';

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  // Basic health check
  app.get('/health', async (request: FastifyRequest, reply: FastifyReply) => {
    const response = createSuccessResponse({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0',
    });
    
    reply.send(response);
  });

  // Detailed health check
  app.get('/health/detailed', async (request: FastifyRequest, reply: FastifyReply) => {
    const response = createSuccessResponse({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      platform: process.platform,
      nodeVersion: process.version,
    });
    
    reply.send(response);
  });

  // Ready check (for Kubernetes)
  app.get('/ready', async (request: FastifyRequest, reply: FastifyReply) => {
    reply.send({ status: 'ready' });
  });

  // Live check (for Kubernetes)
  app.get('/live', async (request: FastifyRequest, reply: FastifyReply) => {
    reply.send({ status: 'alive' });
  });
}
