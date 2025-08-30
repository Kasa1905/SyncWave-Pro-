/**
 * Server Configuration
 * Manages environment variables and application settings
 */

import { z } from 'zod';
import { config as loadEnv } from 'dotenv';

// Load environment variables
loadEnv();

const ConfigSchema = z.object({
  // Server Settings
  port: z.coerce.number().default(3001),
  wsPort: z.coerce.number().default(3002),
  host: z.string().default('localhost'),
  
  // Environment
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  logLevel: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  
  // Security
  jwtSecret: z.string().min(32),
  corsOrigin: z.string().default('http://localhost:3000'),
  
  // File Upload
  maxFileSize: z.coerce.number().default(100 * 1024 * 1024), // 100MB
  uploadDir: z.string().default('./uploads'),
  
  // Database (for future use)
  databaseUrl: z.string().optional(),
  
  // Redis (for session storage)
  redisUrl: z.string().optional(),
  
  // FFmpeg
  ffmpegPath: z.string().default('ffmpeg'),
  ffprobePath: z.string().default('ffprobe'),
  
  // HLS Settings
  hlsSegmentDuration: z.coerce.number().default(10),
  hlsPlaylistSize: z.coerce.number().default(5),
});

export type Config = z.infer<typeof ConfigSchema>;

let config: Config | null = null;

export function loadConfig(): Config {
  if (config) {
    return config;
  }

  const rawConfig = {
    port: process.env.PORT,
    wsPort: process.env.WS_PORT,
    host: process.env.HOST,
    nodeEnv: process.env.NODE_ENV,
    logLevel: process.env.LOG_LEVEL,
    jwtSecret: process.env.JWT_SECRET,
    corsOrigin: process.env.CORS_ORIGIN,
    maxFileSize: process.env.MAX_FILE_SIZE,
    uploadDir: process.env.UPLOAD_DIR,
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    ffmpegPath: process.env.FFMPEG_PATH,
    ffprobePath: process.env.FFPROBE_PATH,
    hlsSegmentDuration: process.env.HLS_SEGMENT_DURATION,
    hlsPlaylistSize: process.env.HLS_PLAYLIST_SIZE,
  };

  try {
    config = ConfigSchema.parse(rawConfig);
    return config;
  } catch (error) {
    console.error('Configuration validation failed:', error);
    throw new Error('Invalid configuration. Check your environment variables.');
  }
}

export function getConfig(): Config {
  if (!config) {
    throw new Error('Configuration not loaded. Call loadConfig() first.');
  }
  return config;
}

// Validate critical environment variables
export function validateEnvironment(): void {
  const required = ['JWT_SECRET'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
