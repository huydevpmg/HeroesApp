import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Message } from '../../models/message.model';
import { Conversation } from '../../models/conversation.model';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket!: Socket;
  private messageSubject = new Subject<Message>();
  private typingSubject = new Subject<{ userId: string; isTyping: boolean }>();
  private onlineStatusSubject = new Subject<{ userId: string; status: 'online' | 'offline' }>();
  private groupCreatedSubject = new Subject<Conversation>();
  private reactionSubject = new Subject<{ messageId: string; userId: string; emoji: string }>();
  private reactionRemovedSubject = new Subject<{ messageId: string; userId: string }>();
  private conversationUpdatedSubject = new Subject<{ conversationId: string; type: 'pin' | 'archive' | 'label'; data: any }>();

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
    this.socket = io(environment.socketUrl, {
      withCredentials: true,
      transports: ['websocket']
    });

    this.setupSocketListeners();
  }

  private setupSocketListeners(): void {
    // Message events
    this.socket.on(this.EVENTS.RECEIVE_MESSAGE, (message: Message) => {
      this.messageSubject.next(message);
    });

    // Typing events
    this.socket.on(this.EVENTS.USER_TYPING, (data: { userId: string; isTyping: boolean }) => {
      this.typingSubject.next(data);
    });

    // Online status events
    this.socket.on(this.EVENTS.USER_STATUS_CHANGE, (data: { userId: string; status: 'online' | 'offline' }) => {
      this.onlineStatusSubject.next(data);
    });

    // Group events
    this.socket.on(this.EVENTS.NEW_GROUP, (group: Conversation) => {
      this.groupCreatedSubject.next(group);
    });

    // Reaction events
    this.socket.on(this.EVENTS.MESSAGE_REACTION, (data: { messageId: string; userId: string; emoji: string }) => {
      this.reactionSubject.next(data);
    });

    this.socket.on(this.EVENTS.REMOVE_REACTION, (data: { messageId: string; userId: string }) => {
      this.reactionRemovedSubject.next(data);
    });

    // Conversation update events
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

    // Connection events
    this.socket.on(this.EVENTS.CONNECTION, () => {
      console.log('Socket connected');
    });

    this.socket.on(this.EVENTS.DISCONNECT, () => {
      console.log('Socket disconnected');
    });

    this.socket.on('error', (error: any) => {
      console.error('Socket error:', error);
    });
  }

  // Join/Leave conversation rooms
  joinConversation(conversationId: string): void {
    this.socket.emit(this.EVENTS.JOIN_ROOM, conversationId);
  }

  connectConversation(partnerId: string): Promise<{ success: boolean; conversationId: string }> {
    return new Promise((resolve) => {
      this.socket.emit(this.EVENTS.CONNECT_CONVERSATION, { partnerId }, (response: any) => {
        resolve(response);
      });
    });
  }

  // Message events
  sendMessage(message: Message): Promise<{ success: boolean; message: Message }> {
    return new Promise((resolve) => {
      this.socket.emit(this.EVENTS.SEND_MESSAGE, {
        conversationId: message.conversationId,
        content: message.content
      }, (response: any) => {
        resolve(response);
      });
    });
  }

  markMessageAsRead(conversationId: string, messageId: string): Promise<{ success: boolean; result: any }> {
    return new Promise((resolve) => {
      this.socket.emit(this.EVENTS.MARK_AS_READ, { conversationId, messageId }, (response: any) => {
        resolve(response);
      });
    });
  }

  // Typing events
  startTyping(conversationId: string): void {
    this.socket.emit(this.EVENTS.TYPING, { conversationId, isTyping: true });
  }

  stopTyping(conversationId: string): void {
    this.socket.emit(this.EVENTS.TYPING, { conversationId, isTyping: false });
  }

  // Reaction events
  addReaction(messageId: string, emoji: string): Promise<{ success: boolean; message: Message }> {
    return new Promise((resolve) => {
      this.socket.emit(this.EVENTS.MESSAGE_REACTION, { messageId, emoji }, (response: any) => {
        resolve(response);
      });
    });
  }

  removeReaction(messageId: string): Promise<{ success: boolean; message: Message }> {
    return new Promise((resolve) => {
      this.socket.emit(this.EVENTS.REMOVE_REACTION, { messageId }, (response: any) => {
        resolve(response);
      });
    });
  }

  // Conversation management
  togglePin(conversationId: string): Promise<{ success: boolean; result: any }> {
    return new Promise((resolve) => {
      this.socket.emit(this.EVENTS.PIN_CONVERSATION, { conversationId }, (response: any) => {
        resolve(response);
      });
    });
  }

  toggleArchive(conversationId: string): Promise<{ success: boolean; result: any }> {
    return new Promise((resolve) => {
      this.socket.emit(this.EVENTS.ARCHIVE_CONVERSATION, { conversationId }, (response: any) => {
        resolve(response);
      });
    });
  }

  addLabel(conversationId: string, label: string): Promise<{ success: boolean; result: any }> {
    return new Promise((resolve) => {
      this.socket.emit(this.EVENTS.ADD_LABEL, { conversationId, label }, (response: any) => {
        resolve(response);
      });
    });
  }

  removeLabel(conversationId: string, label: string): Promise<{ success: boolean; result: any }> {
    return new Promise((resolve) => {
      this.socket.emit(this.EVENTS.REMOVE_LABEL, { conversationId, label }, (response: any) => {
        resolve(response);
      });
    });
  }

  // Observables
  onMessage(): Observable<Message> {
    return this.messageSubject.asObservable();
  }

  onTyping(): Observable<{ userId: string; isTyping: boolean }> {
    return this.typingSubject.asObservable();
  }

  onOnlineStatus(): Observable<{ userId: string; status: 'online' | 'offline' }> {
    return this.onlineStatusSubject.asObservable();
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

  // Connection management
  connect(): void {
    if (!this.socket.connected) {
      this.socket.connect();
    }
  }

  disconnect(): void {
    if (this.socket.connected) {
      this.socket.disconnect();
    }
  }
}