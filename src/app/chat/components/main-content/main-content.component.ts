import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription, combineLatest } from 'rxjs';
import { map, distinctUntilChanged, filter } from 'rxjs/operators';
import { Conversation } from '../../../shared/enums/models/conversation.model';
import { Message } from '../../../shared/enums/models/message.model';
import * as ConversationSelectors from '../../store/conversation/conversation.selectors';
import * as MessageActions from '../../store/message/message.actions';
import * as MessageSelectors from '../../store/message/message.selectors';
import * as AttachmentActions from '../../store/attachment/attachment.actions';
import { selectMessagesWithAttachment } from '../../store/message/message.selectors';
import { AuthService } from '../../../auth/services/auth.service';
import { SocketService } from '../../services/socket/socket.service';
import { selectAttachmentEntities } from '../../store/attachment/attachment.selectors';
import { MessageService } from '../../services/message/message.service';
import { DeleteType } from '../../../shared/enums/models/delete-type.enum';
import { MessageReadReceiptService } from '../../services/message-read-receipt/message-read-receipt.service';
import { ReadReceiptSocketService } from '../../services/socket/read-receipt-socket.service';

@Component({
  selector: 'app-main-content',
  templateUrl: './main-content.component.html',
  styleUrls: ['./main-content.component.css']
})
export class MainContentComponent implements OnInit, AfterViewInit, OnDestroy {
  showRightbar = true;
  selectedConversation$: Observable<Conversation | null>;
  messages$: Observable<Message[]>;
  messagesWithAttachment$: Observable<any>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  typingUsers$: Observable<{ userId: string; timestamp: number; }[]>;
  onlineUsers$: Observable<string[]>;
  otherUserId$: Observable<string | null>;
  selectedConversationId: string = '';

  private messagesSub?: Subscription;
  private socketMessageSub?: Subscription;
  private conversationSub?: Subscription;
  private messagesAndAttachmentsSub?: Subscription;
  selectedFiles: File[] = [];
  previews: string[] = [];
  uploading = false;

  // Read receipts optimization
  conversationReadReceipts: { [messageId: string]: any[] } = {};
  lastMessageReadReceipts: any[] = [];
  private readReceiptsSub?: Subscription;
  private readReceiptSocketSub?: Subscription;
  private isLoadingReadReceipts = false;

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef<HTMLDivElement>;

  constructor(
    private store: Store,
    private authService: AuthService,
    private socketService: SocketService,
    private messageService: MessageService,
    private messageReadReceiptService: MessageReadReceiptService,
    private readReceiptSocket: ReadReceiptSocketService,
    private cdr: ChangeDetectorRef
  ) {
    this.selectedConversation$ = this.store.select(ConversationSelectors.selectSelectedConversation).pipe(
      map(conv => conv ?? null)
    );
    this.messages$ = this.store.select(MessageSelectors.selectAllMessages);
    this.loading$ = this.store.select(MessageSelectors.selectMessagesLoading);
    this.error$ = this.store.select(MessageSelectors.selectMessagesError);
    this.typingUsers$ = this.store.select(ConversationSelectors.selectTypingUsers);
    this.onlineUsers$ = this.store.select(ConversationSelectors.selectOnlineUsers);

    this.otherUserId$ = this.selectedConversation$.pipe(
      map(conversation => {
        if (!conversation || conversation.isGroup) { return null };
        const myId = this.authService.getCurrentUserId();
        return conversation.participants.find(id => id !== myId) || null;
      })
    );

    this.messagesWithAttachment$ = this.store.select(selectMessagesWithAttachment);
  }

