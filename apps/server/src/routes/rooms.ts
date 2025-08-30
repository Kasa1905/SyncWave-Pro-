/**
 * Room Routes
 * Handles room creation, management, and operations
 */

import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  CreateRoomRequest,
  UpdateRoomRequest,
  Room,
  RoomType,
  RoomSettings
} from '@syncwave/shared';

// In-memory room store (replace with database in production)
const rooms = new Map<string, Room>();
const userRooms = new Map<string, Set<string>>(); // userId -> roomIds

export async function roomRoutes(app: FastifyInstance): Promise<void> {
  // Create new room
  app.post('/', {
    preHandler: async (request: FastifyRequest) => {
      await request.jwtVerify();
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = CreateRoomRequest.parse(request.body);
      const payload = request.user as any;
      
      const room: Room = {
        id: generateRoomId(),
        name: body.name,
        description: body.description || null,
        type: body.type || RoomType.PUBLIC,
        ownerId: payload.userId,
        settings: {
          maxParticipants: body.maxParticipants || 50,
          allowFileUpload: body.allowFileUpload ?? true,
          allowScreenShare: body.allowScreenShare ?? true,
          allowChat: body.allowChat ?? true,
          requireApproval: body.requireApproval ?? false,
        },
        participants: [payload.userId],
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      };

      rooms.set(room.id, room);
      
      // Add to user's rooms
      if (!userRooms.has(payload.userId)) {
        userRooms.set(payload.userId, new Set());
      }
      userRooms.get(payload.userId)!.add(room.id);

      const response = createSuccessResponse({ room });
      reply.send(response);
    } catch (error) {
      app.log.error({ error }, 'Create room error');
      const response = createErrorResponse(
        'ROOM_CREATION_FAILED',
        'Failed to create room'
      );
      reply.status(400).send(response);
    }
  });

  // Get all public rooms
  app.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const publicRooms = Array.from(rooms.values()).filter(
        room => room.type === RoomType.PUBLIC && room.isActive
      );

      const response = createSuccessResponse({ rooms: publicRooms });
      reply.send(response);
    } catch (error) {
      app.log.error({ error }, 'Get rooms error');
      const response = createErrorResponse(
        'ROOMS_FETCH_FAILED',
        'Failed to fetch rooms'
      );
      reply.status(400).send(response);
    }
  });

  // Get specific room
  app.get('/:roomId', {
    preHandler: async (request: FastifyRequest) => {
      await request.jwtVerify();
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { roomId } = request.params as { roomId: string };
      const payload = request.user as any;
      
      const room = rooms.get(roomId);
      if (!room) {
        const response = createErrorResponse(
          'ROOM_NOT_FOUND',
          'Room not found'
        );
        return reply.status(404).send(response);
      }

      // Check if user has access to room
      if (room.type === RoomType.PRIVATE && !room.participants.includes(payload.userId)) {
        const response = createErrorResponse(
          'ACCESS_DENIED',
          'You do not have access to this room'
        );
        return reply.status(403).send(response);
      }

      const response = createSuccessResponse({ room });
      reply.send(response);
    } catch (error) {
      app.log.error({ error }, 'Get room error');
      const response = createErrorResponse(
        'ROOM_FETCH_FAILED',
        'Failed to fetch room'
      );
      reply.status(400).send(response);
    }
  });

  // Update room
  app.put('/:roomId', {
    preHandler: async (request: FastifyRequest) => {
      await request.jwtVerify();
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { roomId } = request.params as { roomId: string };
      const body = UpdateRoomRequest.parse(request.body);
      const payload = request.user as any;
      
      const room = rooms.get(roomId);
      if (!room) {
        const response = createErrorResponse(
          'ROOM_NOT_FOUND',
          'Room not found'
        );
        return reply.status(404).send(response);
      }

      // Check if user is owner
      if (room.ownerId !== payload.userId) {
        const response = createErrorResponse(
          'ACCESS_DENIED',
          'Only room owner can update room settings'
        );
        return reply.status(403).send(response);
      }

      // Update room properties
      if (body.name) room.name = body.name;
      if (body.description !== undefined) room.description = body.description;
      if (body.type) room.type = body.type;
      if (body.settings) {
        // Only update defined properties to avoid undefined values
        const settingsUpdate: Partial<RoomSettings> = {};
        if (body.settings.maxParticipants !== undefined) settingsUpdate.maxParticipants = body.settings.maxParticipants;
        if (body.settings.allowFileUpload !== undefined) settingsUpdate.allowFileUpload = body.settings.allowFileUpload;
        if (body.settings.allowScreenShare !== undefined) settingsUpdate.allowScreenShare = body.settings.allowScreenShare;
        if (body.settings.allowChat !== undefined) settingsUpdate.allowChat = body.settings.allowChat;
        if (body.settings.requireApproval !== undefined) settingsUpdate.requireApproval = body.settings.requireApproval;
        
        room.settings = { ...room.settings, ...settingsUpdate };
      }
      room.updatedAt = new Date();

      const response = createSuccessResponse({ room });
      reply.send(response);
    } catch (error) {
      app.log.error({ error }, 'Update room error');
      const response = createErrorResponse(
        'ROOM_UPDATE_FAILED',
        'Failed to update room'
      );
      reply.status(400).send(response);
    }
  });

  // Join room
  app.post('/:roomId/join', {
    preHandler: async (request: FastifyRequest) => {
      await request.jwtVerify();
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { roomId } = request.params as { roomId: string };
      const payload = request.user as any;
      
      const room = rooms.get(roomId);
      if (!room) {
        const response = createErrorResponse(
          'ROOM_NOT_FOUND',
          'Room not found'
        );
        return reply.status(404).send(response);
      }

      // Check if room is full
      if (room.participants.length >= room.settings.maxParticipants) {
        const response = createErrorResponse(
          'ROOM_FULL',
          'Room has reached maximum capacity'
        );
        return reply.status(400).send(response);
      }

      // Add user to room if not already present
      if (!room.participants.includes(payload.userId)) {
        room.participants.push(payload.userId);
        room.updatedAt = new Date();

        // Add to user's rooms
        if (!userRooms.has(payload.userId)) {
          userRooms.set(payload.userId, new Set());
        }
        userRooms.get(payload.userId)!.add(room.id);
      }

      const response = createSuccessResponse({ 
        message: 'Successfully joined room',
        room 
      });
      reply.send(response);
    } catch (error) {
      app.log.error({ error }, 'Join room error');
      const response = createErrorResponse(
        'ROOM_JOIN_FAILED',
        'Failed to join room'
      );
      reply.status(400).send(response);
    }
  });

  // Leave room
  app.post('/:roomId/leave', {
    preHandler: async (request: FastifyRequest) => {
      await request.jwtVerify();
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { roomId } = request.params as { roomId: string };
      const payload = request.user as any;
      
      const room = rooms.get(roomId);
      if (!room) {
        const response = createErrorResponse(
          'ROOM_NOT_FOUND',
          'Room not found'
        );
        return reply.status(404).send(response);
      }

      // Remove user from room
      room.participants = room.participants.filter(id => id !== payload.userId);
      room.updatedAt = new Date();

      // Remove from user's rooms
      userRooms.get(payload.userId)?.delete(room.id);

      // If room is empty and not owned by leaving user, deactivate it
      if (room.participants.length === 0 && room.ownerId !== payload.userId) {
        room.isActive = false;
      }

      const response = createSuccessResponse({ 
        message: 'Successfully left room' 
      });
      reply.send(response);
    } catch (error) {
      app.log.error({ error }, 'Leave room error');
      const response = createErrorResponse(
        'ROOM_LEAVE_FAILED',
        'Failed to leave room'
      );
      reply.status(400).send(response);
    }
  });

  // Delete room
  app.delete('/:roomId', {
    preHandler: async (request: FastifyRequest) => {
      await request.jwtVerify();
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { roomId } = request.params as { roomId: string };
      const payload = request.user as any;
      
      const room = rooms.get(roomId);
      if (!room) {
        const response = createErrorResponse(
          'ROOM_NOT_FOUND',
          'Room not found'
        );
        return reply.status(404).send(response);
      }

      // Check if user is owner
      if (room.ownerId !== payload.userId) {
        const response = createErrorResponse(
          'ACCESS_DENIED',
          'Only room owner can delete room'
        );
        return reply.status(403).send(response);
      }

      // Remove room from all users' room lists
      for (const userId of room.participants) {
        userRooms.get(userId)?.delete(room.id);
      }

      // Delete room
      rooms.delete(roomId);

      const response = createSuccessResponse({ 
        message: 'Room deleted successfully' 
      });
      reply.send(response);
    } catch (error) {
      app.log.error({ error }, 'Delete room error');
      const response = createErrorResponse(
        'ROOM_DELETE_FAILED',
        'Failed to delete room'
      );
      reply.status(400).send(response);
    }
  });
}

// Helper functions
function generateRoomId(): string {
  return `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
