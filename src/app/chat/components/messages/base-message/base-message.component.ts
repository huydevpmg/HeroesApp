import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
  HostListener,
  ElementRef,
} from '@angular/core';
import { AuthService } from '../../../../auth/services/auth.service';
import { Attachment } from '../../../../shared/enums/models/attachment.model';
import { DeleteType } from '../../../../shared/enums/models/delete-type.enum';
import { ReadReceiptSocketService } from '../../../services/socket/read-receipt-socket.service';

@Component({
  selector: 'app-base-message',
  templateUrl: './base-message.component.html',
  styleUrls: ['./base-message.component.css'],
})
export class BaseMessageComponent implements OnInit, OnChanges {
  @Input() message!: any;
  @Input() conversationId!: string;
  @Input() isLast: boolean = false;
  @Input() readReceipts: any[] = [];

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
  deleteOption: DeleteType = DeleteType.EVERYONE;

  readByUsers: any[] = [];

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
    private readReceiptSocket: ReadReceiptSocketService
  ) { }

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId();
    this.isCurrentUser = this.message.senderId === this.currentUserId;

    this.readByUsers = this.processReadByUsers(this.readReceipts);

    if (!this.isCurrentUser) {
      this.markAsRead();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['readReceipts'] && this.currentUserId) {
      const newReceipts = changes['readReceipts'].currentValue || [];
      this.readByUsers = this.processReadByUsers(newReceipts);
    }
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
    this.deleteOption;
    this.showDeleteModal = true;
    this.showDropdown = false;
  }

  confirmDelete() {
    if (!this.deleteOption) {
      alert('Please select a delete option');
      return;
    }
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
    const result = !!this.message?.isDeleteGlobal;
    return result;
  }

  getFileIconByExt(ext: string): string {
    return this.fileIconMap[ext] || '📎';
  }

  private processReadByUsers(users: any[]): any[] {
    if (!users || !users.length || !this.currentUserId) {
      return [];
    }
    
    // Filter out current user and deduplicate
    const uniqueUsers = users.filter((user, index, self) => {
      const currentId = this.getUserId(user);
      
      // Skip current user
      if (currentId === this.currentUserId) {
        return false;
      }
      
      // Deduplicate by user ID
      return index === self.findIndex(u => this.getUserId(u) === currentId);
    });
    
    return uniqueUsers;
  }

  private getUserId(user: any): string {
    return (user as any).userId || (user as any)._id || '';
  }
}
