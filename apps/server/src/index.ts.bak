/**
 * SyncWave Pro Server
 * 
 * Production-grade Fastify server with WebSocket support for real-time
 * audio/video streaming, room management, and file upload/transcoding.
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';
import staticFiles from '@fastify/static';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

import { loadConfig } from '@/config/index.js';
import { setupRoutes } from '@/routes/index.js';
import { setupWebSocket } from '@/websocket/index.js';
import { logger } from '@/utils/logger.js';
import { createErrorResponse } from '@syncwave/shared';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createApp() {
  const config = loadConfig();
  
  // Create Fastify app with logger
  const app = Fastify({
    logger: {
      level: config.logLevel,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      },
    },
  });

  try {
    // Register CORS
    await app.register(cors, {
      origin: (origin, callback) => {
        if (!origin || origin === config.corsOrigin) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'), false);
        }
      },
      credentials: true,
    });

    // Register JWT
    await app.register(jwt, {
      secret: config.jwtSecret,
      sign: {
        expiresIn: '1h',
      },
    });

    // Register rate limiting
    await app.register(rateLimit, {
      max: 100,
      timeWindow: 15 * 60 * 1000, // 15 minutes
      errorResponseBuilder: () => {
        return createErrorResponse(
          'RATE_LIMIT_EXCEEDED',
          'Too many requests. Please try again later.'
        );
      },
    });

    // Register multipart for file uploads
    await app.register(multipart, {
      limits: {
        fileSize: config.maxFileSize,
        files: 10,
      },
    });

    // Serve static files (uploads, HLS segments)
    await app.register(staticFiles, {
      root: path.join(__dirname, '../uploads'),
      prefix: '/uploads/',
      decorateReply: false,
    });

    // Setup routes
    await setupRoutes(app, config);

    // Global error handler
    app.setErrorHandler((error, request, reply) => {
      app.log.error(error);
      
      const statusCode = error.statusCode || 500;
      const response = createErrorResponse(
        error.code || 'INTERNAL_SERVER_ERROR',
        error.message || 'An unexpected error occurred',
        { path: request.url }
      );

      reply.status(statusCode).send(response);
    });

    // 404 handler
    app.setNotFoundHandler((request, reply) => {
      const response = createErrorResponse(
        'NOT_FOUND',
        `Route ${request.method}:${request.url} not found`
      );
      reply.status(404).send(response);
    });

    return { app, config };
  } catch (error) {
    console.error('Error setting up Fastify app:', error);
    app.log.error({ error }, 'Error setting up Fastify app');
    throw error;
  }
}

async function start() {
  try {
    const { app, config } = await createApp();

    // Create HTTP server for WebSocket attachment
    const httpServer = createServer((req, res) => {
      app.server.emit('request', req, res);
    });

    // Start HTTP server
    await new Promise<void>((resolve, reject) => {
      httpServer.listen(config.port, (err?: Error) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Setup WebSocket server
    const wss = new WebSocketServer({ 
      server: httpServer
    });
    
    setupWebSocket(wss, app, config);

    logger.info(`🚀 Server running on http://localhost:${config.port}`);
    logger.info(`🔌 WebSocket server running on ws://localhost:${config.wsPort}`);
    logger.info(`📁 Static files served from /uploads`);
    logger.info(`🎯 Environment: ${process.env.NODE_ENV || 'development'}`);

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received, shutting down gracefully`);
      
      wss.close(() => {
        logger.info('WebSocket server closed');
      });
      
      httpServer.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

  } catch (error) {
    console.error('Failed to start server:', error);
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
start();

