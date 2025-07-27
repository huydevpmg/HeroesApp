import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  ChangeDetectorRef,
  AfterViewChecked,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription, combineLatest } from 'rxjs';
import { map, distinctUntilChanged, filter, switchMap } from 'rxjs/operators';
import { Conversation } from '../../../shared/enums/models/conversation.model';
import { Message } from '../../../shared/enums/models/message.model';
import * as ConversationSelectors from '../../store/conversation/conversation.selectors';
import * as MessageActions from '../../store/message/message.actions';
import * as MessageSelectors from '../../store/message/message.selectors';
import { selectMessagesWithAttachment } from '../../store/message/message.selectors';
import { AuthService } from '../../../auth/services/auth.service';
import { SocketService } from '../../services/socket/socket.service';
import {
  selectAttachmentEntities,
  selectAttachmentsByConversation,
} from '../../store/attachment/attachment.selectors';
import { MessageService } from '../../services/message/message.service';
import { DeleteType } from '../../../shared/enums/models/delete-type.enum';
import { MessageReadReceiptService } from '../../services/message-read-receipt/message-read-receipt.service';
import { ReadReceiptSocketService } from '../../services/socket/read-receipt-socket.service';
import { ReplyingToMessage } from '../../../shared/enums/models/reply-msg.model';
import {
  selectMessagesPage,
  selectMessagesTotalPages,
} from '../../store/message/message.selectors';
import { Attachment } from '../../../shared/enums/models/attachment.model';
import { AttachmentService } from '../../services/attachments/attachment.service';

