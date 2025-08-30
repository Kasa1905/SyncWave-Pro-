import { z } from 'zod';

// ===== Core User Schemas =====
export const User = z.object({
  id: z.string(),
  email: z.string().email(),
  username: z.string().min(1),
  displayName: z.string().min(1),
  avatar: z.string().nullable(),
  createdAt: z.date(),
  lastActiveAt: z.date(),
  isOnline: z.boolean(),
});

export type User = z.infer<typeof User>;

// Auth request schemas
export const RegisterRequest = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(30),
  displayName: z.string().min(1).max(50),
  avatar: z.string().url().optional(),
});

export const LoginRequest = z.object({
  email: z.string().email(),
});

export type RegisterRequest = z.infer<typeof RegisterRequest>;
export type LoginRequest = z.infer<typeof LoginRequest>;

// ===== Room Schemas =====
export enum RoomType {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

export const RoomSettings = z.object({
  maxParticipants: z.number().min(1).max(1000).default(50),
  allowFileUpload: z.boolean().default(true),
  allowScreenShare: z.boolean().default(true),
  allowChat: z.boolean().default(true),
  requireApproval: z.boolean().default(false),
});

export const Room = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().nullable(),
  type: z.nativeEnum(RoomType),
  ownerId: z.string(),
  settings: RoomSettings,
  participants: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
  isActive: z.boolean(),
});

export type Room = z.infer<typeof Room>;
export type RoomSettings = z.infer<typeof RoomSettings>;

// Room request schemas
export const CreateRoomRequest = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  type: z.nativeEnum(RoomType).optional(),
  maxParticipants: z.number().min(1).max(1000).optional(),
  allowFileUpload: z.boolean().optional(),
  allowScreenShare: z.boolean().optional(),
  allowChat: z.boolean().optional(),
  requireApproval: z.boolean().optional(),
});

export const UpdateRoomRequest = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  type: z.nativeEnum(RoomType).optional(),
  settings: RoomSettings.partial().optional(),
});

export type CreateRoomRequest = z.infer<typeof CreateRoomRequest>;
export type UpdateRoomRequest = z.infer<typeof UpdateRoomRequest>;

// ===== File Schemas =====
export const MediaFile = z.object({
  id: z.string(),
  filename: z.string(),
  originalName: z.string(),
  mimeType: z.string(),
  size: z.number(),
  duration: z.number().nullable(),
  path: z.string(),
  url: z.string(),
  uploadedBy: z.string(),
  uploadedAt: z.date(),
  isProcessed: z.boolean(),
  metadata: z.record(z.any()),
});

export type MediaFile = z.infer<typeof MediaFile>;

// ===== WebSocket Schemas =====
export enum WSMessageType {
  // Connection
  JOIN_ROOM = 'join_room',
  LEAVE_ROOM = 'leave_room',
  USER_JOINED = 'user_joined',
  USER_LEFT = 'user_left',
  ROOM_STATE = 'room_state',
  
  // Chat
  CHAT_MESSAGE = 'chat_message',
  
  // Media Control
  MEDIA_CONTROL = 'media_control',
  
  // Screen Sharing
  SCREEN_SHARE_START = 'screen_share_start',
  SCREEN_SHARE_STOP = 'screen_share_stop',
  
  // System
  HEARTBEAT = 'heartbeat',
  ERROR = 'error',
}

export const BaseWSMessage = z.object({
  type: z.nativeEnum(WSMessageType),
  timestamp: z.date(),
});

export const JoinRoomMessage = BaseWSMessage.extend({
  type: z.literal(WSMessageType.JOIN_ROOM),
  roomId: z.string(),
  token: z.string(),
});

export const LeaveRoomMessage = BaseWSMessage.extend({
  type: z.literal(WSMessageType.LEAVE_ROOM),
  roomId: z.string(),
});

export const ChatMessage = BaseWSMessage.extend({
  type: z.literal(WSMessageType.CHAT_MESSAGE),
  roomId: z.string(),
  message: z.string(),
  senderId: z.string().optional(),
  id: z.string().optional(),
});

export const MediaControlMessage = BaseWSMessage.extend({
  type: z.literal(WSMessageType.MEDIA_CONTROL),
  roomId: z.string(),
  action: z.enum(['play', 'pause', 'stop', 'seek', 'volume']),
  payload: z.any().optional(),
  senderId: z.string().optional(),
});

export const ScreenShareMessage = BaseWSMessage.extend({
  type: z.union([
    z.literal(WSMessageType.SCREEN_SHARE_START),
    z.literal(WSMessageType.SCREEN_SHARE_STOP),
  ]),
  roomId: z.string(),
  senderId: z.string().optional(),
});

export const HeartbeatMessage = BaseWSMessage.extend({
  type: z.literal(WSMessageType.HEARTBEAT),
});

export const WebSocketMessage = z.union([
  JoinRoomMessage,
  LeaveRoomMessage,
  ChatMessage,
  MediaControlMessage,
  ScreenShareMessage,
  HeartbeatMessage,
]);

export type WebSocketMessage = z.infer<typeof WebSocketMessage>;
export type JoinRoomMessage = z.infer<typeof JoinRoomMessage>;
export type LeaveRoomMessage = z.infer<typeof LeaveRoomMessage>;
export type ChatMessage = z.infer<typeof ChatMessage>;
export type MediaControlMessage = z.infer<typeof MediaControlMessage>;
export type ScreenShareMessage = z.infer<typeof ScreenShareMessage>;
export type HeartbeatMessage = z.infer<typeof HeartbeatMessage>;

// ===== API Response Schemas =====
export const ApiError = z.object({
  code: z.string(),
  message: z.string(),
  details: z.any().optional(),
});

export const ApiSuccessResponse = z.object({
  success: z.literal(true),
  data: z.any(),
  timestamp: z.date(),
});

export const ApiErrorResponse = z.object({
  success: z.literal(false),
  error: ApiError,
  timestamp: z.date(),
});

export type ApiError = z.infer<typeof ApiError>;
export type ApiSuccessResponse = z.infer<typeof ApiSuccessResponse>;
export type ApiErrorResponse = z.infer<typeof ApiErrorResponse>;

// ===== Utility Functions =====
export function createSuccessResponse<T>(data: T): ApiSuccessResponse {
  return {
    success: true,
    data,
    timestamp: new Date(),
  };
}

export function createErrorResponse(
  code: string,
  message: string,
  details?: any
): ApiErrorResponse {
  return {
    success: false,
    error: { code, message, details },
    timestamp: new Date(),
  };
}
