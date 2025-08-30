/**
 * WebSocket Server Setup
 * Handles real-time communication for rooms, chat, and media streaming
 */

import { WebSocketServer, WebSocket } from 'ws';
import { FastifyInstance } from 'fastify';
import { Config } from '@/config/index.js';
import { 
  WebSocketMessage, 
  WSMessageType,
  JoinRoomMessage,
  LeaveRoomMessage,
  ChatMessage,
  MediaControlMessage,
  ScreenShareMessage
} from '@syncwave/shared';
import { logger } from '@/utils/logger.js';

interface ExtendedWebSocket extends WebSocket {
  userId?: string | undefined;
  roomId?: string | undefined;
  isAlive?: boolean;
}

interface RoomConnection {
  userId: string;
  username: string;
  ws: ExtendedWebSocket;
  joinedAt: Date;
}

// In-memory connection tracking
const connections = new Map<string, ExtendedWebSocket>(); // userId -> WebSocket
const roomConnections = new Map<string, Map<string, RoomConnection>>(); // roomId -> userId -> RoomConnection

export function setupWebSocket(wss: WebSocketServer, app: FastifyInstance, config: Config): void {
  wss.on('connection', (ws: ExtendedWebSocket, request) => {
    logger.info('New WebSocket connection established');
    
    ws.isAlive = true;
    
    // Handle incoming messages
    ws.on('message', async (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString()) as WebSocketMessage;
        await handleMessage(ws, message, app);
      } catch (error) {
        logger.error('Error parsing WebSocket message:', error);
        sendError(ws, 'INVALID_MESSAGE', 'Invalid message format');
      }
    });

    // Handle connection close
    ws.on('close', () => {
      handleDisconnection(ws);
    });

    // Handle connection errors
    ws.on('error', (error) => {
      logger.error('WebSocket error:', error);
      handleDisconnection(ws);
    });

    // Heartbeat mechanism
    ws.on('pong', () => {
      ws.isAlive = true;
    });
  });

  // Heartbeat interval to detect broken connections
  const interval = setInterval(() => {
    wss.clients.forEach((ws: ExtendedWebSocket) => {
      if (ws.isAlive === false) {
        handleDisconnection(ws);
        return ws.terminate();
      }
      
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000); // 30 seconds

  wss.on('close', () => {
    clearInterval(interval);
  });

  logger.info('WebSocket server initialized with heartbeat monitoring');
}

async function handleMessage(ws: ExtendedWebSocket, message: WebSocketMessage, app: FastifyInstance): Promise<void> {
  try {
    switch (message.type) {
      case WSMessageType.JOIN_ROOM:
        await handleJoinRoom(ws, message as JoinRoomMessage, app);
        break;
        
      case WSMessageType.LEAVE_ROOM:
        await handleLeaveRoom(ws, message as LeaveRoomMessage);
        break;
        
      case WSMessageType.CHAT_MESSAGE:
        await handleChatMessage(ws, message as ChatMessage);
        break;
        
      case WSMessageType.MEDIA_CONTROL:
        await handleMediaControl(ws, message as MediaControlMessage);
        break;
        
      case WSMessageType.SCREEN_SHARE_START:
      case WSMessageType.SCREEN_SHARE_STOP:
        await handleScreenShare(ws, message as ScreenShareMessage);
        break;
        
      case WSMessageType.HEARTBEAT:
        // Respond to heartbeat
        sendMessage(ws, {
          type: WSMessageType.HEARTBEAT,
          timestamp: new Date(),
        });
        break;
        
      default:
        logger.warn('Unknown message type:', (message as any).type);
        sendError(ws, 'UNKNOWN_MESSAGE_TYPE', 'Unknown message type');
    }
  } catch (error) {
    logger.error('Error handling WebSocket message:', error);
    sendError(ws, 'MESSAGE_HANDLER_ERROR', 'Failed to process message');
  }
}

async function handleJoinRoom(ws: ExtendedWebSocket, message: JoinRoomMessage, app: FastifyInstance): Promise<void> {
  try {
    // Verify JWT token
    const decoded = await app.jwt.verify(message.token);
    const userId = (decoded as any).userId;
    const username = (decoded as any).username;
    
    ws.userId = userId;
    ws.roomId = message.roomId;
    
    // Add to connections map
    connections.set(userId, ws);
    
    // Add to room connections
    if (!roomConnections.has(message.roomId)) {
      roomConnections.set(message.roomId, new Map());
    }
    
    const roomUsers = roomConnections.get(message.roomId)!;
    roomUsers.set(userId, {
      userId,
      username,
      ws,
      joinedAt: new Date(),
    });
    
    // Notify other users in the room
    broadcastToRoom(message.roomId, {
      type: WSMessageType.USER_JOINED,
      roomId: message.roomId,
      userId,
      username,
      timestamp: new Date(),
    }, userId);
    
    // Send current room state to the joining user
    const currentUsers = Array.from(roomUsers.values()).map(conn => ({
      userId: conn.userId,
      username: conn.username,
      joinedAt: conn.joinedAt,
    }));
    
    sendMessage(ws, {
      type: WSMessageType.ROOM_STATE,
      roomId: message.roomId,
      users: currentUsers,
      timestamp: new Date(),
    });
    
    logger.info(`User ${username} joined room ${message.roomId}`);
  } catch (error) {
    logger.error('Error joining room:', error);
    sendError(ws, 'JOIN_ROOM_FAILED', 'Failed to join room');
  }
}

async function handleLeaveRoom(ws: ExtendedWebSocket, message: LeaveRoomMessage): Promise<void> {
  if (!ws.userId || !ws.roomId) {
    sendError(ws, 'NOT_IN_ROOM', 'Not currently in a room');
    return;
  }
  
  const roomUsers = roomConnections.get(ws.roomId);
  if (roomUsers) {
    const userConnection = roomUsers.get(ws.userId);
    if (userConnection) {
      roomUsers.delete(ws.userId);
      
      // Notify other users
      broadcastToRoom(ws.roomId, {
        type: WSMessageType.USER_LEFT,
        roomId: ws.roomId,
        userId: ws.userId,
        username: userConnection.username,
        timestamp: new Date(),
      }, ws.userId);
      
      // Clean up empty room
      if (roomUsers.size === 0) {
        roomConnections.delete(ws.roomId);
      }
    }
  }
  
  // Remove from connections
  connections.delete(ws.userId);
  
  ws.userId = undefined;
  ws.roomId = undefined;
  
  logger.info(`User left room ${message.roomId}`);
}

async function handleChatMessage(ws: ExtendedWebSocket, message: ChatMessage): Promise<void> {
  if (!ws.userId || !ws.roomId) {
    sendError(ws, 'NOT_IN_ROOM', 'Must be in a room to send messages');
    return;
  }
  
  // Add server-side timestamp and ID
  const chatMessage = {
    ...message,
    id: generateMessageId(),
    timestamp: new Date(),
    senderId: ws.userId,
  };
  
  // Broadcast to all users in the room
  broadcastToRoom(ws.roomId, chatMessage);
  
  logger.debug(`Chat message sent in room ${ws.roomId} by ${ws.userId}`);
}

async function handleMediaControl(ws: ExtendedWebSocket, message: MediaControlMessage): Promise<void> {
  if (!ws.userId || !ws.roomId) {
    sendError(ws, 'NOT_IN_ROOM', 'Must be in a room to control media');
    return;
  }
  
  // Add sender information
  const controlMessage = {
    ...message,
    senderId: ws.userId,
    timestamp: new Date(),
  };
  
  // Broadcast to all users in the room
  broadcastToRoom(ws.roomId, controlMessage, ws.userId);
  
  logger.debug(`Media control ${message.action} sent in room ${ws.roomId} by ${ws.userId}`);
}

async function handleScreenShare(ws: ExtendedWebSocket, message: ScreenShareMessage): Promise<void> {
  if (!ws.userId || !ws.roomId) {
    sendError(ws, 'NOT_IN_ROOM', 'Must be in a room to share screen');
    return;
  }
  
  // Add sender information
  const shareMessage = {
    ...message,
    senderId: ws.userId,
    timestamp: new Date(),
  };
  
  // Broadcast to all users in the room
  broadcastToRoom(ws.roomId, shareMessage, ws.userId);
  
  logger.info(`Screen share ${message.type} by ${ws.userId} in room ${ws.roomId}`);
}

function handleDisconnection(ws: ExtendedWebSocket): void {
  if (ws.userId) {
    // Remove from room if connected
    if (ws.roomId) {
      const roomUsers = roomConnections.get(ws.roomId);
      if (roomUsers) {
        const userConnection = roomUsers.get(ws.userId);
        if (userConnection) {
          roomUsers.delete(ws.userId);
          
          // Notify other users
          broadcastToRoom(ws.roomId, {
            type: WSMessageType.USER_LEFT,
            roomId: ws.roomId,
            userId: ws.userId,
            username: userConnection.username,
            timestamp: new Date(),
          }, ws.userId);
          
          // Clean up empty room
          if (roomUsers.size === 0) {
            roomConnections.delete(ws.roomId);
          }
        }
      }
    }
    
    // Remove from connections
    connections.delete(ws.userId);
    
    logger.info(`User ${ws.userId} disconnected`);
  }
}

function broadcastToRoom(roomId: string, message: any, excludeUserId?: string): void {
  const roomUsers = roomConnections.get(roomId);
  if (!roomUsers) return;
  
  roomUsers.forEach((connection, userId) => {
    if (userId !== excludeUserId && connection.ws.readyState === WebSocket.OPEN) {
      sendMessage(connection.ws, message);
    }
  });
}

function sendMessage(ws: WebSocket, message: any): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

function sendError(ws: WebSocket, code: string, message: string): void {
  sendMessage(ws, {
    type: WSMessageType.ERROR,
    error: {
      code,
      message,
    },
    timestamp: new Date(),
  });
}

function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
