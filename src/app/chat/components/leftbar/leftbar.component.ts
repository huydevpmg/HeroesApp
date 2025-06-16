import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Conversation } from '../../models/conversation.model';
import * as ConversationActions from '../../store/conversation/conversation.actions';
import * as ConversationSelectors from '../../store/conversation/conversation.selectors';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-leftbar',
  templateUrl: './leftbar.component.html',
  styleUrls: ['./leftbar.component.css']
})
export class LeftbarComponent implements OnInit {
  conversations$: Observable<Conversation[]>;
  groupConversations$: Observable<Conversation[]>;
  oneOnOneConversations$: Observable<Conversation[]>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  selectedConversationId$: Observable<string | null>;

  constructor(
    private store: Store,
  ) {
    this.conversations$ = this.store.select(ConversationSelectors.selectAllConversations);
    this.groupConversations$ = this.store.select(ConversationSelectors.selectGroupConversations);
    this.oneOnOneConversations$ = this.store.select(ConversationSelectors.selectOneOnOneConversations);
    this.loading$ = this.store.select(ConversationSelectors.selectConversationLoading);
    this.error$ = this.store.select(ConversationSelectors.selectConversationError);
    this.selectedConversationId$ = this.store.select(ConversationSelectors.selectSelectedConversationId);
  }

  ngOnInit(): void {
    this.store.dispatch(ConversationActions.loadConversations());
  }

  selectConversation(conversation: Conversation): void {
    if (conversation && conversation._id) {
      this.store.dispatch(ConversationActions.selectConversation({ id: conversation._id }));
    }
  }

  createOneOnOneChat(participantId: string): void {
    this.store.dispatch(ConversationActions.findOrCreate1on1Conversation({ participantId }));
  }

  createGroupChat(data: Partial<Conversation>): void {
    this.store.dispatch(ConversationActions.createConversation({ data }));
  }
}
