import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  HostListener,
  ElementRef,
  OnDestroy,
} from '@angular/core';
import { AuthService } from '../../../../auth/services/auth.service';
import { Attachment } from '../../../../shared/enums/models/attachment.model';
import { DeleteType } from '../../../../shared/enums/models/delete-type.enum';
import { ReadReceiptSocketService } from '../../../services/socket/read-receipt-socket.service';
import { Subscription } from 'rxjs';
import { MessageReadReceiptService } from '../../../services/message-read-receipt/message-read-receipt.service';

@Component({
  selector: 'app-base-message',
  templateUrl: './base-message.component.html',
  styleUrls: ['./base-message.component.css'],
})
export class BaseMessageComponent implements OnInit, OnDestroy {
  @Input() message!: any;
  @Input() conversationId!: string;
  @Input() isLast: boolean = false;

  @Output() react = new EventEmitter<any>();
  @Output() reply = new EventEmitter<any>();
  @Output() more = new EventEmitter<any>();
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<{
    message: any;
    deleteType: DeleteType;
  }>();

  isCurrentUser = false;
  currentUserId: string | null = null;
  previewAttachment: Attachment | null = null;
  showDropdown = false;
  showDeleteModal = false;
  deleteOption: DeleteType = DeleteType.JUSTME;

  readByUsers: any[] = [];
  private readReceiptSub?: Subscription;

  fileIconMap: { [key: string]: string } = {
    pdf: '📄',
    doc: '📝',
    docx: '📝',
    xls: '📊',
    xlsx: '📊',
    ppt: '📊',
    pptx: '📊',
    txt: '📃',
    zip: '🗜️',
    rar: '🗜️',
  };

  constructor(
    protected authService: AuthService,
    private elementRef: ElementRef,
    private readReceiptSocket: ReadReceiptSocketService,
    private messageReadReceiptService: MessageReadReceiptService
  ) { }

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId();
    this.isCurrentUser = this.message.senderId === this.currentUserId;

    this.messageReadReceiptService.getMessageReadReceipts(this.message._id).subscribe({
      next: (receipts) => {
        this.readByUsers = this.processReadByUsers(receipts.map(r => r.user || { userId: r.userId }));
      },
      error: (error) => {
        console.error('Error loading read receipts for message:', this.message._id, error);
        this.readByUsers = [];
      }
    });

    this.readReceiptSub = this.readReceiptSocket.onReadReceiptUpdated().subscribe(event => {
      if (event.messageId === this.message._id) {
        const newUser = event.user || { userId: event.userId };
        if (!this.isDuplicateUser(newUser) && !this.isCurrentUserInList(newUser)) {
          this.readByUsers = [...this.readByUsers, newUser];
        } else {
          console.log('Duplicate or current user read receipt ignored:', newUser);
        }
      }
    });

    if (!this.isCurrentUser) {
      this.markAsRead();
    }
  }

  ngOnDestroy(): void {
    this.readReceiptSub?.unsubscribe();
  }

  private markAsRead() {
    if (this.currentUserId && this.conversationId && this.message._id) {
      const hasCurrentUserRead = this.readByUsers.some(u => this.getUserId(u) === this.currentUserId);

      if (!hasCurrentUserRead) {
        this.readReceiptSocket.markMessageAsReadBySocket(
          this.message._id,
          this.currentUserId,
          this.conversationId
        );
      }
    }
  }

  isImage(url: string): boolean {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  }

  isVideo(url: string): boolean {
    return /\.(mp4|webm|ogg|mov)$/i.test(url);
  }

  onAttachmentClick(attachment: Attachment): void {
    if (
      attachment.type.startsWith('image/') ||
      attachment.type.startsWith('video/')
    ) {
      this.previewAttachment = attachment;
    } else if (attachment.url) {
      window.open(attachment.url, '_blank');
    }
  }

  closePreview(): void {
    this.previewAttachment = null;
  }

  getFileExtension(filename: string): string {
    if (!filename) {
      return '';
    }
    const parts = filename.split('.');
    return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
  }

  formatFileSize(bytes: number): string {
    if (!bytes || bytes === 0) {
      return '0 B';
    }

    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = (bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1);

    return `${size} ${sizes[i]}`;
  }

  onReact() {
    this.react.emit(this.message);
  }

  onReply() {
    this.reply.emit(this.message);
  }

  onMore() {
    this.showDropdown = !this.showDropdown;
  }

  onEdit() {
    this.edit.emit(this.message);
    this.showDropdown = false;
  }

  onDelete() {
    this.showDeleteModal = true;
    this.showDropdown = false;
  }

  confirmDelete() {
    this.delete.emit({
      message: this.message,
      deleteType: this.deleteOption,
    });
    this.closeDeleteModal();
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.deleteOption = DeleteType.JUSTME;
  }

  onClickOutside() {
    this.showDropdown = false;
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: any) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showDropdown = false;
    }
  }

  get shouldShowMessage(): boolean {
    if (!this.currentUserId || !this.message) {
      return false;
    }
    if (this.message.deletedForUserIds?.includes(this.currentUserId)) {
      return false;
    }

    return true;
  }
  get isGloballyDeleted(): boolean {
    return !!this.message?.isDeleteGlobal;
  }

  getFileIconByExt(ext: string): string {
    return this.fileIconMap[ext] || '📎';
  }

  private processReadByUsers(users: any[]): any[] {
    const uniqueUsers = users.filter((user, index, self) => {
      const currentId = this.getUserId(user);
      if (currentId === this.currentUserId) {
        return false;
      }
      return index === self.findIndex(u => this.getUserId(u) === currentId);
    });
    return uniqueUsers;
  }

  private isDuplicateUser(newUser: any): boolean {
    const newUserId = this.getUserId(newUser);
    return this.readByUsers.some(u => this.getUserId(u) === newUserId);
  }

  private isCurrentUserInList(user: any): boolean {
    const userId = this.getUserId(user);
    return userId === this.currentUserId;
  }

  private getUserId(user: any): string {
    return (user as any).userId || (user as any)._id || '';
  }
}
