import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Conversation } from '../../../shared/enums/models/conversation.model';
import * as ConversationActions from '../../store/conversation/conversation.actions';
import * as ConversationSelectors from '../../store/conversation/conversation.selectors';

@Injectable({
  providedIn: 'root'
})
export class ConversationService {
  // Expose observable state for component to subscribe
  conversations$ = this.store.pipe(select(ConversationSelectors.selectAllConversations));
  selectedConversation$ = this.store.pipe(select(ConversationSelectors.selectSelectedConversation));
  loading$ = this.store.pipe(select(ConversationSelectors.selectConversationLoading));
  error$ = this.store.pipe(select(ConversationSelectors.selectConversationError));

  constructor(private store: Store) { }

  // Dispatch actions
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

}