@Component({
  selector: 'app-main-content',
  templateUrl: './main-content.component.html',
  styleUrls: ['./main-content.component.css'],
})
export class MainContentComponent
  implements OnInit, AfterViewInit, OnDestroy, AfterViewChecked
{
  // --- State ---
  myId = this.authService.getCurrentUserId();
  showRightbar = true;
  page = 1;
  totalPages = 1;
  loading = false;
  limit = 20;
  selectedConversationId: string = '';
  editMode = false;
  editingMessage: Message | null = null;
  replyMode = false;
  replyingToMessage: ReplyingToMessage | null = null;
  selectedFiles: File[] = [];
  previews: string[] = [];
  uploading = false;
  conversationReadReceipts: { [messageId: string]: any[] } = {};
  lastMessageReadReceipts: any[] = [];
  private isLoadingReadReceipts = false;
  private shouldScrollToBottom = false;
  selectedAttachmentIds: string[] = [];
  selectedPreviewAttachments: any[] = [];

  // --- Subscriptions ---
  private messagesSub?: Subscription;
  private socketMessageSub?: Subscription;
  private conversationSub?: Subscription;
  private messagesAndAttachmentsSub?: Subscription;
  private readReceiptsSub?: Subscription;
  private readReceiptSocketSub?: Subscription;

  // --- ViewChild ---
  @ViewChild('messagesContainer')
  messagesContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('messageInput') messageInput!: ElementRef<HTMLInputElement>;

  // --- Observables ---
  selectedConversation$: Observable<Conversation | null>;
  messages$: Observable<Message[]>;
  messagesWithAttachment$: Observable<any>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  typingUsers$: Observable<{ userId: string; timestamp: number }[]>;
  onlineUsers$: Observable<string[]>;
  otherUserId$: Observable<string | null>;
  attachments$: Observable<Attachment[]>;

  openedEmojiId: string | null = null;
  openedMoreId: string | null = null;

  constructor(
    private store: Store,
    private authService: AuthService,
    private socketService: SocketService,
    private messageService: MessageService,
    private messageReadReceiptService: MessageReadReceiptService,
    private readReceiptSocket: ReadReceiptSocketService,
    private attachmentService: AttachmentService,
    private cdr: ChangeDetectorRef
  ) {
    // --- Observable assignments ---
    this.selectedConversation$ = this.store
      .select(ConversationSelectors.selectSelectedConversation)
      .pipe(map((conv) => conv ?? null));
    this.messages$ = this.store.select(MessageSelectors.selectAllMessages);
    this.loading$ = this.store.select(MessageSelectors.selectMessagesLoading);
    this.error$ = this.store.select(MessageSelectors.selectMessagesError);
    this.typingUsers$ = this.store.select(
      ConversationSelectors.selectTypingUsers
    );
    this.onlineUsers$ = this.store.select(
      ConversationSelectors.selectOnlineUsers
    );
    this.otherUserId$ = this.selectedConversation$.pipe(
      map((conversation) => {
        if (!conversation || conversation.isGroup) {
          return null;
        }
        return conversation.participants.find((id) => id !== this.myId) || null;
      })
    );
    this.messagesWithAttachment$ = this.store.select(
      selectMessagesWithAttachment
    );
    this.attachments$ = this.selectedConversation$.pipe(
      map((convo) => convo?._id),
      filter(Boolean),
      switchMap((conversationId) =>
        this.store.select(selectAttachmentsByConversation(conversationId!))
      )
    );
  }

  // --- Lifecycle ---
  ngOnInit(): void {
    this.conversationSub = this.selectedConversation$
      .pipe(
        map((conversation) => conversation?._id),
        distinctUntilChanged(),
        filter((id) => !!id)
      )
      .subscribe((conversationId) => {
        if (conversationId && conversationId !== this.selectedConversationId) {
          this.selectedConversationId = conversationId;
          this.conversationReadReceipts = {};
          this.store.dispatch(MessageActions.loadMessages({ conversationId }));
          this.socketService.joinConversation(conversationId);
          this.attachmentService.loadAttachmentsByConversation(conversationId);
        }
        this.messages$
          .subscribe((messages) => {
            this.markLastMessageAsReadIfNeeded(messages);
          })
          .unsubscribe();
      });

    this.socketMessageSub = this.socketService
      .onMessage()
      .subscribe((message) => {
        this.store.dispatch(MessageActions.receiveMessage({ message }));
      });

    this.readReceiptSocketSub = this.readReceiptSocket
      .onReadReceiptUpdated()
      .subscribe((event) => {
        if (event.messageId && this.conversationReadReceipts[event.messageId]) {
          const newUser = event.user || { userId: event.userId };
          const existingUsers = this.conversationReadReceipts[event.messageId];
          const userExists = existingUsers.some(
            (u) => (u.userId || u._id) === (newUser.userId || newUser._id)
          );
          if (!userExists) {
            this.conversationReadReceipts[event.messageId] = [
              ...existingUsers,
              newUser,
            ];
            this.messages$
              .pipe()
              .subscribe((messages) => {
                if (messages.length > 0) {
                  const lastMessage = messages[messages.length - 1];
                  if (lastMessage && lastMessage._id === event.messageId) {
                    this.lastMessageReadReceipts =
                      this.conversationReadReceipts[event.messageId];
                    this.cdr.detectChanges();
                  }
                }
              })
              .unsubscribe();
          }
        }
      });

    this.messagesAndAttachmentsSub = combineLatest([
      this.messages$,
      this.store.select(selectAttachmentEntities),
    ]).subscribe(([messages]) => {
      this.loadReadReceiptsForMessages(messages);
    });

    combineLatest([
      this.store.select(selectMessagesPage),
      this.store.select(selectMessagesTotalPages),
      this.loading$,
    ]).subscribe(([page, totalPages, loading]) => {
      this.page = typeof page === 'number' ? page : 1;
      this.totalPages = typeof totalPages === 'number' ? totalPages : 1;
      this.loading = loading;
    });

    this.selectedConversation$?.subscribe(
      (convo) => (this.selectedConversationId = convo?._id || '')
    );
  }

  ngAfterViewInit() {
    this.messagesSub = this.messages$.subscribe((messages) => {
      this.markLastMessageAsReadIfNeeded(messages);
      this.shouldScrollToBottom = true;
    });
  }

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  ngOnDestroy() {
    this.messagesSub?.unsubscribe();
    this.socketMessageSub?.unsubscribe();
    this.conversationSub?.unsubscribe();
    this.messagesAndAttachmentsSub?.unsubscribe();
    this.readReceiptsSub?.unsubscribe();
    this.readReceiptSocketSub?.unsubscribe();
  }

  // --- Mark as read logic ---
  private markLastMessageAsReadIfNeeded(messages: Message[]) {
    if (messages && messages.length > 0) {
      const unreadIds: string[] = messages
        .filter(
          (msg) =>
            msg.senderId !== this.myId &&
            this.selectedConversationId &&
            this.lastMessageReadReceipts &&
            !this.lastMessageReadReceipts.some(
              (u) =>
                (u.userId || u._id) === this.myId && u.messageId === msg._id
            )
        )
        .map((msg) => msg._id + '');
      if (unreadIds.length > 0) {
        this.messageReadReceiptService
          .markMultipleMessagesAsRead(this.selectedConversationId, unreadIds)
      }
    }
  }

  // --- Read receipts ---
  private loadReadReceiptsForMessages(messages: any[]) {
    if (!this.selectedConversationId || !messages.length) {
      this.conversationReadReceipts = {};
      this.lastMessageReadReceipts = [];
      return;
    }
    const messageIds = messages.filter((msg) => msg._id).map((msg) => msg._id);
    if (messageIds.length === 0) {
      this.conversationReadReceipts = {};
      this.lastMessageReadReceipts = [];
      return;
    }
    if (this.isLoadingReadReceipts) {
      return;
    }
    this.readReceiptsSub?.unsubscribe();
    this.isLoadingReadReceipts = true;
    this.readReceiptsSub = this.messageReadReceiptService
      .getConversationReadReceipts(this.selectedConversationId, messageIds)
      .subscribe({
        next: (receiptsMap) => {
          this.conversationReadReceipts = {};
          Object.keys(receiptsMap).forEach((messageId) => {
            this.conversationReadReceipts[messageId] = receiptsMap[
              messageId
            ].map((receipt) => receipt.user || { userId: receipt.userId });
          });
          const lastMessage = messages[messages.length - 1];
          if (lastMessage && lastMessage._id) {
            this.lastMessageReadReceipts =
              this.conversationReadReceipts[lastMessage._id] || [];
          }
          this.isLoadingReadReceipts = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error loading conversation read receipts:', error);
          this.conversationReadReceipts = {};
          this.lastMessageReadReceipts = [];
          this.isLoadingReadReceipts = false;
        },
      });
  }

  // --- UI/UX helpers ---
  toggleRightbar() {
    this.showRightbar = !this.showRightbar;
  }

  scrollToBottom() {
    try {
      this.messagesContainer.nativeElement.scrollTop =
        this.messagesContainer.nativeElement.scrollHeight;
    } catch {}
  }

  onMessagesScroll() {
    const container = this.messagesContainer?.nativeElement;
    if (!container) {
      return;
    }
    const threshold = 200;
    if (
      container.scrollTop < threshold &&
      !this.loading &&
      this.page < this.totalPages
    ) {
      this.loadMoreMessages();
    }
    if (
      container.scrollTop + container.clientHeight >=
      container.scrollHeight - 2
    ) {
      this.messages$
        .subscribe((messages) => {
          this.markLastMessageAsReadIfNeeded(messages);
        })
        .unsubscribe();
    }
  }

  loadMoreMessages() {
    if (typeof this.selectedConversationId === 'string') {
      this.store.dispatch(
        MessageActions.loadMessages({
          conversationId: this.selectedConversationId,
          page: this.page + 1,
          limit: this.limit,
        })
      );
    }
  }

  // --- File helpers ---
  isMediaAttachment(url: string): boolean {
    return /\.(jpg|jpeg|png|gif|webp|mp4|webm|ogg|mov)$/i.test(url);
  }

  isAttachmentObject(att: any): boolean {
    return att && typeof att === 'object' && ('url' in att || 'type' in att);
  }

  isImageFile(file: File): boolean {
    return file.type.startsWith('image/');
  }

  getFileIcon(file: File): string {
    const extension = this.getFileExtension(file.name);
    const iconMap: { [key: string]: string } = {
      pdf: 'bi bi-file-earmark-pdf',
      doc: 'bi bi-file-earmark-word',
      docx: 'bi bi-file-earmark-word',
      xls: 'bi bi-file-earmark-excel',
      xlsx: 'bi bi-file-earmark-excel',
      ppt: 'bi bi-file-earmark-ppt',
      pptx: 'bi bi-file-earmark-ppt',
      txt: 'bi bi-file-earmark-text',
      zip: 'bi bi-file-earmark-zip',
      rar: 'bi bi-file-earmark-zip',
      mp4: 'bi bi-camera-video',
      avi: 'bi bi-camera-video',
      mov: 'bi bi-camera-video',
      mp3: 'bi bi-music-note',
      wav: 'bi bi-music-note',
      flac: 'bi bi-music-note',
    };
    return iconMap[extension] || 'bi bi-file-earmark';
  }

  getFileIconClass(file: File): string {
    const extension = this.getFileExtension(file.name);
    if (['mp4', 'avi', 'mov', 'webm'].includes(extension)) {
      return 'video';
    }
    if (['mp3', 'wav', 'flac', 'aac'].includes(extension)) {
      return 'audio';
    }
    return extension;
  }

  getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  truncateFileName(filename: string, maxLength: number): string {
    if (filename.length <= maxLength) {
      return filename;
    }
    const extension = filename.split('.').pop();
    const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));
    const truncatedName =
      nameWithoutExt.substring(0, maxLength - extension!.length - 4) + '...';
    return `${truncatedName}.${extension}`;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) {
      return '0 Bytes';
    }
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.previews.splice(index, 1);
  }

  clearAllFiles(): void {
    this.selectedFiles = [];
    this.previews = [];
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedFiles = Array.from(input.files);
      this.previews = this.selectedFiles.map((file) =>
        file.type.startsWith('image/') ? URL.createObjectURL(file) : ''
      );
      this.uploading = true;
      this.attachmentService.uploadMultipleAttachments(
        this.selectedFiles,
        this.selectedConversationId,
        this.myId!
      ).subscribe((attachments) => {
        this.selectedPreviewAttachments = attachments.map(att => ({
          url: att.url,
          name: att.name,
          type: att.type,
          size: att.size
        }));
        this.uploading = false;
      });
    }
  }

  // --- Message actions ---
  async sendMessageWithFiles(content: string) {
    if (!this.selectedConversationId) {
      return;
    }
    const trimmedContent = content.trim();
    const hasContent = trimmedContent.length > 0;
    const hasFiles = this.selectedFiles.length > 0;
    if (this.editMode && this.editingMessage) {
      if (trimmedContent !== this.editingMessage.content) {
        this.store.dispatch(
          MessageActions.editMessage({
            messageId: this.editingMessage._id!,
            content: trimmedContent,
          })
        );
      }
      this.editMode = false;
      this.editingMessage = null;
      this.messageInput.nativeElement.value = '';
      return;
    }
    if (!hasContent && !hasFiles) {
      return;
    }
    this.uploading = true;
    try {
      let attachments: any[] = [];
      if (hasFiles) {
        attachments = this.selectedPreviewAttachments;
      }
      if (hasContent || attachments.length > 0) {
        this.store.dispatch(
          MessageActions.sendMessage({
            conversationId: this.selectedConversationId,
            content: trimmedContent,
            attachments,
            parentMessageId:
              this.replyMode && this.replyingToMessage
                ? this.replyingToMessage._id
                : undefined,
          })
        );
      }
    } catch (error) {
      console.error('Error sending message or uploading file:', error);
    } finally {
      this.selectedFiles = [];
      this.previews = [];
      this.selectedAttachmentIds = [];
      this.uploading = false;
      if (this.replyMode) {
        this.cancelReply();
      }
      this.shouldScrollToBottom = true;
    }
  }

  onEditMessage(message: Message) {
    this.editMode = true;
    this.editingMessage = message;
    setTimeout(() => {
      this.messageInput?.nativeElement.focus();
      this.messageInput.nativeElement.value = message.content;
    });
  }

  cancelEdit() {
    this.editMode = false;
    this.editingMessage = null;
    this.messageInput.nativeElement.value = '';
    this.cdr.detectChanges();
  }

  onReplyMessage(message: any) {
    console.log('Replying to message:', message);
    this.replyMode = true;
    this.replyingToMessage = {
      ...message,
      senderName: message.sender?.fullName || message.senderName || 'Unknown',
      attachmentId: message.attachmentId || null,
    };
    this.messageInput?.nativeElement.focus();
  }

  cancelReply() {
    this.replyMode = false;
    this.replyingToMessage = null;
    this.cdr.detectChanges();
  }

  onDeleteMessage(event: { message: any; deleteType: DeleteType }) {
    const { message, deleteType } = event;
    this.messageService.deleteMessage(message._id, deleteType);
  }

  onReactMessage(event: {
    messageId: string;
    emoji: string;
    action: 'add' | 'remove';
  }) {
    if (event.action === 'add') {
      this.store.dispatch(
        MessageActions.addReaction({
          messageId: event.messageId,
          emoji: event.emoji,
          conversationId: this.selectedConversationId,
        })
      );
    } else if (event.action === 'remove') {
      this.store.dispatch(
        MessageActions.removeReaction({
          messageId: event.messageId,
          emoji: event.emoji,
          conversationId: this.selectedConversationId,
        })
      );
    }
  }

  getFirstNameInitial(name: string): string {
    if (!name) {
      return '';
    }
    return name?.trim().split(' ')[0];
  }

  trackByMessageId(index: number, message: Message): string {
    return message._id || '';
  }
}