  ngOnInit(): void {
    this.conversationSub = this.selectedConversation$
      .pipe(
        map(conversation => conversation?._id),
        distinctUntilChanged(),
        filter(id => !!id)
      )
      .subscribe(conversationId => {
        if (conversationId && conversationId !== this.selectedConversationId) {
          this.selectedConversationId = conversationId;
          this.conversationReadReceipts = {};
          this.store.dispatch(MessageActions.loadMessages({ conversationId }));
          this.socketService.joinConversation(conversationId);
        }
      });

    this.socketMessageSub = this.socketService.onMessage().subscribe(message => {
      this.store.dispatch(MessageActions.receiveMessage({ message }));
    });

    this.readReceiptSocketSub = this.readReceiptSocket.onReadReceiptUpdated().subscribe(event => {
      if (event.messageId && this.conversationReadReceipts[event.messageId]) {
        const newUser = event.user || { userId: event.userId };
        const existingUsers = this.conversationReadReceipts[event.messageId];

        const userExists = existingUsers.some(u =>
          (u.userId || u._id) === (newUser.userId || newUser._id)
        );

        if (!userExists) {
          this.conversationReadReceipts[event.messageId] = [...existingUsers, newUser];

          // Update lastMessageReadReceipts if this is the last message
          this.messages$.pipe().subscribe(messages => {
            if (messages.length > 0) {
              const lastMessage = messages[messages.length - 1];
              if (lastMessage && lastMessage._id === event.messageId) {
                this.lastMessageReadReceipts = this.conversationReadReceipts[event.messageId];
                this.cdr.detectChanges();
              }
            }
          }).unsubscribe();
        }
      }
    });

    // Load attachments and read receipts when messages change
    this.messagesAndAttachmentsSub = combineLatest([
      this.messages$,
      this.store.select(selectAttachmentEntities)
    ]).subscribe(([messages, entities]) => {
      // Load attachments for messages that don't have them loaded yet
      messages.forEach(msg => {
        if (msg.attachmentId && !entities[msg.attachmentId]) {
          this.store.dispatch(AttachmentActions.loadAttachment({ attachmentId: msg.attachmentId! }));
        }
      });

      // Load read receipts for the current messages
      this.loadReadReceiptsForMessages(messages);
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
      'pdf': 'bi bi-file-earmark-pdf',
      'doc': 'bi bi-file-earmark-word',
      'docx': 'bi bi-file-earmark-word',
      'xls': 'bi bi-file-earmark-excel',
      'xlsx': 'bi bi-file-earmark-excel',
      'ppt': 'bi bi-file-earmark-ppt',
      'pptx': 'bi bi-file-earmark-ppt',
      'txt': 'bi bi-file-earmark-text',
      'zip': 'bi bi-file-earmark-zip',
      'rar': 'bi bi-file-earmark-zip',
      'mp4': 'bi bi-camera-video',
      'avi': 'bi bi-camera-video',
      'mov': 'bi bi-camera-video',
      'mp3': 'bi bi-music-note',
      'wav': 'bi bi-music-note',
      'flac': 'bi bi-music-note'
    };
    return iconMap[extension] || 'bi bi-file-earmark';
  }

  getFileIconClass(file: File): string {
    const extension = this.getFileExtension(file.name);
    if (['mp4', 'avi', 'mov', 'webm'].includes(extension)) { return 'video'; }
    if (['mp3', 'wav', 'flac', 'aac'].includes(extension)) { return 'audio'; }
    return extension;
  }

  getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  truncateFileName(filename: string, maxLength: number): string {
    if (filename.length <= maxLength) { return filename; }
    const extension = filename.split('.').pop();
    const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));
    const truncatedName = nameWithoutExt.substring(0, maxLength - extension!.length - 4) + '...';
    return `${truncatedName}.${extension}`;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) { return '0 Bytes'; }
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
      this.previews = this.selectedFiles.map(file =>
        file.type.startsWith('image/') ? URL.createObjectURL(file) : ''
      );
    }
  }

  async sendMessageWithFiles(content: string) {
    if (!this.selectedConversationId) { return; }
    if (!content.trim() && this.selectedFiles.length === 0) { return; }

    this.uploading = true;
    const userId = this.authService.getCurrentUserId() || '';

    try {
      if (this.selectedFiles.length === 0) {
        this.store.dispatch(MessageActions.sendMessage({
          conversationId: this.selectedConversationId,
          content
        }));
        this.selectedFiles = [];
        this.previews = [];
        this.uploading = false;
      }
      else if (this.selectedFiles.length === 1) {
        const file = this.selectedFiles[0];
        this.store.dispatch(AttachmentActions.uploadAttachment({
          file: file,
          content: content.trim(),
          conversationId: this.selectedConversationId,
          uploadedBy: userId,
          fileName: file.name
        }));
        this.selectedFiles = [];
        this.previews = [];
        this.uploading = false;
      }
      else {
        if (content.trim()) {
          this.store.dispatch(MessageActions.sendMessage({
            conversationId: this.selectedConversationId,
            content: content.trim()
          }));
        }

        let uploadCount = 0;
        const total = this.selectedFiles.length;
        this.selectedFiles.forEach((file, idx) => {
          this.store.dispatch(AttachmentActions.uploadAttachment({
            file: file,
            content: '',
            conversationId: this.selectedConversationId,
            uploadedBy: userId,
            fileName: idx === this.selectedFiles.length - 1 ? file.name : undefined
          }));
          uploadCount++;
          if (uploadCount === total) {
            this.selectedFiles = [];
            this.previews = [];
            this.uploading = false;
          }
        });
      }
    } catch {
      this.uploading = false;
    }
  }

  onEditMessage(message: any) {

  }

  onDeleteMessage(event: { message: any, deleteType: DeleteType }) {
    const { message, deleteType } = event;
    this.messageService.deleteMessage(message._id, deleteType);
  }

  getSystemMessageText(message: Message): string {
    if (!message || message.type !== 'SYSTEM') { return ''; }
    switch (message.systemType) {
      case 'USER_LEAVE':
        return `${message.meta?.fullName || 'A user'} left the group`;
      case 'USER_REMOVED':
        return `${message.meta?.fullName || 'A user'} was removed from the group`;
      case 'USER_ADDED':
        return `${message.meta?.fullName || 'A user'} was added to the group`;
      case 'GROUP_RENAME':
        return `Group was renamed${message.meta?.newName ? ' to ' + message.meta.newName : ''}`;
      default:
        return 'System event';
    }
  }

  private scrollToBottom() {
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    } catch { }
  }

  private loadReadReceiptsForMessages(messages: any[]) {
    if (!this.selectedConversationId || !messages.length) {
      this.conversationReadReceipts = {};
      this.lastMessageReadReceipts = [];
      return;
    }

    const messageIds = messages
      .filter(msg => msg._id)
      .map(msg => msg._id);

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
          Object.keys(receiptsMap).forEach(messageId => {
            this.conversationReadReceipts[messageId] = receiptsMap[messageId].map(receipt =>
              receipt.user || { userId: receipt.userId }
            );
          });

          // Update last message read receipts
          const lastMessage = messages[messages.length - 1];
          if (lastMessage && lastMessage._id) {
            this.lastMessageReadReceipts = this.conversationReadReceipts[lastMessage._id] || [];
          }

          this.isLoadingReadReceipts = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error loading conversation read receipts:', error);
          this.conversationReadReceipts = {};
          this.lastMessageReadReceipts = [];
          this.isLoadingReadReceipts = false;
        }
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
}
