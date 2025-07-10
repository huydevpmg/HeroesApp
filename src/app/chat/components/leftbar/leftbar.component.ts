import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { Conversation } from '../../../shared/enums/models/conversation.model';
import * as ConversationActions from '../../store/conversation/conversation.actions';
import * as ConversationSelectors from '../../store/conversation/conversation.selectors';
import { AuthService } from '../../../auth/services/auth.service';
import { SocketService } from '../../services/socket/socket.service';
import { ConversationService } from '../../services/conversation/conversation.service';
import { selectConversationPage, selectConversationTotalPages, selectConversationTotalCount } from '../../store/conversation/conversation.selectors';

@Component({
  selector: 'app-leftbar',
  templateUrl: './leftbar.component.html',
  styleUrls: ['./leftbar.component.css'],
})
export class LeftbarComponent implements OnInit, AfterViewInit {
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
  currentUserId: string | null = null;

  page$ = this.store.pipe(select(selectConversationPage));
  totalPages$ = this.store.pipe(select(selectConversationTotalPages));
  total$ = this.store.pipe(select(selectConversationTotalCount));
  page = 1;
  limit = 9 ;

  @ViewChild('conversationListContainer') conversationListContainer!: ElementRef<HTMLDivElement>;

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

  loading = false;

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId();
    this.loadPage(1);
    this.conversationService.getAllUsers();
    this.loading$.subscribe(loading => this.loading = loading);
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

  ngAfterViewInit(): void {
    if (this.conversationListContainer) {
      this.conversationListContainer.nativeElement.addEventListener('scroll', this.onScroll.bind(this));
    }
  }

  onScroll(): void {
    const container = this.conversationListContainer.nativeElement;
    const threshold = 200; // px from bottom
    const atBottom = container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
    if (this.loading) { return; }
    this.totalPages$.pipe(take(1)).subscribe(totalPages => {
      this.page$.pipe(take(1)).subscribe(page => {
        // Load liên tục cho đến khi không còn page hoặc không còn atBottom
        let nextPage = page;
        while (atBottom && nextPage < totalPages && !this.loading) {
          nextPage++;
          this.loadPage(nextPage);
        }
      });
    });
  }

  loadPage(page: number) {
    this.page = page;
    this.conversationService.loadConversations(page, this.limit);
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
