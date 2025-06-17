import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { map, distinctUntilChanged, filter } from 'rxjs/operators';
import { Conversation } from '../../models/conversation.model';
import { Message } from '../../models/message.model';
import * as ConversationSelectors from '../../store/conversation/conversation.selectors';
import * as MessageActions from '../../store/message/message.actions';
import * as MessageSelectors from '../../store/message/message.selectors';
import { SocketService } from '../../services/socket/socket.service';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-main-content',
  templateUrl: './main-content.component.html',
  styleUrls: ['./main-content.component.css']
})
export class MainContentComponent implements OnInit, AfterViewInit, OnDestroy {
  showRightbar = true;
  selectedConversation$: Observable<Conversation | null>;
  messages$: Observable<Message[]>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  typingUsers$: Observable<{ userId: string; timestamp: number; }[]>;
  onlineUsers$: Observable<string[]>;
  otherUserId$: Observable<string | null>;
  selectedConversationId: string = '';
  private messagesSub!: Subscription;

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef<HTMLDivElement>;

  constructor(
    private store: Store,
    private socketService: SocketService,
    private authService: AuthService
  ) {
    this.selectedConversation$ = this.store.select(ConversationSelectors.selectSelectedConversation);
    this.messages$ = this.store.select(MessageSelectors.selectAllMessages);
    this.loading$ = this.store.select(MessageSelectors.selectMessagesLoading);
    this.error$ = this.store.select(MessageSelectors.selectMessagesError);
    this.typingUsers$ = this.store.select(MessageSelectors.selectTypingUsers);
    this.onlineUsers$ = this.socketService.onOnlineUserIds().pipe(map(set => Array.from(set)));

    this.otherUserId$ = this.selectedConversation$.pipe(
      map(conversation => {
        if (!conversation || conversation.isGroup) return null;
        const myId = this.authService.getCurrentUserId();
        return conversation.participants.find(id => id !== myId) || null;
      })
    );
  }

  ngOnInit(): void {
    this.selectedConversation$
      .pipe(
        map(conversation => conversation?._id),
        distinctUntilChanged(),
        filter(id => !!id)
      )
      .subscribe(conversationId => {
        if (conversationId && conversationId !== this.selectedConversationId) {
          this.selectedConversationId = conversationId;
          this.socketService.joinConversation(conversationId);
          this.store.dispatch(MessageActions.loadMessages({ conversationId }));
        }
      });
  }

  ngAfterViewInit() {
    this.messagesSub = this.messages$.subscribe(() => {
      setTimeout(() => this.scrollToBottom(), 0);
    });
  }

  toggleRightbar() {
    this.showRightbar = !this.showRightbar;
  }

  sendMessage(content: string) {
    if (!this.selectedConversationId) return;
    this.store.dispatch(MessageActions.sendMessage({
      conversationId: this.selectedConversationId,
      content
    }));
  }

  isMediaAttachment(url: string): boolean {
    return /\.(jpg|jpeg|png|gif|webp|mp4|webm|ogg|mov)$/i.test(url);
  }

  private scrollToBottom() {
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    } catch (e) { }
  }

  ngOnDestroy() {
    this.messagesSub?.unsubscribe();
  }
}
