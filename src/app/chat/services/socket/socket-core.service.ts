import { Injectable, inject } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';
import { SOCKET_EVENTS } from './socket-events.constants';

@Injectable({
  providedIn: 'root'
})
export class SocketCoreService {
  private socket!: Socket;
  private connectionStatusSubject = new BehaviorSubject<boolean>(false);
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;

  private authService = inject(AuthService);

  // Expose events for other services
  readonly EVENTS = SOCKET_EVENTS;

  constructor() {
    this.initializeSocket();
  }

  private initializeSocket(): void {
    try {
      const token = this.authService.getAccessToken();
      if (!token) {
        console.warn('No token available for socket connection');
        return;
      }

      this.socket = io(environment.socketUrl, {
        withCredentials: true,
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectInterval,
        timeout: 10000,
        auth: { token },
        extraHeaders: { 'Authorization': `Bearer ${token}` }
      });

      this.setupConnectionHandlers();
    } catch (error) {
      console.error('Socket initialization error:', error);
      this.attemptReconnect();
    }
  }

  private setupConnectionHandlers(): void {
    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.connectionStatusSubject.next(true);
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.connectionStatusSubject.next(false);

      if (reason === 'io server disconnect') {
        this.attemptReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.connectionStatusSubject.next(false);
      this.attemptReconnect();
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
      this.connectionStatusSubject.next(true);
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

      console.log(`🔄 Attempting reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);

      setTimeout(() => {
        try {
          this.initializeSocket();
        } catch (error) {
          console.error('Reconnect attempt failed:', error);
          this.attemptReconnect();
        }
      }, delay);
    } else {
      console.log('Max reconnect attempts reached. Will retry in 60 seconds...');
      setTimeout(() => {
        this.reconnectAttempts = 0;
        this.attemptReconnect();
      }, 60000);
    }
  }

  // Public methods for other services
  getSocket(): Socket {
    return this.socket;
  }

  isConnected(): Observable<boolean> {
    return this.connectionStatusSubject.asObservable();
  }

  connect(): void {
    if (!this.socket) {
      this.initializeSocket();
    } else if (!this.socket.connected) {
      try {
        const token = this.authService.getAccessToken();
        if (!token) {
          console.warn('No token available for reconnection');
          return;
        }

        this.socket.auth = { token };
        this.socket.io.opts.extraHeaders = { 'Authorization': `Bearer ${token}` };
        this.socket.connect();
      } catch (error) {
        console.error('Socket connection error:', error);
      }
    }
  }

  disconnect(): void {
    if (this.socket?.connected) {
      this.socket.disconnect();
      this.connectionStatusSubject.next(false);
    }
  }

  // Helper method for other services to emit with auto-reconnect
  emit(event: string, data?: any, callback?: Function): void {
    if (!this.socket?.connected) {
      console.log('Socket not connected, attempting to connect...');
      this.connect();
      setTimeout(() => {
        if (this.socket?.connected) {
          this.socket.emit(event, data, callback);
        } else {
          console.warn('Failed to emit event, socket still not connected:', event);
          callback && callback({ success: false, message: 'Socket not connected' });
        }
      }, 1000);
    } else {
      this.socket.emit(event, data, callback);
    }
  }

  // Helper method for listening to events
  on(event: string, callback: (...args: any[]) => void): void {
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: ((...args: any[]) => void)): void {
    this.socket?.off(event, callback);
  }

  // Get current connection status synchronously
  get connected(): boolean {
    return this.socket?.connected || false;
  }
}
