/**
 * File Routes
 * Handles file upload, processing, and HLS transcoding
 */

import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { createSuccessResponse, createErrorResponse, MediaFile } from '@syncwave/shared';
import { promises as fs } from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import ffmpeg from 'fluent-ffmpeg';
import { Config } from '@/config/index.js';

// In-memory file store (replace with database in production)
const files = new Map<string, MediaFile>();

export async function fileRoutes(app: FastifyInstance): Promise<void> {
  // Upload file
  app.post('/upload', {
    preHandler: async (request: FastifyRequest) => {
      await request.jwtVerify();
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const payload = request.user as any;
      const parts = request.parts();
      
      for await (const part of parts) {
        if (part.type === 'file') {
          // Validate file type
          const allowedTypes = ['audio/mpeg', 'audio/mp4', 'video/mp4', 'audio/wav'];
          if (!allowedTypes.includes(part.mimetype || '')) {
            const response = createErrorResponse(
              'INVALID_FILE_TYPE',
              'Only MP3, MP4, and WAV files are allowed'
            );
            return reply.status(400).send(response);
          }

          // Generate unique filename
          const fileId = generateFileId();
          const extension = getFileExtension(part.filename || '');
          const filename = `${fileId}${extension}`;
          const filePath = path.join('./uploads', filename);

          // Ensure uploads directory exists
          await fs.mkdir('./uploads', { recursive: true });

          // Save file
          await pipeline(part.file, require('fs').createWriteStream(filePath));

          // Get file stats
          const stats = await fs.stat(filePath);

          // Create media file record
          const mediaFile: MediaFile = {
            id: fileId,
            filename: part.filename || filename,
            originalName: part.filename || filename,
            mimeType: part.mimetype || 'application/octet-stream',
            size: stats.size,
            duration: null, // Will be populated after processing
            path: filePath,
            url: `/uploads/${filename}`,
            uploadedBy: payload.userId,
            uploadedAt: new Date(),
            isProcessed: false,
            metadata: {},
          };

          files.set(fileId, mediaFile);

          // Start background processing for audio/video files
          if (part.mimetype?.startsWith('audio/') || part.mimetype?.startsWith('video/')) {
            // Note: Pass config through route context or global state in production
            processMediaFile(mediaFile, {
              maxFileSize: 100 * 1024 * 1024,
              ffmpegPath: 'ffmpeg',
              hlsSegmentDuration: 10,
              hlsPlaylistSize: 5
            } as Config).catch(error => {
              app.log.error({ error }, 'Media processing error');
            });
          }

          const response = createSuccessResponse({ file: mediaFile });
          return reply.send(response);
        }
      }

      const response = createErrorResponse(
        'NO_FILE_PROVIDED',
        'No file was provided'
      );
      reply.status(400).send(response);
    } catch (error) {
      app.log.error({ error }, 'File upload error');
      const response = createErrorResponse(
        'UPLOAD_FAILED',
        'Failed to upload file'
      );
      reply.status(500).send(response);
    }
  });

  // Get file by ID
  app.get('/:fileId', {
    preHandler: async (request: FastifyRequest) => {
      await request.jwtVerify();
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { fileId } = request.params as { fileId: string };
      
      const file = files.get(fileId);
      if (!file) {
        const response = createErrorResponse(
          'FILE_NOT_FOUND',
          'File not found'
        );
        return reply.status(404).send(response);
      }

      const response = createSuccessResponse({ file });
      reply.send(response);
    } catch (error) {
      app.log.error({ error }, 'Get file error');
      const response = createErrorResponse(
        'FILE_FETCH_FAILED',
        'Failed to fetch file'
      );
      reply.status(400).send(response);
    }
  });

  // Delete file
  app.delete('/:fileId', {
    preHandler: async (request: FastifyRequest) => {
      await request.jwtVerify();
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { fileId } = request.params as { fileId: string };
      const payload = request.user as any;
      
      const file = files.get(fileId);
      if (!file) {
        const response = createErrorResponse(
          'FILE_NOT_FOUND',
          'File not found'
        );
        return reply.status(404).send(response);
      }

      // Check if user owns the file
      if (file.uploadedBy !== payload.userId) {
        const response = createErrorResponse(
          'ACCESS_DENIED',
          'You can only delete your own files'
        );
        return reply.status(403).send(response);
      }

      // Delete physical file
      try {
        await fs.unlink(file.path);
        
        // Delete HLS files if they exist
        if (file.metadata.hlsPath) {
          const hlsDir = path.dirname(file.metadata.hlsPath);
          await fs.rm(hlsDir, { recursive: true, force: true });
        }
      } catch (fsError) {
        app.log.warn({ error: fsError }, 'Failed to delete physical file');
      }

      // Remove from memory store
      files.delete(fileId);

      const response = createSuccessResponse({ 
        message: 'File deleted successfully' 
      });
      reply.send(response);
    } catch (error) {
      app.log.error({ error }, 'Delete file error');
      const response = createErrorResponse(
        'FILE_DELETE_FAILED',
        'Failed to delete file'
      );
      reply.status(400).send(response);
    }
  });

  // Get user's files
  app.get('/user/files', {
    preHandler: async (request: FastifyRequest) => {
      await request.jwtVerify();
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const payload = request.user as any;
      
      const userFiles = Array.from(files.values()).filter(
        file => file.uploadedBy === payload.userId
      );

      const response = createSuccessResponse({ files: userFiles });
      reply.send(response);
    } catch (error) {
      app.log.error({ error }, 'Get user files error');
      const response = createErrorResponse(
        'FILES_FETCH_FAILED',
        'Failed to fetch user files'
      );
      reply.status(400).send(response);
    }
  });
}

