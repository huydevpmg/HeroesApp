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
import { MessageReadReceiptService } from '../message-read-receipt/message-read-receipt.service';
@Injectable({
  providedIn: 'root'
})
export class MessageSocketService {
  private socketCore = inject(SocketCoreService);
  private store = inject(Store);
  private messageReadReceiptService = inject(MessageReadReceiptService);

  // Message subjects
  private messageSubject = new Subject<Message>();
  private messageUpdatedSubject = new Subject<Message>();
  private messageDeletedGlobalSubject = new Subject<{ messageId: string; conversationId: string }>();
  private messageDeletedPersonalSubject = new Subject<{ messageId: string; userId: string; conversationId: string }>();

  // Typing subjects
  private typingSubject = new Subject<{ userId: string; isTyping: boolean }>();

  constructor() {
    this.setupMessageListeners();
    this.setupReactionListeners();
  }

  private setupMessageListeners(): void {
    // Message received
    this.socketCore.on(SOCKET_EVENTS.RECEIVE_MESSAGE, (message: Message) => {
      console.log('Message received:', message);
      this.store.select(selectSelectedConversationId).pipe(take(1)).subscribe(selectedId => {
        this.store.dispatch(ConversationActions.updateConversationLastMessage({ conversationId: message.conversationId, message }));

        if (selectedId === message.conversationId) {
          this.store.dispatch(MessageActions.receiveMessage({ message }));
          this.messageReadReceiptService.markAllMessagesAsRead(message.conversationId).subscribe();
          this.store.dispatch(ConversationActions.resetUnreadCount({ conversationId: message.conversationId }));
        } else {
          this.store.dispatch(ConversationActions.incrementUnreadCount({ conversationId: message.conversationId }));
        }
      });
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

  private setupReactionListeners(): void {
    this.socketCore.on(SOCKET_EVENTS.MESSAGE_REACTION, (data: { message: Message }) => {
      console.log('Reaction received:', data.message);
      this.store.dispatch(MessageActions.addReactionSuccess({ message: data.message }));
    });

    this.socketCore.on(SOCKET_EVENTS.REMOVE_REACTION, (data: { message: Message }) => {
      console.log('Reaction received:', data.message);
      this.store.dispatch(MessageActions.removeReactionSuccess({ message: data.message }));
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
