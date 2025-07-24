import { Injectable, inject } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Conversation } from '../../../shared/enums/models/conversation.model';
import { UserConversation } from '../../../shared/enums/models/user-conversation.model';
import * as ConversationActions from '../../store/conversation/conversation.actions';
import * as MessageActions from '../../store/message/message.actions';
import * as ConversationSelectors from '../../store/conversation/conversation.selectors';
import { SocketService } from '../socket/socket.service';
import { UserConversationApiService } from '../userConversation/userconversation-api.service';

@Injectable({
  providedIn: 'root'
})
export class ConversationService {
  conversations$ = this.store.pipe(select(ConversationSelectors.selectAllConversations));
  selectedConversation$ = this.store.pipe(select(ConversationSelectors.selectSelectedConversation));
  loading$ = this.store.pipe(select(ConversationSelectors.selectConversationLoading));
  error$ = this.store.pipe(select(ConversationSelectors.selectConversationError));
  allUsers$ = this.store.pipe(select(ConversationSelectors.getAllUsers));

  private socketService = inject(SocketService);
  private userConversationApi = inject(UserConversationApiService);

  constructor(private store: Store) {
    this.initializeSocketListeners();
  }

  // Load conversations
  loadConversations(page: number = 1, limit: number = 20) {
    this.store.dispatch(ConversationActions.loadConversations({ page, limit }));
  }

  selectConversation(id: string) {
    this.store.dispatch(ConversationActions.selectConversation({ id }));
  }

  createConversation(data: Partial<Conversation>) {
    console.log('Creating conversation with data:', data);
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

  getConversationById(id: string) {
    this.store.dispatch(ConversationActions.loadConversation({ id }));
  }

  getConversations(page: number = 1, limit: number = 20) {
    this.store.dispatch(ConversationActions.loadConversations({ page, limit }));
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
  }

  toggleArchive(userConversationId: string) {
    this.store.dispatch(ConversationActions.toggleArchive({ userConversationId }));
  }

  addLabel(userConversationId: string, label: string) {
    return this.userConversationApi.addLabel(userConversationId, label);
  }

  removeLabel(userConversationId: string, label: string) {
    return this.userConversationApi.removeLabel(userConversationId, label);
  }

  markAsRead(userConversationId: string, messageId: string) {
    return this.userConversationApi.markAsRead(userConversationId, messageId);
  }

  togglePin(userConversationId: string) {
    return this.userConversationApi.togglePin(userConversationId);
  }

  updateUserConversation(userConversationId: string, updateData: Partial<UserConversation>) {
    return this.userConversationApi.updateUserConversation(userConversationId, updateData);
  }

  private initializeSocketListeners() {
    // Listen for new groups created by others
    this.socketService.onGroupCreated().subscribe((conversation: Conversation) => {
      this.store.dispatch(ConversationActions.createConversationSuccess({ conversation }));
      this.store.dispatch(ConversationActions.loadConversations({ page: 1, limit: 20 }));
    });

    this.socketService.onMemberAdded().subscribe(({ conversationId }) => {
      this.store.dispatch(ConversationActions.loadConversations({ page: 1, limit: 20 }));
      this.store.dispatch(MessageActions.loadMessages({ conversationId }));
    });

    // Listen for member removed events
    this.socketService.onMemberRemoved().subscribe(({ conversationId }) => {
      this.store.dispatch(ConversationActions.loadConversations({ page: 1, limit: 20 }));
      this.store.dispatch(MessageActions.loadMessages({ conversationId }));
    });

    // Listen for leave group events
    this.socketService.onLeaveGroup().subscribe(({ conversationId }: { conversationId: string }) => {
      this.store.dispatch(ConversationActions.leaveGroupSuccess({ conversationId }));
    });

    // Listen for conversation updates
    this.socketService.onConversationUpdated().subscribe(() => {
      this.store.dispatch(ConversationActions.loadConversations({ page: 1, limit: 20 }));
    });
  }
}
