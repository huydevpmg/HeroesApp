import { Injectable, inject } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Conversation } from '../../../shared/enums/models/conversation.model';
import { SocketCoreService } from './socket-core.service';
import { SOCKET_EVENTS } from './socket-events.constants';
import { Store } from '@ngrx/store';
import * as ConversationActions from '../../store/conversation/conversation.actions';
import { selectAllConversations } from '../../store/conversation/conversation.selectors';
import { filter, delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ConversationSocketService {
  private socketCore = inject(SocketCoreService);
  private store = inject(Store);

  // Track current joined conversation to avoid duplicate joins
  private currentJoinedConversation: string | null = null;

  private groupCreatedSubject = new Subject<Conversation>();
  private conversationUpdatedSubject = new Subject<{ conversationId: string; type: 'pin' | 'archive' | 'label'; data: any }>();
  private userJoinedSubject = new Subject<{ userId: string; conversationId: string }>();
  private memberAddedSubject = new Subject<{ conversationId: string; addedMembers: string[]; conversation: Conversation; systemMessage: any }>();
  private memberRemovedSubject = new Subject<{ conversationId: string; removedUserId: string; conversation: Conversation; systemMessage: any }>();
  private leaveGroupSubject = new Subject<{ conversationId: string; userId: string }>();
  private autoJoinInitialized = false;

  constructor() {
    this.setupConversationListeners();
  }

  initializeAutoJoin() {
    if (this.autoJoinInitialized) {
      return;
    }
    this.autoJoinInitialized = true;

    this.store.select(selectAllConversations)
      .pipe(
        delay(100),
        filter(conversations => Array.isArray(conversations) && conversations.length > 0)
      )
      .subscribe(conversations => {
        conversations.forEach(conv => {
          if (conv && conv._id) {
            this.joinConversation(conv._id);
          }
        });
      });
  }

  private setupConversationListeners(): void {
    // New group created
    this.socketCore.on(SOCKET_EVENTS.NEW_GROUP, (group: Conversation) => {
      this.groupCreatedSubject.next(group);
    });

    // User joined conversation
    this.socketCore.on(SOCKET_EVENTS.JOIN_ROOM, (data: { userId: string; conversationId: string }) => {
      this.userJoinedSubject.next(data);
    });

    this.socketCore.on(SOCKET_EVENTS.LEAVE_GROUP, (data: { conversationId: string; userId: string }) => {
      this.leaveGroupSubject.next(data);
    });

    this.socketCore.on(SOCKET_EVENTS.LEAVE_GROUP_NOTIFY, (data: { conversationId: string; userId: string }) => {
      this.store.dispatch(ConversationActions.removeUserFromConversation({
        conversationId: data.conversationId,
        userId: data.userId
      }));
      this.store.dispatch(ConversationActions.loadConversations());
    });

    // Conversation pinned
    this.socketCore.on(SOCKET_EVENTS.PIN_CONVERSATION, (data: { conversationId: string; result: any }) => {
      this.conversationUpdatedSubject.next({ conversationId: data.conversationId, type: 'pin', data: data.result });
    });

    // Conversation archived
    this.socketCore.on(SOCKET_EVENTS.ARCHIVE_CONVERSATION, (data: { conversationId: string; result: any }) => {
      this.conversationUpdatedSubject.next({ conversationId: data.conversationId, type: 'archive', data: data.result });
    });

    // Label added
    this.socketCore.on(SOCKET_EVENTS.ADD_LABEL, (data: { conversationId: string; result: any }) => {
      this.conversationUpdatedSubject.next({ conversationId: data.conversationId, type: 'label', data: data.result });
    });

    // Label removed
    this.socketCore.on(SOCKET_EVENTS.REMOVE_LABEL, (data: { conversationId: string; result: any }) => {
      this.conversationUpdatedSubject.next({ conversationId: data.conversationId, type: 'label', data: data.result });
    });

    // Member added to group
    this.socketCore.on(SOCKET_EVENTS.MEMBER_ADDED, (data: { conversationId: string; addedMembers: string[]; conversation: Conversation; systemMessage: any }) => {
      this.memberAddedSubject.next(data);
      this.store.dispatch(ConversationActions.addMembersToGroupSuccess({ conversation: data.conversation }));
      this.store.dispatch(ConversationActions.loadConversations());
    });

    // Member removed from group
    this.socketCore.on(SOCKET_EVENTS.MEMBER_REMOVED, (data: { conversationId: string; removedUserId: string; conversation: Conversation; systemMessage: any }) => {
      this.memberRemovedSubject.next(data);
      this.store.dispatch(ConversationActions.removeMemberFromGroupSuccess({ conversation: data.conversation }));
    });
  }

  // Join conversation room
  joinConversation(conversationId: string): void {

    // Avoid joining the same conversation multiple times
    if (this.currentJoinedConversation === conversationId) {
      return;
    }

    this.currentJoinedConversation = conversationId;
    console.log(`Frontend: Joining room ${conversationId}`);
    this.socketCore.emit(SOCKET_EVENTS.JOIN_ROOM, conversationId);
  }

  // Connect or create 1-on-1 conversation
  connectConversation(partnerId: string): Promise<{ success: boolean; conversationId: string }> {
    return new Promise((resolve) => {
      this.socketCore.emit(
        SOCKET_EVENTS.CONNECT_CONVERSATION,
        { partnerId },
        (response: any) => {
          if (response.success) {
            console.log('Connected to conversation:', response);
          } else {
            console.error('Failed to connect to conversation:', response);
          }
          resolve(response);
        }
      );
    });
  }

  // Emit group creation
  emitGroupCreated(conversation: Conversation): void {
    this.socketCore.emit(SOCKET_EVENTS.GROUP_CREATED, {
      _id: conversation._id,
      name: conversation.name,
      participants: conversation.participants,
      isGroup: conversation.isGroup,
      createdBy: conversation.createdBy,
      createdAt: conversation.createdAt
    });
  }

  // Pin conversation
  pinConversation(conversationId: string): Promise<{ success: boolean; result: any }> {
    return new Promise((resolve) => {
      this.socketCore.emit(
        SOCKET_EVENTS.PIN_CONVERSATION,
        { conversationId },
        (response: any) => {
          if (response.success) {
            console.log('Conversation pinned successfully:', response);
          } else {
            console.error('Failed to pin conversation:', response);
          }
          resolve(response);
        }
      );
    });
  }

  // Archive conversation
  archiveConversation(conversationId: string): Promise<{ success: boolean; result: any }> {
    return new Promise((resolve) => {
      console.log('Archiving conversation:', conversationId);

      this.socketCore.emit(
        SOCKET_EVENTS.ARCHIVE_CONVERSATION,
        { conversationId },
        (response: any) => {
          if (response.success) {
            console.log('Conversation archived successfully:', response);
          } else {
            console.error('Failed to archive conversation:', response);
          }
          resolve(response);
        }
      );
    });
  }

  // Add label
  addLabel(conversationId: string, label: string): Promise<{ success: boolean; result: any }> {
    return new Promise((resolve) => {
      console.log('Adding label to conversation:', { conversationId, label });

      this.socketCore.emit(
        SOCKET_EVENTS.ADD_LABEL,
        { conversationId, label },
        (response: any) => {
          if (response.success) {
            console.log('Label added successfully:', response);
          } else {
            console.error('Failed to add label:', response);
          }
          resolve(response);
        }
      );
    });
  }

  // Remove label
  removeLabel(conversationId: string, label: string): Promise<{ success: boolean; result: any }> {
    return new Promise((resolve) => {
      console.log('Removing label from conversation:', { conversationId, label });

      this.socketCore.emit(
        SOCKET_EVENTS.REMOVE_LABEL,
        { conversationId, label },
        (response: any) => {
          if (response.success) {
            console.log('Label removed successfully:', response);
          } else {
            console.error('Failed to remove label:', response);
          }
          resolve(response);
        }
      );
    });
  }

  // Emit conversation updated
  emitConversationUpdated(conversationId: string): void {
    this.socketCore.emit(SOCKET_EVENTS.CONVERSATION_UPDATED, { conversationId });
  }

  // Observables
  onGroupCreated(): Observable<Conversation> {
    return this.groupCreatedSubject.asObservable();
  }

  onConversationUpdated(): Observable<{ conversationId: string; type: 'pin' | 'archive' | 'label'; data: any }> {
    return this.conversationUpdatedSubject.asObservable();
  }

  onUserJoined(): Observable<{ userId: string; conversationId: string }> {
    return this.userJoinedSubject.asObservable();
  }

  onMemberAdded(): Observable<{ conversationId: string; addedMembers: string[]; conversation: Conversation; systemMessage: any }> {
    return this.memberAddedSubject.asObservable();
  }

  onMemberRemoved(): Observable<{ conversationId: string; removedUserId: string; conversation: Conversation; systemMessage: any }> {
    return this.memberRemovedSubject.asObservable();
    
  onLeaveGroup(): Observable<{ conversationId: string; userId: string }> {
    return this.leaveGroupSubject.asObservable();
  }
}
