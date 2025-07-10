import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription, combineLatest } from 'rxjs';
import { map, distinctUntilChanged, filter, switchMap } from 'rxjs/operators';
import { Conversation } from '../../../shared/enums/models/conversation.model';
import { Message } from '../../../shared/enums/models/message.model';
import * as ConversationSelectors from '../../store/conversation/conversation.selectors';
import * as MessageActions from '../../store/message/message.actions';
import * as MessageSelectors from '../../store/message/message.selectors';
import * as AttachmentActions from '../../store/attachment/attachment.actions';
import { selectMessagesWithAttachment } from '../../store/message/message.selectors';
import { AuthService } from '../../../auth/services/auth.service';
import { SocketService } from '../../services/socket/socket.service';
import { selectAttachmentEntities, selectAttachmentsByConversation } from '../../store/attachment/attachment.selectors';
import { MessageService } from '../../services/message/message.service';
import { DeleteType } from '../../../shared/enums/models/delete-type.enum';
import { MessageReadReceiptService } from '../../services/message-read-receipt/message-read-receipt.service';
import { ReadReceiptSocketService } from '../../services/socket/read-receipt-socket.service';
import { ReplyingToMessage } from '../../../shared/enums/models/reply-msg.model';
import { selectMessagesPage, selectMessagesTotalPages } from '../../store/message/message.selectors';
import { Attachment } from '../../../shared/enums/models/attachment.model';

@Component({
  selector: 'app-main-content',
  templateUrl: './main-content.component.html',
  styleUrls: ['./main-content.component.css'],
})
export class MainContentComponent implements OnInit, AfterViewInit, OnDestroy {
  myId = this.authService.getCurrentUserId();

  showRightbar = true;
  selectedConversation$: Observable<Conversation | null>;
  messages$: Observable<Message[]>;
  messagesWithAttachment$: Observable<any>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  typingUsers$: Observable<{ userId: string; timestamp: number }[]>;
  onlineUsers$: Observable<string[]>;
  otherUserId$: Observable<string | null>;
  attachments$: Observable<Attachment[]>;
  page = 1;
  totalPages = 1;
  loading = false;
  limit = 20;
  selectedConversationId: string = "";

  private messagesSub?: Subscription;
  private socketMessageSub?: Subscription;
  private conversationSub?: Subscription;
  private messagesAndAttachmentsSub?: Subscription;
  selectedFiles: File[] = [];
  previews: string[] = [];
  uploading = false;

  editMode: boolean = false;
  editingMessage: Message | null = null;

  // Reply state
  replyMode: boolean = false;
  replyingToMessage: ReplyingToMessage | null = null;

  // Read receipts optimization
  conversationReadReceipts: { [messageId: string]: any[] } = {};
  lastMessageReadReceipts: any[] = [];
  private readReceiptsSub?: Subscription;
  private readReceiptSocketSub?: Subscription;
  private isLoadingReadReceipts = false;

  @ViewChild('messagesContainer') messagesContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('messageInput') messageInput!: ElementRef<HTMLInputElement>;

