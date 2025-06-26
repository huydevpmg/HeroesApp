import { Component, Input, Output, EventEmitter, OnInit, HostListener, ElementRef } from '@angular/core';
import { AuthService } from '../../../../auth/services/auth.service';
import { Attachment } from '../../../models/attachment.model';

@Component({
  selector: 'app-base-message',
  templateUrl: './base-message.component.html',
  styleUrls: ['./base-message.component.css']
})
export class BaseMessageComponent implements OnInit {
  @Input() message!: any;
  @Input() conversationId!: string;
  @Input() isLast: boolean = false;

  @Output() react = new EventEmitter<any>();
  @Output() reply = new EventEmitter<any>();
  @Output() more = new EventEmitter<any>();
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();

  isCurrentUser = false;
  currentUserId: string | null = null;
  previewAttachment: Attachment | null = null;
  showDropdown = false;
  showDeleteModal = false;
  deleteOption: 'everyone' | 'justme' = 'justme';

  constructor(protected authService: AuthService, private elementRef: ElementRef) { }

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId();
    this.isCurrentUser = this.message.senderId === this.currentUserId;
    console.log('BaseMessageComponent initialized with message:', this.message);
  }

  isImage(url: string): boolean {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  }

  isVideo(url: string): boolean {
    return /\.(mp4|webm|ogg|mov)$/i.test(url);
  }

  onAttachmentClick(attachment: Attachment): void {
    if (attachment.type.startsWith('image/') || attachment.type.startsWith('video/')) {
      this.previewAttachment = attachment;
    } else if (attachment.url) {
      window.open(attachment.url, '_blank');
    }
  }

  closePreview(): void {
    this.previewAttachment = null;
  }

  getFileExtension(filename: string): string {
    if (!filename) return '';
    const parts = filename.split('.');
    return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
  }

  formatFileSize(bytes: number): string {
    if (!bytes || bytes === 0) return '0 B';

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
    console.log('Delete type selected:', this.deleteOption);
    this.delete.emit({
      message: this.message,
      deleteType: this.deleteOption
    });
    this.closeDeleteModal();
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.deleteOption = 'justme';
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
    if (!this.currentUserId || !this.message) { return false };
    if (this.message.deletedForUserIds?.includes(this.currentUserId)) {
      return false;
    }

    return true;
  }
  get isGloballyDeleted(): boolean {
    return !!this.message?.isDeleteGlobal;
  }
}
