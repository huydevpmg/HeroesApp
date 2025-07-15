import { Injectable } from '@angular/core';
import { UserConversationApiService } from './userconversation-api.service';
import { Store } from '@ngrx/store';
import * as ConversationActions from '../../store/conversation/conversation.actions';

@Injectable({
  providedIn: 'root'
})
export class UserConversationService {
  constructor(private api: UserConversationApiService, private store: Store) {}

  addLabel(userConversationId: string, label: string, conversationId?: string) {
    return this.api.addLabel(userConversationId, label);
  }

  removeLabel(userConversationId: string, label: string, conversationId?: string) {
    return this.api.removeLabel(userConversationId, label);
  }

  markAsRead(userConversationId: string, messageId: string, conversationId?: string) {
    return this.api.markAsRead(userConversationId, messageId).subscribe(() => {
      if (conversationId) {
        this.store.dispatch(ConversationActions.loadConversation({ id: conversationId }));
      }
    });
  }

  togglePin(userConversationId: string, conversationId?: string) {
    return this.api.togglePin(userConversationId).subscribe(() => {
      if (conversationId) {
        this.store.dispatch(ConversationActions.loadConversation({ id: conversationId }));
      }
    });
  }

  toggleArchive(userConversationId: string, conversationId?: string) {
    return this.api.toggleArchive(userConversationId).subscribe(() => {
      if (conversationId) {
        this.store.dispatch(ConversationActions.loadConversation({ id: conversationId }));
      }
    });
  }

  updateUserConversation(userConversationId: string, updateData: Partial<any>) {
    return this.api.updateUserConversation(userConversationId, updateData);
  }
}
