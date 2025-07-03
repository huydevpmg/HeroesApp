import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Conversation } from '../../../shared/enums/models/conversation.model';
import * as ConversationActions from '../../store/conversation/conversation.actions';
import * as ConversationSelectors from '../../store/conversation/conversation.selectors';
import { AuthService } from '../../../auth/services/auth.service';
import { map, take } from 'rxjs/operators';
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
        return conversations.map((conversation) => ({
          conversation,
          otherUserId: !conversation.isGroup
            ? conversation.participants.find((id: string) => id !== myId) ||
            null
            : null,
        }));
      })
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
    this.socketService.onGroupCreated().subscribe(() => {
      this.conversationService.loadConversations();
    });
  }

  selectConversation(conversation: Conversation): void {
    if (conversation && conversation._id) {
      this.conversationService.selectConversation(conversation._id);
    }
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
}
