import { MessageReadReceiptService } from './../../services/message-read-receipt/message-read-receipt.service';
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { Conversation } from '../../../shared/enums/models/conversation.model';
import { Label } from '../../../shared/enums/models/label.model';
import * as ConversationActions from '../../store/conversation/conversation.actions';
import * as ConversationSelectors from '../../store/conversation/conversation.selectors';
import { AuthService } from '../../../auth/services/auth.service';
import { SocketService } from '../../services/socket/socket.service';
import { ConversationService } from '../../services/conversation/conversation.service';
import { LabelService } from '../../services/labels/label.service';
import { UserConversationService } from '../../services/userConversation/user-conversation.service';
import {
  selectConversationPage,
  selectConversationTotalPages,
  selectConversationTotalCount,
} from '../../store/conversation/conversation.selectors';
import { MessageService } from '../../services/message/message.service';

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
  limit = 9;
  labels: Label[] = [];
  showManageLabelModal = false;
  colors: string[] = [
    '#FFD600',
    '#FF6F61',
    '#4CAF50',
    '#2196F3',
    '#9C27B0',
    '#FF9800',
    '#E91E63',
    '#00B8D9',
    '#FFAB00',
  ];

  hoveredConversationId: string | null = null;
  dropdownOpenConversationId: string | null = null;

  @ViewChild('conversationListContainer')
  conversationListContainer!: ElementRef<HTMLDivElement>;

  constructor(
    private store: Store,
    private authService: AuthService,
    private socketService: SocketService,
    private conversationService: ConversationService,
    private labelService: LabelService,
    private userConversationService: UserConversationService,
    private messageReadReceiptService: MessageReadReceiptService,
        private messageService: MessageService,

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
              ? conversation.participants.find((id: string) => id !== myId) ||
                null
              : null,
          }));
      })
    );
    this.filteredConversationsWithOtherUserId$ = combineLatest([
      this.conversationsWithOtherUserId$,
      this.activeTab$,
    ]).pipe(
      map(([convs, activeTab]) =>
        convs.filter((item) =>
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
    this.loading$.subscribe((loading) => (this.loading = loading));
    this.users$.subscribe((users) => {
      const currentUserId = this.authService.getCurrentUserId();
      this.users = users
        .filter((user) => user._id !== currentUserId)
        .map((user) => ({
          ...user,
          selected: false,
        }));
    });
    this.labelService.getLabels().subscribe((labels) => {
      this.labels = labels;
    });
  }

  ngAfterViewInit(): void {
    if (this.conversationListContainer) {
      this.conversationListContainer.nativeElement.addEventListener(
        'scroll',
        this.onScroll.bind(this)
      );
    }
  }

  onHover(conversationId: string, isHovering: boolean): void {
    if (!this.isDropdownVisible(conversationId)) {
      this.hoveredConversationId = isHovering ? conversationId : null;
    }
  }

  onDropdownToggled(conversationId: string, isOpen: boolean): void {
    if (isOpen) {
      this.dropdownOpenConversationId = conversationId;
    } else {
      this.dropdownOpenConversationId = null;
      this.hoveredConversationId = null;
    }
  }

  onScroll(): void {
    const container = this.conversationListContainer.nativeElement;
    const threshold = 200;
    const atBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      threshold;
    if (this.loading) {
      return;
    }
    this.totalPages$.pipe(take(1)).subscribe((totalPages) => {
      this.page$.pipe(take(1)).subscribe((page) => {
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
    this.onlineUsers$.pipe(take(1)).subscribe((onlineUsers) => {
      isOnline = onlineUsers.includes(userId);
    });
    return isOnline;
  }

  fetchLabels() {
    this.labelService.getLabels().subscribe((labels) => {
      this.labels = labels;
      this.store.dispatch(
        ConversationActions.loadConversations({
          page: this.page,
          limit: this.limit,
        })
      );
    });
  }

  onHoverConversation(conversationId: string) {
    this.hoveredConversationId = conversationId;
  }

  onLeaveConversation(conversationId: string) {
    if (this.dropdownOpenConversationId !== conversationId) {
      this.hoveredConversationId = null;
    }
  }

  onDropdownOpen(conversationId: string) {
    this.dropdownOpenConversationId = conversationId;
  }

  onDropdownClose() {
    this.dropdownOpenConversationId = null;
    this.hoveredConversationId = null;
  }

  isDropdownVisible(conversationId: string): boolean {
    return (
      this.hoveredConversationId === conversationId ||
      this.dropdownOpenConversationId === conversationId
    );
  }

  onSelectLabel(event: {
    userConversationId: string;
    label: string;
    conversationId: string;
  }) {
    this.userConversationService
      .addLabel(event.userConversationId, event.label, event.conversationId)
      .subscribe({
        next: () => {
          this.store.dispatch(
            ConversationActions.loadConversations({
              page: this.page,
              limit: this.limit,
            })
          );
        },
      });
  }

  onManageLabels() {
    this.showManageLabelModal = true;
  }

  onMarkRead(conversation: any) {
    if (!conversation || !conversation._id) { return; }
    this.messageService.loadMessages(conversation._id);
    this.messageService.messages$.pipe(take(1)).subscribe((messages: any[]) => {
      const unreadIds = (messages || [])
        .filter((msg: any) =>
          msg.conversationId === conversation._id &&
          msg.senderId !== this.currentUserId &&
          !msg.readReceipts?.some((r: any) => r.userId === this.currentUserId)
        )
        .map((msg: any) => msg._id);
      if (unreadIds.length > 0) {
        this.messageReadReceiptService
          .markMultipleMessagesAsRead(conversation._id, unreadIds)
          .subscribe(() => {
            this.store.dispatch(ConversationActions.loadConversations({ page: this.page, limit: this.limit }));
          });
      }
    });
  }

  onArchive(conversation: any) {
    this.store.dispatch(
      ConversationActions.toggleArchive({
        userConversationId: conversation.userConversationId,
      })
    );
    if (this.selectedConversationId === conversation._id) {
      this.conversationService.selectConversation('');
      this.selectedConversationId = null;
    }
  }

  onClearConversation(conversation: any) {
    this.store.dispatch(
      ConversationActions.clearConversation({
        conversationId: conversation._id,
      })
    );
  }

  onDropdownOpenStateChange(isOpen: boolean, conversationId: string) {
    this.onDropdownToggled(conversationId, isOpen);
  }
}
