import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription, of } from 'rxjs';
import { Conversation } from '../../models/conversation.model';
import * as ConversationActions from '../../store/conversation/conversation.actions';
import * as ConversationSelectors from '../../store/conversation/conversation.selectors';
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
  users$: Observable<any[]>;
  users: any[] = [];
  loading$: Observable<boolean>;
  error$: Observable<string | null>;

  onlineUsers$: Observable<string[]>;

  showCreateGroupModal = false;
  groupName = '';
  searchUser = '';


  private conversationsSub?: Subscription;

  constructor(
    private store: Store,
    private authService: AuthService,
    private socketService: SocketService
  ) {
    this.conversations$ = this.store.select(ConversationSelectors.selectAllConversations);
    this.loading$ = this.store.select(ConversationSelectors.selectConversationLoading);
    this.error$ = this.store.select(ConversationSelectors.selectConversationError);
    this.users$ = this.store.select(ConversationSelectors.getAllUsers);
    this.onlineUsers$ = this.socketService.onOnlineUserIds().pipe(
      map(set => Array.from(set))
    );

    this.conversationsWithOtherUserId$ = this.conversations$.pipe(
      map(conversations => {
        const myId = this.authService.getCurrentUserId();
        const mapped = conversations.map(conversation => ({
          conversation,
          otherUserId: !conversation.isGroup
            ? conversation.participants.find(id => id !== myId) || null
            : null
        }));
        return mapped;
      })
    );
  }

  ngOnInit(): void {
    this.store.dispatch(ConversationActions.loadConversations());
    this.store.dispatch(ConversationActions.getAllUsers());

    this.users$.subscribe(users => {
      this.users = users.map(user => ({
        ...user,
        selected: false
      }));
    });

    this.socketService.onGroupCreated().subscribe(() => {
      this.store.dispatch(ConversationActions.loadConversations());
    });
  }

  ngOnDestroy(): void {
    this.conversationsSub?.unsubscribe();
  }

  selectConversation(conversation: Conversation): void {
    if (conversation && conversation._id) {
      this.store.dispatch(ConversationActions.selectConversation({ id: conversation._id }));
    }
  }

  openCreateGroupModal() {
    this.showCreateGroupModal = true;
  }
  closeCreateGroupModal() {
    this.showCreateGroupModal = false;
    this.groupName = '';
    this.searchUser = '';
    this.users.forEach(u => u.selected = false);
  }
  filteredUsers() {
    const q = this.searchUser.trim().toLowerCase();
    return !q ? this.users : this.users.filter(u => u.fullName.toLowerCase().includes(q));
  }
  selectedUserIds() {
    return this.users.filter(u => u.selected).map(u => u._id);
  }
  isCreatingGroup = false;

  createGroup() {
    const participantIds = this.selectedUserIds();
    const name = this.groupName.trim();
    if (name && participantIds.length && !this.isCreatingGroup) {
      this.isCreatingGroup = true;

      const currentUserId = this.authService.getCurrentUserId();
      const allParticipants = currentUserId ? [currentUserId, ...participantIds] : participantIds;

      this.store.dispatch(ConversationActions.createConversation({
        data: {
          name,
          participants: allParticipants,
          isGroup: true,
          createdBy: currentUserId || undefined
        }
      }));
      this.closeCreateGroupModal();
      this.isCreatingGroup = false;
    }
  }

  trackByConversationId(index: number, item: any): any {
    return item.conversation._id;
  }

  toggleUserSelection(user: any): void {
    user.selected = !user.selected;
  }

  clearAllSelections(): void {
    this.users.forEach(user => user.selected = false);
  }

  isUserOnline(userId: string): boolean {
    return false;
  }
}
