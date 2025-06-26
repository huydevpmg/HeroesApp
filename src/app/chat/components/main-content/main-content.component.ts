import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription, firstValueFrom } from 'rxjs';
import { map, distinctUntilChanged, filter } from 'rxjs/operators';
import { Conversation } from '../../models/conversation.model';
import { Attachment, Message } from '../../models/message.model';
import * as ConversationSelectors from '../../store/conversation/conversation.selectors';
import * as MessageActions from '../../store/message/message.actions';
import * as MessageSelectors from '../../store/message/message.selectors';
import * as AttachmentActions from '../../store/attachment/attachment.actions';
import { selectMessagesWithAttachment } from '../../store/message/message.selectors';
import { AuthService } from '../../../auth/services/auth.service';
import { SocketService } from '../../services/socket/socket.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { selectAttachmentEntities } from '../../store/attachment/attachment.selectors';

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
  private messagesSub!: Subscription;
  private socketMessageSub!: Subscription;
  selectedFiles: File[] = [];
  previews: string[] = [];
  uploading = false;

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef<HTMLDivElement>;

  constructor(
    private store: Store,
    private authService: AuthService,
    private socketService: SocketService,
    private http: HttpClient
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
    this.selectedConversation$
      .pipe(
        map(conversation => conversation?._id),
        distinctUntilChanged(),
        filter(id => !!id)
      )
      .subscribe(conversationId => {
        if (conversationId && conversationId !== this.selectedConversationId) {
          this.selectedConversationId = conversationId;
          this.store.dispatch(MessageActions.loadMessages({ conversationId }));
        }
      });
    this.socketMessageSub = this.socketService.onMessage().subscribe(message => {
      this.store.dispatch(MessageActions.receiveMessage({ message }));
    });

    this.messages$.subscribe(messages => {
      this.store.select(selectAttachmentEntities).subscribe(entities => {
        messages.forEach(msg => {
          if (msg.attachmentId && !entities[msg.attachmentId]) {
            this.store.dispatch(AttachmentActions.loadAttachment({ attachmentId: msg.attachmentId! }));
          }
        });
      });
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

  // sendMessage(content: string) {
  //   if (!this.selectedConversationId) { return };
  //   this.store.dispatch(MessageActions.sendMessage({
  //     conversationId: this.selectedConversationId,
  //     content
  //   }));
  // }

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
    if (['mp4', 'avi', 'mov', 'webm'].includes(extension)) return 'video';
    if (['mp3', 'wav', 'flac', 'aac'].includes(extension)) return 'audio';
    return extension;
  }

  getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  truncateFileName(filename: string, maxLength: number): string {
    if (filename.length <= maxLength) return filename;
    const extension = filename.split('.').pop();
    const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));
    const truncatedName = nameWithoutExt.substring(0, maxLength - extension!.length - 4) + '...';
    return `${truncatedName}.${extension}`;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
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
    } catch (error) {
      this.uploading = false;
    }
  }

  private scrollToBottom() {
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    } catch (e) { }
  }

  ngOnDestroy() {
    this.messagesSub?.unsubscribe();
    this.socketMessageSub?.unsubscribe();
  }
}
