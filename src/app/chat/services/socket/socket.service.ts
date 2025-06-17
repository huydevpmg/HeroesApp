import { Injectable, inject } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Message } from '../../models/message.model';
import { Conversation } from '../../models/conversation.model';
import { AuthService } from '../../../core/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket!: Socket;
  private messageSubject = new Subject<Message>();
  private typingSubject = new Subject<{ userId: string; isTyping: boolean }>();
  private onlineStatusSubject = new Subject<{ userId: string; status: 'online' | 'offline' }>();

  // New: store current online user ids and expose as observable
  private onlineUserIds = new Set<string>();
  private onlineUserIdsSubject = new BehaviorSubject<Set<string>>(new Set());

  private groupCreatedSubject = new Subject<Conversation>();
  private reactionSubject = new Subject<{ messageId: string; userId: string; emoji: string }>();
  private reactionRemovedSubject = new Subject<{ messageId: string; userId: string }>();
  private conversationUpdatedSubject = new Subject<{ conversationId: string; type: 'pin' | 'archive' | 'label'; data: any }>();
  private connectionStatusSubject = new BehaviorSubject<boolean>(false);
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000; // 3 seconds

  private authService = inject(AuthService);

  private readonly EVENTS = {
    CONNECTION: 'connection',
    DISCONNECT: 'disconnect',
    JOIN_ROOM: 'join_room',
    SEND_MESSAGE: 'send_message',
    TYPING: 'typing',
    GROUP_CREATED: 'group_created',
    RECEIVE_MESSAGE: 'receive_message',
    USER_TYPING: 'user_typing',
    NEW_GROUP: 'new_group',
    USER_STATUS_CHANGE: 'user_status_change',
    CONNECT_CONVERSATION: 'connect_conversation',
    MESSAGE_REACTION: 'message_reaction',
    REMOVE_REACTION: 'remove_reaction',
    MARK_AS_READ: 'mark_as_read',
    PIN_CONVERSATION: 'pin_conversation',
    ARCHIVE_CONVERSATION: 'archive_conversation',
    ADD_LABEL: 'add_label',
    REMOVE_LABEL: 'remove_label',
  };

  constructor() {
    this.initializeSocket();
  }

  private initializeSocket(): void {
    try {
      const token = this.authService.getAccessToken();
      if (!token) {
        return;
      }

      this.socket = io(environment.socketUrl, {
        withCredentials: true,
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectInterval,
        timeout: 10000,
        auth: {
          token: token
        },
        extraHeaders: {
          'Authorization': `Bearer ${token}`
        }
      });

      this.socket.on('connect', () => {
        this.connectionStatusSubject.next(true);
        this.reconnectAttempts = 0;
      });

      this.socket.on('disconnect', (reason) => {
        this.connectionStatusSubject.next(false);

        if (reason === 'io server disconnect') {
          this.attemptReconnect();
        }
      });

      this.socket.on('connect_error', (error) => {
        this.connectionStatusSubject.next(false);
        this.attemptReconnect();
      });

      this.socket.on('reconnect', (attemptNumber) => {
        this.connectionStatusSubject.next(true);
      });

      this.setupSocketListeners();
    } catch (error) {
      this.attemptReconnect();
    }
  }

  private setupSocketListeners(): void {
    this.socket.on(this.EVENTS.RECEIVE_MESSAGE, (message: Message) => {
      this.messageSubject.next(message);
    });

    this.socket.on(this.EVENTS.USER_TYPING, (data: { userId: string; isTyping: boolean }) => {
      this.typingSubject.next(data);
    });

    // Update to handle both online user list and single user status
    this.socket.on(this.EVENTS.USER_STATUS_CHANGE, (data: any) => {
      console.log('Received user status change:', data);
      if (data.onlineUsers) {
        console.log('Updating online users list:', data.onlineUsers);
        this.onlineUserIds = new Set(data.onlineUsers);
        this.onlineUserIdsSubject.next(new Set(this.onlineUserIds));
      } else if (data.userId && data.status) {
        console.log('Updating single user status:', data);
        if (data.status === 'online') {
          this.onlineUserIds.add(data.userId);
        } else if (data.status === 'offline') {
          this.onlineUserIds.delete(data.userId);
        }
        this.onlineUserIdsSubject.next(new Set(this.onlineUserIds));
        // Also emit for legacy usage
        this.onlineStatusSubject.next(data);
      }
    });

    this.socket.on(this.EVENTS.NEW_GROUP, (group: Conversation) => {
      this.groupCreatedSubject.next(group);
    });

    this.socket.on(this.EVENTS.MESSAGE_REACTION, (data: { messageId: string; userId: string; emoji: string }) => {
      this.reactionSubject.next(data);
    });

    this.socket.on(this.EVENTS.REMOVE_REACTION, (data: { messageId: string; userId: string }) => {
      this.reactionRemovedSubject.next(data);
    });

    this.socket.on(this.EVENTS.PIN_CONVERSATION, (data: { conversationId: string; result: any }) => {
      this.conversationUpdatedSubject.next({ conversationId: data.conversationId, type: 'pin', data: data.result });
    });

    this.socket.on(this.EVENTS.ARCHIVE_CONVERSATION, (data: { conversationId: string; result: any }) => {
      this.conversationUpdatedSubject.next({ conversationId: data.conversationId, type: 'archive', data: data.result });
    });

    this.socket.on(this.EVENTS.ADD_LABEL, (data: { conversationId: string; result: any }) => {
      this.conversationUpdatedSubject.next({ conversationId: data.conversationId, type: 'label', data: data.result });
    });

    this.socket.on(this.EVENTS.REMOVE_LABEL, (data: { conversationId: string; result: any }) => {
      this.conversationUpdatedSubject.next({ conversationId: data.conversationId, type: 'label', data: data.result });
    });
  }

  joinConversation(conversationId: string): void {
    if (!this.socket) {
      return;
    }

    if (this.socket.connected) {
      this.socket.emit(this.EVENTS.JOIN_ROOM, conversationId);
    } else {
      this.connect();
      const retryJoin = (attempt = 1) => {
        if (attempt > 5) {
          return;
        }
        setTimeout(() => {
          if (this.socket.connected) {
            this.socket.emit(this.EVENTS.JOIN_ROOM, conversationId);
          } else {
            retryJoin(attempt + 1);
          }
        }, Math.min(1000 * Math.pow(2, attempt), 10000));
      };
      retryJoin();
    }
  }

  connectConversation(partnerId: string): Promise<{ success: boolean; conversationId: string }> {
    return new Promise((resolve) => {
      if (!this.socket.connected) {
        this.connect();
        setTimeout(() => {
          this.socket.emit(this.EVENTS.CONNECT_CONVERSATION, { partnerId }, (response: any) => {
            resolve(response);
          });
        }, 1000);
      } else {
        this.socket.emit(this.EVENTS.CONNECT_CONVERSATION, { partnerId }, (response: any) => {
          resolve(response);
        });
      }
    });
  }

  sendMessage(message: Message): Promise<{ success: boolean; message: Message }> {
    return new Promise((resolve, reject) => {
      if (!this.socket.connected) {
        this.connect();
        setTimeout(() => {
          this.sendMessageToServer(message, resolve, reject);
        }, 1000);
      } else {
        this.sendMessageToServer(message, resolve, reject);
      }
    });
  }

  private sendMessageToServer(message: Message, resolve: Function, reject: Function): void {
    this.socket.timeout(5000).emit(this.EVENTS.SEND_MESSAGE, {
      conversationId: message.conversationId,
      content: message.content,
      senderId: message.senderId,
      parentMessage: message.parentMessage,
      heroContext: message.heroContext,
      attachments: message.attachments
    }, (err: any, response: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(response);
      }
    });
  }

  startTyping(conversationId: string): void {
    if (this.socket.connected) {
      this.socket.emit(this.EVENTS.TYPING, { conversationId, isTyping: true });
    } else {
      this.connect();
    }
  }

  stopTyping(conversationId: string): void {
    if (this.socket.connected) {
      this.socket.emit(this.EVENTS.TYPING, { conversationId, isTyping: false });
    }
  }

  markMessageAsRead(conversationId: string, messageId: string): Promise<{ success: boolean; result: any }> {
    return new Promise((resolve) => {
      if (!this.socket.connected) {
        this.connect();
        setTimeout(() => {
          this.socket.emit(this.EVENTS.MARK_AS_READ, { conversationId, messageId }, (response: any) => {
            resolve(response);
          });
        }, 1000);
      } else {
        this.socket.emit(this.EVENTS.MARK_AS_READ, { conversationId, messageId }, (response: any) => {
          resolve(response);
        });
      }
    });
  }

  addReaction(messageId: string, emoji: string): Promise<{ success: boolean; message: Message }> {
    return new Promise((resolve) => {
      if (!this.socket.connected) {
        this.connect();
        setTimeout(() => {
          this.socket.emit(this.EVENTS.MESSAGE_REACTION, { messageId, emoji }, (response: any) => {
            resolve(response);
          });
        }, 1000);
      } else {
        this.socket.emit(this.EVENTS.MESSAGE_REACTION, { messageId, emoji }, (response: any) => {
          resolve(response);
        });
      }
    });
  }

  removeReaction(messageId: string): Promise<{ success: boolean; message: Message }> {
    return new Promise((resolve) => {
      if (!this.socket.connected) {
        this.connect();
        setTimeout(() => {
          this.socket.emit(this.EVENTS.REMOVE_REACTION, { messageId }, (response: any) => {
            resolve(response);
          });
        }, 1000);
      } else {
        this.socket.emit(this.EVENTS.REMOVE_REACTION, { messageId }, (response: any) => {
          resolve(response);
        });
      }
    });
  }

  onMessage(): Observable<Message> {
    return this.messageSubject.asObservable();
  }

  onTyping(): Observable<{ userId: string; isTyping: boolean }> {
    return this.typingSubject.asObservable();
  }

  onOnlineStatus(): Observable<{ userId: string; status: 'online' | 'offline' }> {
    return this.onlineStatusSubject.asObservable();
  }

  // New: observable for online user ids
  onOnlineUserIds(): Observable<Set<string>> {
    return this.onlineUserIdsSubject.asObservable();
  }

  onGroupCreated(): Observable<Conversation> {
    return this.groupCreatedSubject.asObservable();
  }

  onReaction(): Observable<{ messageId: string; userId: string; emoji: string }> {
    return this.reactionSubject.asObservable();
  }

  onReactionRemoved(): Observable<{ messageId: string; userId: string }> {
    return this.reactionRemovedSubject.asObservable();
  }

  onConversationUpdated(): Observable<{ conversationId: string; type: 'pin' | 'archive' | 'label'; data: any }> {
    return this.conversationUpdatedSubject.asObservable();
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

      setTimeout(() => {
        try {
          this.initializeSocket();
        } catch (error) {
          this.attemptReconnect();
        }
      }, delay);
    } else {
      setTimeout(() => {
        this.reconnectAttempts = 0;
        this.attemptReconnect();
      }, 60000);
    }
  }

  connect(): void {
    if (!this.socket) {
      this.initializeSocket();
    } else if (!this.socket.connected) {
      try {
        const token = this.authService.getAccessToken();
        if (!token) {
          return;
        }
        this.socket.auth = { token: token };
        this.socket.io.opts.extraHeaders = {
          'Authorization': `Bearer ${token}`
        };
        this.socket.connect();
      } catch (error) {
        // Handle connection error
      }
    }
  }

  disconnect(): void {
    if (this.socket.connected) {
      this.socket.disconnect();
      this.connectionStatusSubject.next(false);
    }
  }

  isConnected(): Observable<boolean> {
    return this.connectionStatusSubject.asObservable();
  }

  getSocket(): Socket {
    return this.socket;
  }
}
