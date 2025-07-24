import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import * as MessageActions from '../../store/message/message.actions';
import * as MessageSelectors from '../../store/message/message.selectors';
import { DeleteType } from '../../../shared/enums/models/delete-type.enum';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  messages$ = this.store.pipe(select(MessageSelectors.selectAllMessages));
  loading$ = this.store.pipe(select(MessageSelectors.selectMessagesLoading));
  error$ = this.store.pipe(select(MessageSelectors.selectMessagesError));

  constructor(private store: Store) { }

  sendMessage(conversationId: string, content: string, attachmentId?: string, fileName?: string) {
    this.store.dispatch(MessageActions.sendMessage({ conversationId, content, attachmentId, fileName }));
  }

  loadMessages(conversationId: string) {
    this.store.dispatch(MessageActions.loadMessages({ conversationId }));
  }

  editMessage(messageId: string, content: string) {
    this.store.dispatch(MessageActions.editMessage({messageId, content}));
  }

  deleteMessage(messageId: string, deleteType: DeleteType) {
    this.store.dispatch(MessageActions.deleteMessage({ messageId, deleteType }));
  }

  addReaction(messageId: string, emoji: string, conversationId: string) {
    this.store.dispatch(MessageActions.addReaction({ messageId, emoji, conversationId }));
  }

  removeReaction(messageId: string, emoji: string, conversationId: string) {
    this.store.dispatch(MessageActions.removeReaction({ messageId, emoji, conversationId }));
  }
}
