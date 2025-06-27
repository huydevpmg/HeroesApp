import { Injectable, inject } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { SocketCoreService } from './socket-core.service';
import { SOCKET_EVENTS } from './socket-events.constants';

@Injectable({
  providedIn: 'root'
})
export class PresenceSocketService {
  private socketCore = inject(SocketCoreService);

  private onlineStatusSubject = new Subject<{ userId: string; status: 'online' | 'offline' }>();
  private onlineUserIds = new Set<string>();
  private onlineUserIdsSubject = new BehaviorSubject<Set<string>>(new Set());

  constructor() {
    this.setupPresenceListeners();
  }

  private setupPresenceListeners(): void {
    this.socketCore.on(SOCKET_EVENTS.USER_STATUS_CHANGE, (data: any) => {
      if (data.onlineUsers) {
        this.onlineUserIds = new Set(data.onlineUsers);
        this.onlineUserIdsSubject.next(new Set(this.onlineUserIds));
      } else if (data.userId && data.status) {

        if (data.status === 'online') {
          this.onlineUserIds.add(data.userId);
        } else if (data.status === 'offline') {
          this.onlineUserIds.delete(data.userId);
        }

        this.onlineUserIdsSubject.next(new Set(this.onlineUserIds));
        this.onlineStatusSubject.next(data);
      }
    });
  }

  // Check if user is online
  isUserOnline(userId: string): boolean {
    return this.onlineUserIds.has(userId);
  }

  // Get all online users
  getOnlineUsers(): Set<string> {
    return new Set(this.onlineUserIds);
  }

  // Get online users count
  getOnlineUsersCount(): number {
    return this.onlineUserIds.size;
  }

  // Check if multiple users are online
  areUsersOnline(userIds: string[]): { [userId: string]: boolean } {
    const result: { [userId: string]: boolean } = {};
    userIds.forEach(userId => {
      result[userId] = this.isUserOnline(userId);
    });
    return result;
  }

  // Observables
  onOnlineStatus(): Observable<{ userId: string; status: 'online' | 'offline' }> {
    return this.onlineStatusSubject.asObservable();
  }

  onOnlineUserIds(): Observable<Set<string>> {
    return this.onlineUserIdsSubject.asObservable();
  }

  // Get current online status as observable with current value
  getCurrentOnlineUsers(): Observable<Set<string>> {
    return this.onlineUserIdsSubject.asObservable();
  }
}
