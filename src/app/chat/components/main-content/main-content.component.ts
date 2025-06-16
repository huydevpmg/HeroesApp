import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { Conversation } from '../../models/conversation.model';
import { Message } from '../../models/message.model';
import * as ConversationSelectors from '../../store/conversation/conversation.selectors';
import * as MessageActions from '../../store/message/message.actions';
import * as MessageSelectors from '../../store/message/message.selectors';
import { SocketService } from '../../services/socket/socket.service';

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
  selectedConversationId: string = '';
  private messagesSub!: Subscription;

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef<HTMLDivElement>;

  constructor(private store: Store, private socketService: SocketService) {
    this.selectedConversation$ = this.store.select(ConversationSelectors.selectSelectedConversation);
    this.messages$ = this.store.select(MessageSelectors.selectAllMessages);
    this.loading$ = this.store.select(MessageSelectors.selectMessagesLoading);
    this.error$ = this.store.select(MessageSelectors.selectMessagesError);
    this.typingUsers$ = this.store.select(MessageSelectors.selectTypingUsers);
    this.onlineUsers$ = this.store.select(MessageSelectors.selectOnlineUsers);
  }

  ngOnInit(): void {
    this.selectedConversation$.subscribe(conversation => {
      if (conversation?._id) {
        this.selectedConversationId = conversation._id;
        this.socketService.joinConversation(conversation._id);
        this.store.dispatch(MessageActions.loadMessages({ conversationId: conversation._id }));
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
    this.selectedConversation$.subscribe(conversation => {
      if (conversation?._id) {
        this.store.dispatch(MessageActions.sendMessage({
          conversationId: conversation._id,
          content
        }));
      }
    });
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
