import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { Conversation } from '../../../shared/enums/models/conversation.model';
import * as ConversationActions from '../../store/conversation/conversation.actions';
import * as ConversationSelectors from '../../store/conversation/conversation.selectors';
import { AuthService } from '../../../auth/services/auth.service';
import { SocketService } from '../../services/socket/socket.service';
import { ConversationService } from '../../services/conversation/conversation.service';

@Component({
  selector: 'app-leftbar',
  templateUrl: './leftbar.component.html',
  styleUrls: ['./leftbar.component.css'],
})
export class LeftbarComponent implements OnInit {
  conversations$: Observable<Conversation[]>;
  conversationsWithOtherUserId$: Observable<
    { conversation: Conversation; otherUserId: string | null }[]
  >;

  private activeTabSubject = new BehaviorSubject<'main' | 'archive'>('main');
  activeTab$ = this.activeTabSubject.asObservable();

  filteredConversationsWithOtherUserId$!: Observable<
    { conversation: Conversation; otherUserId: string | null }[]
  >;

  users$: Observable<any[]> = this.store.pipe(
    select(ConversationSelectors.getAllUsers)
  );
  users: any[] = [];
  loading$: Observable<boolean>;
  error$: Observable<string | null>;

  onlineUsers$: Observable<string[]>;

  showCreateGroupModal = false;
  groupName = '';
  searchUser = '';

  selectedConversationId: string | null = null;

  constructor(
    private store: Store,
    private authService: AuthService,
    private socketService: SocketService,
    private conversationService: ConversationService
  ) {
    this.conversations$ = this.conversationService.conversations$;
    this.loading$ = this.conversationService.loading$;
    this.error$ = this.conversationService.error$;
    this.onlineUsers$ = this.socketService
      .onOnlineUserIds()
      .pipe(map((set) => Array.from(set)));

    this.conversationsWithOtherUserId$ = this.conversations$.pipe(
      map((conversations) => {
        const myId = this.authService.getCurrentUserId();
        return conversations
          .filter((conversation: any) => !conversation.isDeleted)
          .map((conversation) => ({
            conversation,
            otherUserId: !conversation.isGroup
              ? conversation.participants.find((id: string) => id !== myId) || null
              : null,
          }));
      })
    );

    this.filteredConversationsWithOtherUserId$ = combineLatest([
      this.conversationsWithOtherUserId$,
      this.activeTab$
    ]).pipe(
      map(([convs, activeTab]) =>
        convs.filter(item =>
          activeTab === 'main'
            ? !item.conversation.isArchived
            : item.conversation.isArchived
        )
      )
    );
  }

  ngOnInit(): void {
    this.conversationService.loadConversations();
    this.conversationService.getAllUsers();
    this.users$.subscribe((users) => {
      const currentUserId = this.authService.getCurrentUserId();
      this.users = users
        .filter(user => user._id !== currentUserId)
        .map((user) => ({
          ...user,
          selected: false,
        }));
    });
  }

  selectConversation(conversation: Conversation): void {
    if (conversation && conversation._id) {
      this.conversationService.selectConversation(conversation._id);
      this.selectedConversationId = conversation._id;
    }
  }

  setTab(tab: 'main' | 'archive') {
    this.activeTabSubject.next(tab);
  }

  toggleFilter(): void {
    console.log('Filter functionality will be implemented here');
  }

  openCreateGroupModal() {
    this.showCreateGroupModal = true;
  }

  closeCreateGroupModal() {
    this.showCreateGroupModal = false;
    this.groupName = '';
    this.searchUser = '';
    this.users.forEach((u) => (u.selected = false));
  }

  filteredUsers() {
    const q = this.searchUser.trim().toLowerCase();
    return !q
      ? this.users
      : this.users.filter((u) => u.fullName.toLowerCase().includes(q));
  }

  selectedUserIds() {
    return this.users.filter((u) => u.selected).map((u) => u._id);
  }

  isCreatingGroup = false;

  createGroup() {
    const participantIds = this.selectedUserIds();
    const name = this.groupName.trim();
    if (name && participantIds.length && !this.isCreatingGroup) {
      this.isCreatingGroup = true;

      const currentUserId = this.authService.getCurrentUserId();
      const uniqueParticipants = new Set(participantIds);
      if (currentUserId) {
        uniqueParticipants.add(currentUserId);
      }
      const allParticipants = Array.from(uniqueParticipants);

      this.store.dispatch(
        ConversationActions.createConversation({
          data: {
            name,
            participants: allParticipants,
            isGroup: true,
            createdBy: currentUserId || undefined,
          },
        })
      );
      this.closeCreateGroupModal();
      this.isCreatingGroup = false;
    }
  }

  trackByConversationId(index: number, item: any): any {
    return item?.conversation?._id ?? index;
  }

  toggleUserSelection(user: any): void {
    user.selected = !user.selected;
  }

  clearAllSelections(): void {
    this.users.forEach((user) => (user.selected = false));
  }

  isUserOnline(userId: string): boolean {
    let isOnline = false;
    this.onlineUsers$.pipe(take(1)).subscribe(onlineUsers => {
      isOnline = onlineUsers.includes(userId);
    });
    return isOnline;
  }

  markAsRead(conversationId: string, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    console.log('Mark as read:', conversationId);
  }

  toggleArchive(userConversationId: string, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (userConversationId) {
      this.conversationService.toggleArchive(userConversationId);
    } else {
      console.error('userConversationId is required for archive action');
    }
  }

  addLabel(conversationId: string, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    console.log('Add label:', conversationId);
  }

  clearConversation(conversationId: string, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.conversationService.clearConversation(conversationId);
  }
}
