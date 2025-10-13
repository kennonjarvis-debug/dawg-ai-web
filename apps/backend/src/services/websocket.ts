/**
 * WebSocket Service for Real-time Track Updates
 * Broadcasts track changes to all connected clients
 */

import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { trackManager } from './track-manager.js';
import { TrackUpdateEvent } from '../types/track.js';

export class WebSocketService {
  private io: SocketIOServer;
  private connectedClients: Map<string, Socket> = new Map();

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST'],
      },
      transports: ['websocket', 'polling'],
    });

    this.initialize();
  }

  private initialize(): void {
    // Listen to track manager events
    trackManager.on('track-event', (event: TrackUpdateEvent) => {
      this.broadcastTrackEvent(event);
    });

    // Handle client connections
    this.io.on('connection', (socket: Socket) => {
      this.handleConnection(socket);
    });

    console.log('✅ WebSocket service initialized');
  }

  private handleConnection(socket: Socket): void {
    const clientId = socket.id;
    console.log(`🔌 Client connected: ${clientId}`);

    this.connectedClients.set(clientId, socket);

    // Send current project state on connection
    socket.emit('project:state', {
      success: true,
      data: trackManager.getProjectState(),
    });

    // Handle client events
    socket.on('track:subscribe', () => {
      socket.join('track-updates');
      console.log(`📡 Client ${clientId} subscribed to track updates`);
    });

    socket.on('track:unsubscribe', () => {
      socket.leave('track-updates');
      console.log(`📡 Client ${clientId} unsubscribed from track updates`);
    });

    // Request current state
    socket.on('project:get-state', () => {
      socket.emit('project:state', {
        success: true,
        data: trackManager.getProjectState(),
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      this.connectedClients.delete(clientId);
      console.log(`🔌 Client disconnected: ${clientId}`);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`❌ Socket error for client ${clientId}:`, error);
    });
  }

  /**
   * Broadcast track event to all subscribed clients
   */
  private broadcastTrackEvent(event: TrackUpdateEvent): void {
    // Throttle meter updates (send every 50ms max)
    if (event.type === 'track:meter') {
      // In production, implement proper throttling
      // For now, broadcast all meter updates
    }

    this.io.to('track-updates').emit('track:event', event);
  }

  /**
   * Send event to specific client
   */
  public sendToClient(clientId: string, event: string, data: any): void {
    const socket = this.connectedClients.get(clientId);
    if (socket) {
      socket.emit(event, data);
    }
  }

  /**
   * Broadcast to all clients
   */
  public broadcast(event: string, data: any): void {
    this.io.emit(event, data);
  }

  /**
   * Get connected client count
   */
  public getClientCount(): number {
    return this.connectedClients.size;
  }

  /**
   * Shutdown WebSocket service
   */
  public shutdown(): void {
    this.io.close();
    this.connectedClients.clear();
    console.log('🛑 WebSocket service shutdown');
  }
}

let websocketService: WebSocketService | null = null;

export function initializeWebSocket(httpServer: HTTPServer): WebSocketService {
  if (!websocketService) {
    websocketService = new WebSocketService(httpServer);
  }
  return websocketService;
}

export function getWebSocketService(): WebSocketService | null {
  return websocketService;
}