  constructor(
    private store: Store,
    private authService: AuthService,
    private socketService: SocketService,
    private messageService: MessageService,
    private messageReadReceiptService: MessageReadReceiptService,
    private readReceiptSocket: ReadReceiptSocketService,
    private cdr: ChangeDetectorRef
  ) {
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
      map(convo => convo?._id),
      filter(Boolean),
      switchMap(conversationId => {
        return this.store.select(selectAttachmentsByConversation(conversationId!));
      }),
    );
  }
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
        }
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

            // Update lastMessageReadReceipts if this is the last message
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

    // Load attachments and read receipts when messages change
    this.messagesAndAttachmentsSub = combineLatest([
      this.messages$,
      this.store.select(selectAttachmentEntities),
    ]).subscribe(([messages, entities]) => {
      // Load attachments for messages that don't have them loaded yet
      messages.forEach((msg) => {
        if (msg.attachmentId && !entities[msg.attachmentId]) {
          this.store.dispatch(
            AttachmentActions.loadAttachment({
              attachmentId: msg.attachmentId!,
            })
          );
        }
      });

      // Load read receipts for the current messages
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
      (convo) => (this.selectedConversationId = convo?._id || "")
    );
  }

  ngAfterViewInit() {
    this.messagesSub = this.messages$.subscribe(() => {
      setTimeout(() => this.scrollToBottom(), 0);
    });
  }

  toggleRightbar() {
    this.showRightbar = !this.showRightbar;
  }

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
    }
  }

  async sendMessageWithFiles(content: string) {
    if (!this.selectedConversationId) {
      return;
    }

    const trimmedContent = content.trim();
    const hasContent = trimmedContent.length > 0;
    const hasFiles = this.selectedFiles.length > 0;

    // Handle edit mode
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
      switch (this.selectedFiles.length) {
        case 0:
          if (hasContent) {
            this.store.dispatch(
              MessageActions.sendMessage({
                conversationId: this.selectedConversationId,
                content: trimmedContent,
                parentMessageId:
                  this.replyMode && this.replyingToMessage
                    ? this.replyingToMessage._id
                    : undefined,
              })
            );
          }
          break;

        case 1:
          const singleFile = this.selectedFiles[0];
          this.store.dispatch(
            AttachmentActions.uploadAttachment({
              file: singleFile,
              content: trimmedContent,
              conversationId: this.selectedConversationId,
              uploadedBy: this.myId!,
              fileName: singleFile.name,
            })
          );
          break;

        default:
          if (hasContent) {
            this.store.dispatch(
              MessageActions.sendMessage({
                conversationId: this.selectedConversationId,
                content: trimmedContent,
              })
            );
          }

          this.selectedFiles.forEach((file, index) => {
            const isLast = index === this.selectedFiles.length - 1;
            this.store.dispatch(
              AttachmentActions.uploadAttachment({
                file: file,
                content: '',
                conversationId: this.selectedConversationId,
                uploadedBy: this.myId!,
                fileName: isLast ? file.name : undefined,
              })
            );
          });
          break;
      }
    } catch (error) {
      console.error('Error sending message or uploading file:', error);
    } finally {
      this.selectedFiles = [];
      this.previews = [];
      this.uploading = false;

      // Clear reply mode after sending
      if (this.replyMode) {
        this.cancelReply();
      }
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

  // Reply methods
  onReplyMessage(message: any) {
    this.replyMode = true;
    this.replyingToMessage = {
      ...message,
      senderName: message.sender?.fullName || message.senderName || 'Unknown'
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

  getSystemMessageText(message: Message): string {
    if (!message || message.type !== 'SYSTEM') {
      return '';
    }

    const performer = message.meta?.actionPerformer?.fullName || 'A user';

    switch (message.systemType) {
      case 'USER_LEAVE':
        return `${performer} left the group`;

      case 'USER_REMOVED': {
        const removed = message.meta?.removedUser?.fullName || 'a user';
        return `${performer} removed ${removed} from the group`;
      }

      case 'USER_ADDED': {
        const addedUsers =
          message.meta?.addedUsers?.map((u: any) => u.fullName).join(', ') ||
          'a user';
        return `${performer} added ${addedUsers} to the group`;
      }

      case 'GROUP_RENAME':
        return `Group was renamed${message.meta?.newName ? ' to ' + message.meta.newName : ''
          }`;

      default:
        return 'System event';
    }
  }

  private scrollToBottom() {
    try {
      this.messagesContainer.nativeElement.scrollTop =
        this.messagesContainer.nativeElement.scrollHeight;
    } catch { }
  }

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

    // Prevent duplicate API calls
    if (this.isLoadingReadReceipts) {
      return;
    }

    // Unsubscribe from previous subscription
    this.readReceiptsSub?.unsubscribe();

    this.isLoadingReadReceipts = true;

    // Load all read receipts
    this.readReceiptsSub = this.messageReadReceiptService
      .getConversationReadReceipts(this.selectedConversationId, messageIds)
      .subscribe({
        next: (receiptsMap) => {
          this.conversationReadReceipts = {};

          // Transform the response to map messageId to user array
          Object.keys(receiptsMap).forEach((messageId) => {
            this.conversationReadReceipts[messageId] = receiptsMap[
              messageId
            ].map((receipt) => receipt.user || { userId: receipt.userId });
          });

          // Update last message read receipts
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

  trackByMessageId(index: number, message: any): string {
    return message._id;
  }

  ngOnDestroy() {
    this.messagesSub?.unsubscribe();
    this.socketMessageSub?.unsubscribe();
    this.conversationSub?.unsubscribe();
    this.messagesAndAttachmentsSub?.unsubscribe();
    this.readReceiptsSub?.unsubscribe();
    this.readReceiptSocketSub?.unsubscribe();
  }

  getFirstNameInitial(name: string): string {
    if (!name) {
      return '';
    }
    return name?.trim().split(' ')[0];
  }

  onMessagesScroll() {
    const container = this.messagesContainer?.nativeElement;
    if (!container) { return; }
    const threshold = 200; // px from top
    if (container.scrollTop < threshold && !this.loading && this.page < this.totalPages) {
      this.loadMoreMessages();
    }
  }

  loadMoreMessages() {
    if (typeof this.selectedConversationId === 'string') {
      this.store.dispatch(MessageActions.loadMessages({
        conversationId: this.selectedConversationId,
        page: this.page + 1,
        limit: this.limit
      }));
    }
  }
}
