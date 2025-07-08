import { Injectable, inject } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Conversation } from '../../../shared/enums/models/conversation.model';
import * as ConversationActions from '../../store/conversation/conversation.actions';
import * as MessageActions from '../../store/message/message.actions';
import * as ConversationSelectors from '../../store/conversation/conversation.selectors';
import { SocketService } from '../socket/socket.service';

@Injectable({
  providedIn: 'root'
})
export class ConversationService {
  // Expose observable state for component to subscribe
  conversations$ = this.store.pipe(select(ConversationSelectors.selectAllConversations));
  selectedConversation$ = this.store.pipe(select(ConversationSelectors.selectSelectedConversation));
  loading$ = this.store.pipe(select(ConversationSelectors.selectConversationLoading));
  error$ = this.store.pipe(select(ConversationSelectors.selectConversationError));
  allUsers$ = this.store.pipe(select(ConversationSelectors.getAllUsers));

  private socketService = inject(SocketService);

  constructor(private store: Store) {
    this.initializeSocketListeners();
  }

  // Load conversations
  loadConversations() {
    this.store.dispatch(ConversationActions.loadConversations());
  }

  selectConversation(id: string) {
    this.store.dispatch(ConversationActions.selectConversation({ id }));
  }

  createConversation(data: Partial<Conversation>) {
    this.store.dispatch(ConversationActions.createConversation({ data }));
  }

  updateConversation(id: string, data: Partial<Conversation>) {
    this.store.dispatch(ConversationActions.updateConversation({ id, data }));
  }

  updateLastAttachmentName(conversationId: string, lastAttachmentName: string) {
    this.store.dispatch(ConversationActions.updateLastAttachmentName({ conversationId, lastAttachmentName }));
  }

  getAllUsers() {
    this.store.dispatch(ConversationActions.getAllUsers());
  }

  findOrCreate1on1Conversation(participantId: string) {
    this.store.dispatch(ConversationActions.findOrCreate1on1Conversation({ participantId }));
  }

  getConversationById(id: string) {
    this.store.dispatch(ConversationActions.loadConversation({ id }));
  }

  getConversations() {
    this.store.dispatch(ConversationActions.loadConversations());
  }

  addMembersToGroup(conversationId: string, memberIds: string[]) {
    this.store.dispatch(ConversationActions.addMembersToGroup({ conversationId, memberIds }));
  }

  removeMemberFromGroup(conversationId: string, userId: string) {
    this.store.dispatch(ConversationActions.removeMemberFromGroup({ conversationId, userId }));
  }

  leaveGroup(conversationId: string) {
    this.store.dispatch(ConversationActions.leaveGroup({ conversationId }));
  }

  clearConversation(conversationId: string) {
    this.store.dispatch(ConversationActions.clearConversation({ conversationId }));
    this.store.dispatch(ConversationActions.loadConversations());
  }

  toggleArchive(userConversationId: string) {
    console.log('ConversationService toggleArchive called with:', userConversationId);
    this.store.dispatch(ConversationActions.toggleArchive({ userConversationId }));
  }

  private initializeSocketListeners() {
    // Listen for new groups created by others
    this.socketService.onGroupCreated().subscribe((conversation: Conversation) => {
      this.store.dispatch(ConversationActions.createConversationSuccess({ conversation }));
      this.store.dispatch(ConversationActions.loadConversations());
    });

    this.socketService.onMemberAdded().subscribe(({ conversationId }) => {
      this.store.dispatch(ConversationActions.loadConversations());
      this.store.dispatch(MessageActions.loadMessages({ conversationId }));
    });

    // Listen for member removed events
    this.socketService.onMemberRemoved().subscribe(({ conversationId }) => {
      this.store.dispatch(ConversationActions.loadConversations());
      this.store.dispatch(MessageActions.loadMessages({ conversationId }));
    });

    // Listen for leave group events
    this.socketService.onLeaveGroup().subscribe(({ conversationId }: { conversationId: string }) => {
      this.store.dispatch(ConversationActions.leaveGroupSuccess({ conversationId }));
    });

    // Listen for conversation updates
    this.socketService.onConversationUpdated().subscribe(() => {
      // Reload conversations to get latest data
      this.store.dispatch(ConversationActions.loadConversations());
    });
  }
}
