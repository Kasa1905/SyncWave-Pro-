/**
 * User Routes
 * Handles user management and profile operations
 */

import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { createSuccessResponse, createErrorResponse, User } from '@syncwave/shared';

// Import user store from auth routes (in production, use database)
const users = new Map<string, User>();

export async function userRoutes(app: FastifyInstance): Promise<void> {
  // Get user profile by ID
  app.get('/:userId', {
    preHandler: async (request: FastifyRequest) => {
      await request.jwtVerify();
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { userId } = request.params as { userId: string };
      
      const user = users.get(userId);
      if (!user) {
        const response = createErrorResponse(
          'USER_NOT_FOUND',
          'User not found'
        );
        return reply.status(404).send(response);
      }

      // Return user without sensitive information
      const publicUser = {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        isOnline: user.isOnline,
        lastActiveAt: user.lastActiveAt,
      };

      const response = createSuccessResponse({ user: publicUser });
      reply.send(response);
    } catch (error) {
      app.log.error({ error }, 'Get user error');
      const response = createErrorResponse(
        'USER_FETCH_FAILED',
        'Failed to fetch user'
      );
      reply.status(400).send(response);
    }
  });

  // Update user profile
  app.put('/profile', {
    preHandler: async (request: FastifyRequest) => {
      await request.jwtVerify();
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const payload = request.user as any;
      const body = request.body as Partial<User>;
      
      const user = users.get(payload.userId);
      if (!user) {
        const response = createErrorResponse(
          'USER_NOT_FOUND',
          'User not found'
        );
        return reply.status(404).send(response);
      }

      // Update allowed fields
      if (body.displayName) user.displayName = body.displayName;
      if (body.avatar !== undefined) user.avatar = body.avatar;
      
      user.lastActiveAt = new Date();

      const response = createSuccessResponse({ user });
      reply.send(response);
    } catch (error) {
      app.log.error({ error }, 'Update profile error');
      const response = createErrorResponse(
        'PROFILE_UPDATE_FAILED',
        'Failed to update profile'
      );
      reply.status(400).send(response);
    }
  });

  // Get online users
  app.get('/online/list', {
    preHandler: async (request: FastifyRequest) => {
      await request.jwtVerify();
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const onlineUsers = Array.from(users.values())
        .filter(user => user.isOnline)
        .map(user => ({
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          avatar: user.avatar,
          lastActiveAt: user.lastActiveAt,
        }));

      const response = createSuccessResponse({ users: onlineUsers });
      reply.send(response);
    } catch (error) {
      app.log.error({ error }, 'Get online users error');
      const response = createErrorResponse(
        'ONLINE_USERS_FETCH_FAILED',
        'Failed to fetch online users'
      );
      reply.status(400).send(response);
    }
  });

  // Search users
  app.get('/search', {
    preHandler: async (request: FastifyRequest) => {
      await request.jwtVerify();
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { q } = request.query as { q?: string };
      
      if (!q || q.length < 2) {
        const response = createErrorResponse(
          'INVALID_SEARCH_QUERY',
          'Search query must be at least 2 characters long'
        );
        return reply.status(400).send(response);
      }

      const searchResults = Array.from(users.values())
        .filter(user => 
          user.username.toLowerCase().includes(q.toLowerCase()) ||
          user.displayName.toLowerCase().includes(q.toLowerCase())
        )
        .map(user => ({
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          avatar: user.avatar,
          isOnline: user.isOnline,
        }))
        .slice(0, 10); // Limit to 10 results

      const response = createSuccessResponse({ users: searchResults });
      reply.send(response);
    } catch (error) {
      app.log.error({ error }, 'Search users error');
      const response = createErrorResponse(
        'USER_SEARCH_FAILED',
        'Failed to search users'
      );
      reply.status(400).send(response);
    }
  });
}
