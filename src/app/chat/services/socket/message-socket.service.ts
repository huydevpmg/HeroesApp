import { Injectable, inject } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Message } from '../../models/message.model';
import { SocketCoreService } from './socket-core.service';
import { SOCKET_EVENTS } from './socket-events.constants';

@Injectable({
  providedIn: 'root'
})
export class MessageSocketService {
  private socketCore = inject(SocketCoreService);

  // Message subjects
  private messageSubject = new Subject<Message>();
  private messageUpdatedSubject = new Subject<Message>();
  private messageDeletedGlobalSubject = new Subject<{ messageId: string; conversationId: string }>();
  private messageDeletedPersonalSubject = new Subject<{ messageId: string; userId: string; conversationId: string }>();

  // Typing subjects
  private typingSubject = new Subject<{ userId: string; isTyping: boolean }>();

  constructor() {
    this.setupMessageListeners();
  }

  private setupMessageListeners(): void {
    // Message received
    this.socketCore.on(SOCKET_EVENTS.RECEIVE_MESSAGE, (message: Message) => {
      console.log('Message received:', message);
      this.messageSubject.next(message);
    });

    // Typing indicators
    this.socketCore.on(SOCKET_EVENTS.USER_TYPING, (data: { userId: string; isTyping: boolean }) => {
      this.typingSubject.next(data);
    });

    // Message updated
    this.socketCore.on(SOCKET_EVENTS.MESSAGE_UPDATED, (message: Message) => {
      console.log('Message updated:', message);
      this.messageUpdatedSubject.next(message);
    });

    // Message deleted globally
    this.socketCore.on(SOCKET_EVENTS.MESSAGE_DELETED_GLOBAL, (data: { messageId: string; conversationId: string }) => {
      console.log('Message deleted globally:', data);
      this.messageDeletedGlobalSubject.next(data);
    });

    // Message deleted personally
    this.socketCore.on(SOCKET_EVENTS.MESSAGE_DELETED_PERSONAL, (data: { messageId: string; userId: string; conversationId: string }) => {
      console.log('Message deleted personally:', data);
      this.messageDeletedPersonalSubject.next(data);
    });
  }

  // Send message
  sendMessage(message: Message): Promise<{ success: boolean; message: Message }> {
    return new Promise((resolve, reject) => {
      console.log('Sending message via socket:', message);

      const payload: any = {
        conversationId: message.conversationId,
        content: message.content,
        senderId: message.senderId,
        parentMessage: message.parentMessage,
        heroContext: message.heroContext
      };

      // Single file support
      if (message.attachmentId) {
        payload.attachmentId = message.attachmentId;
      }

      // Multiple files support
      const multi = (message as any).attachmentIds;
      if (Array.isArray(multi) && multi.length) {
        payload.attachments = multi;
      }

      this.socketCore.getSocket().timeout(5000).emit(
        SOCKET_EVENTS.SEND_MESSAGE,
        payload,
        (err: any, response: any) => {
          if (err) {
            console.error('Failed to send message:', err);
            reject(err);
          } else {
            console.log('✅ Message sent successfully:', response);
            resolve(response);
          }
        }
      );
    });
  }

  // Edit message
  editMessage(messageId: string, content: string): Promise<{ success: boolean; message: Message }> {
    return new Promise((resolve) => {
      console.log('✏️ Editing message:', { messageId, content });

      this.socketCore.emit(
        SOCKET_EVENTS.EDIT_MESSAGE,
        { messageId, content },
        (response: any) => {
          if (response.success) {
            console.log('✅ Message edited successfully:', response);
          } else {
            console.error('Failed to edit message:', response);
          }
          resolve(response);
        }
      );
    });
  }

  // Delete message
  deleteMessage(messageId: string, deleteType: 'everyone' | 'justme'): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve) => {
      console.log('Deleting message:', { messageId, deleteType });

      this.socketCore.emit(
        SOCKET_EVENTS.DELETE_MESSAGE,
        { messageId, deleteType },
        (response: any) => {
          if (response.success) {
            console.log('✅ Message deleted successfully:', response);
          } else {
            console.error('Failed to delete message:', response);
          }
          resolve(response);
        }
      );
    });
  }

  // Typing indicators
  startTyping(conversationId: string): void {
    this.socketCore.emit(SOCKET_EVENTS.TYPING, { conversationId, isTyping: true });
  }

  stopTyping(conversationId: string): void {
    this.socketCore.emit(SOCKET_EVENTS.TYPING, { conversationId, isTyping: false });
  }

  // Mark as read
  markMessageAsRead(conversationId: string, messageId: string): Promise<{ success: boolean; result: any }> {
    return new Promise((resolve) => {
      this.socketCore.emit(
        SOCKET_EVENTS.MARK_AS_READ,
        { conversationId, messageId },
        (response: any) => resolve(response)
      );
    });
  }

  // Observables
  onMessage(): Observable<Message> {
    return this.messageSubject.asObservable();
  }

  onTyping(): Observable<{ userId: string; isTyping: boolean }> {
    return this.typingSubject.asObservable();
  }

  onMessageUpdated(): Observable<Message> {
    return this.messageUpdatedSubject.asObservable();
  }

  onMessageDeletedGlobal(): Observable<{ messageId: string; conversationId: string }> {
    return this.messageDeletedGlobalSubject.asObservable();
  }

  onMessageDeletedPersonal(): Observable<{ messageId: string; userId: string; conversationId: string }> {
    return this.messageDeletedPersonalSubject.asObservable();
  }
}
