import { Injectable, inject } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Message } from '../../../shared/enums/models/message.model';
import { SocketCoreService } from './socket-core.service';
import { SOCKET_EVENTS } from './socket-events.constants';
import { DeleteType } from '../../../shared/enums/models/delete-type.enum';
import { Store } from '@ngrx/store';
import * as ConversationActions from '../../store/conversation/conversation.actions';
import * as MessageActions from '../../store/message/message.actions';
import { selectSelectedConversationId } from '../../store/conversation/conversation.selectors';
import { take } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class MessageSocketService {
  private socketCore = inject(SocketCoreService);
  private store = inject(Store);

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
      this.store.dispatch(ConversationActions.loadConversations({ page: 1, limit: 20 }));
      this.store.select(selectSelectedConversationId).pipe(take(1)).subscribe(selectedId => {
        if (selectedId === message.conversationId) {
          this.store.dispatch(MessageActions.receiveMessage({ message }));
        }
      });
    });

    // Typing indicators
    this.socketCore.on(SOCKET_EVENTS.USER_TYPING, (data: { userId: string; isTyping: boolean }) => {
      this.typingSubject.next(data);
    });

    // Message updated
    this.socketCore.on(SOCKET_EVENTS.MESSAGE_UPDATED, (message: Message) => {
      this.messageUpdatedSubject.next(message);
    });

    this.socketCore.on(SOCKET_EVENTS.MESSAGE_DELETED_GLOBAL, (data: {
      messageId: string;
      conversationId: string;
      affectedReplies?: string[];
    }) => {
      this.store.dispatch(ConversationActions.loadConversations({ page: 1, limit: 20 }));
      this.store.dispatch(MessageActions.deleteMessageSuccess({
        messageId: data.messageId,
        deleteType: DeleteType.EVERYONE,
        affectedReplies: data.affectedReplies || []
      }));
    });

    // Message deleted personally
    this.socketCore.on(SOCKET_EVENTS.MESSAGE_DELETED_PERSONAL, (data: { messageId: string; userId: string; conversationId: string }) => {
      this.messageDeletedPersonalSubject.next(data);
    });
  }

  // Send message
  sendMessage(message: Message): Promise<{ success: boolean; message: Message }> {
    return new Promise((resolve, reject) => {
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
            resolve(response);
          }
        }
      );
    });
  }

  // Edit message
  editMessage(messageId: string, content: string): Promise<{ success: boolean; message: Message }> {
    return new Promise((resolve) => {
      this.socketCore.emit(
        SOCKET_EVENTS.EDIT_MESSAGE,
        { messageId, content },
        (response: any) => {
          if (response.success) {
            // Message edited successfully
          } else {
            console.error('Failed to edit message:', response);
          }
          resolve(response);
        }
      );
    });
  }

  // Delete message
  deleteMessage(messageId: string, deleteType: DeleteType): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve) => {
      this.socketCore.emit(
        SOCKET_EVENTS.DELETE_MESSAGE,
        { messageId, deleteType },
        (response: any) => {
          if (response.success) {
            // Message deleted successfully
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

  onMessageDeletedGlobal(): Observable<{
    messageId: string;
    conversationId: string;
    affectedReplies?: string[];
  }> {
    return this.messageDeletedGlobalSubject.asObservable();
  }

  onMessageDeletedPersonal(): Observable<{ messageId: string; userId: string; conversationId: string }> {
    return this.messageDeletedPersonalSubject.asObservable();
  }
}