// Helper functions
function generateFileId(): string {
  return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getFileExtension(filename: string): string {
  return path.extname(filename).toLowerCase();
}

// Media processing function
async function processMediaFile(file: MediaFile, config: Config): Promise<void> {
  try {
    // Get media metadata
    const metadata = await getMediaMetadata(file.path);
    file.duration = metadata.duration;
    file.metadata = { ...file.metadata, ...metadata };

    // Generate HLS for streaming
    if (file.mimeType.startsWith('audio/') || file.mimeType.startsWith('video/')) {
      const hlsPath = await generateHLS(file, config);
      file.metadata.hlsPath = hlsPath;
    }

    file.isProcessed = true;
  } catch (error) {
    console.error('Media processing failed:', error);
    file.metadata.processingError = error instanceof Error ? error.message : String(error);
  }
}

// Get media metadata using ffprobe
function getMediaMetadata(filePath: string): Promise<any> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(err);
      } else {
        resolve({
          duration: metadata.format.duration,
          bitrate: metadata.format.bit_rate,
          format: metadata.format.format_name,
          streams: metadata.streams.map(stream => ({
            codec: stream.codec_name,
            type: stream.codec_type,
            bitrate: stream.bit_rate,
            duration: stream.duration,
          })),
        });
      }
    });
  });
}

// Generate HLS playlist and segments
function generateHLS(file: MediaFile, config: Config): Promise<string> {
  return new Promise((resolve, reject) => {
    const hlsDir = path.join('./uploads/hls', file.id);
    const hlsPath = path.join(hlsDir, 'playlist.m3u8');

    // Create HLS directory
    require('fs').mkdirSync(hlsDir, { recursive: true });

    ffmpeg(file.path)
      .outputOptions([
        '-c:v libx264',
        '-c:a aac',
        '-hls_time 10',
        '-hls_playlist_type vod',
        '-hls_segment_filename', path.join(hlsDir, 'segment%03d.ts'),
        '-f hls'
      ])
      .output(hlsPath)
      .on('end', () => {
        resolve(hlsPath);
      })
      .on('error', (err) => {
        reject(err);
      })
      .run();
  });
}
