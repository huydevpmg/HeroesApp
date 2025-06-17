import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription, of } from 'rxjs';
import { Conversation } from '../../models/conversation.model';
import * as ConversationActions from '../../store/conversation/conversation.actions';
import * as ConversationSelectors from '../../store/conversation/conversation.selectors';
import * as MessageSelectors from '../../store/message/message.selectors';
import { AuthService } from '../../../auth/services/auth.service';
import { map } from 'rxjs/operators';
import { SocketService } from '../../services/socket/socket.service';

@Component({
  selector: 'app-leftbar',
  templateUrl: './leftbar.component.html',
  styleUrls: ['./leftbar.component.css']
})
export class LeftbarComponent implements OnInit, OnDestroy {
  conversations$: Observable<Conversation[]>;
  conversationsWithOtherUserId$: Observable<{ conversation: Conversation, otherUserId: string | null }[]>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  onlineUsers$: Observable<string[]>;
  private subscriptions: Subscription[] = [];

  constructor(
    private store: Store,
    private authService: AuthService,
    private socketService: SocketService
  ) {
    this.conversations$ = this.store.select(ConversationSelectors.selectAllConversations);
    this.loading$ = this.store.select(ConversationSelectors.selectConversationLoading);
    this.error$ = this.store.select(ConversationSelectors.selectConversationError);

    this.onlineUsers$ = this.socketService.onOnlineUserIds().pipe(
      map(set => Array.from(set))
    );

    this.conversationsWithOtherUserId$ = this.conversations$.pipe(
      map(conversations => {
        const myId = this.authService.getCurrentUserId();
        return conversations.map(conversation => ({
          conversation,
          otherUserId: !conversation.isGroup
            ? conversation.participants.find(id => id !== myId) || null
            : null
        }));
      })
    );
  }

  ngOnInit(): void {
    this.store.dispatch(ConversationActions.loadConversations());
    this.subscriptions.push(
      this.onlineUsers$.subscribe(onlineUsers => {
        console.log('Current online users:', onlineUsers);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  selectConversation(conversation: Conversation): void {
    if (conversation && conversation._id) {
      this.store.dispatch(ConversationActions.selectConversation({ id: conversation._id }));
    }
  }
}
