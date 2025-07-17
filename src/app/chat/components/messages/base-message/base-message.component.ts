import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
  ElementRef,
  AfterViewInit,
  ViewChild,
  HostListener,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { AuthService } from '../../../../auth/services/auth.service';
import { Attachment } from '../../../../shared/enums/models/attachment.model';
import { DeleteType } from '../../../../shared/enums/models/delete-type.enum';

@Component({
  selector: 'app-base-message',
  templateUrl: './base-message.component.html',
  styleUrls: ['./base-message.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaseMessageComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() message!: any;
  @Input() conversationId!: string;
  @Input() isLast = false;
  @Input() readReceipts: any[] = [];
  @Input() openedEmojiId!: string | null;
  @Input() openedMoreId!: string | null;

  @Output() react = new EventEmitter<any>();
  @Output() reply = new EventEmitter<any>();
  @Output() more = new EventEmitter<any>();
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<{
    message: any;
    deleteType: DeleteType;
  }>();
  @Output() toggleEmoji = new EventEmitter<string | null>();
  @Output() toggleMore = new EventEmitter<string | null>();

  @ViewChild('emojiBtn') emojiBtn!: ElementRef;
  @ViewChild('innerMessage') innerMessage!: ElementRef;

  isCurrentUser = false;
  currentUserId: string | null = null;
  previewAttachment: Attachment | null = null;
  showDeleteModal = false;
  deleteOption: DeleteType = DeleteType.EVERYONE;
  readByUsers: any[] = [];
  emojiPosition = { top: '0px', left: '0px' };

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
    private authService: AuthService,
    private elementRef: ElementRef,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId();
    this.isCurrentUser = this.message.senderId === this.currentUserId;
    this.readByUsers = this.processReadByUsers(this.readReceipts);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['readReceipts'] && this.currentUserId) {
      this.readByUsers = this.processReadByUsers(
        changes['readReceipts'].currentValue || []
      );
    }
    this.cdr.markForCheck();
  }

  ngAfterViewInit(): void {
    const tooltipElements = this.elementRef.nativeElement.querySelectorAll(
      '[data-bs-toggle="tooltip"]'
    );
    tooltipElements.forEach(
      (el: HTMLElement) => new (window as any).bootstrap.Tooltip(el)
    );
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const clickedInside = this.innerMessage?.nativeElement.contains(
      event.target
    );
    if (!clickedInside) {
      if (this.isEmojiOpen) {
        this.toggleEmoji.emit(null);
      }
      if (this.isMoreOpen) {
        this.toggleMore.emit(null);
      }
    }
  }

  get isEmojiOpen() {
    return this.openedEmojiId === this.message._id;
  }
  get isMoreOpen() {
    return this.openedMoreId === this.message._id;
  }

  toggleEmojiPicker() {
    const rect = this.emojiBtn.nativeElement.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const pickerHeight = 360;
    this.emojiPosition =
      windowHeight - rect.bottom > pickerHeight + 50
        ? { top: `${rect.bottom + 8}px`, left: `${rect.right - 300}px` }
        : {
            top: `${rect.top - pickerHeight - 8}px`,
            left: `${rect.right - 300}px`,
          };
    this.toggleEmoji.emit(this.isEmojiOpen ? null : this.message._id);
  }

  toggleMoreDropdown() {
    this.toggleMore.emit(this.isMoreOpen ? null : this.message._id);
  }

  onEmojiClick(event: any) {
    const emoji =
      event?.emoji?.native ||
      event?.emoji?.colons ||
      event?.native ||
      event?.colons;
    const existingReaction = this.message.reactions?.find(
      (r: any) => r.emoji === emoji && r.userId === this.currentUserId
    );
    this.react.emit({
      messageId: this.message._id,
      emoji,
      action: existingReaction ? 'remove' : 'add',
    });
    this.toggleEmoji.emit(null);
  }

  onReact() {
    this.react.emit(this.message);
  }
  onReply() {
    this.reply.emit(this.message);
  }
  onEdit() {
    this.edit.emit(this.message);
  }

  onDelete() {
    this.showDeleteModal = true;
  }

  confirmDelete() {
    if (!this.deleteOption) {
      return alert('Please select a delete option');
    }
    this.delete.emit({ message: this.message, deleteType: this.deleteOption });
    this.closeDeleteModal();
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.deleteOption = DeleteType.JUSTME;
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

  closePreview() {
    this.previewAttachment = null;
  }

  isImage(url: string): boolean {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  }
  isVideo(url: string): boolean {
    return /\.(mp4|webm|ogg|mov)$/i.test(url);
  }

  getFileExtension(filename: string): string {
    return filename?.split('.').pop()?.toLowerCase() || '';
  }

  getFileIconByExt(ext: string): string {
    return this.fileIconMap[ext] || '📎';
  }

  formatFileSize(bytes: number): string {
    if (!bytes) {
      return '0 B';
    }
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${
      sizes[i]
    }`;
  }

  get shouldShowMessage(): boolean {
    return (
      this.currentUserId &&
      this.message &&
      !this.message.deletedForUserIds?.includes(this.currentUserId)
    );
  }

  get isGloballyDeleted(): boolean {
    return !!this.message?.isDeleteGlobal;
  }

  private processReadByUsers(users: any[]): any[] {
    if (!users?.length || !this.currentUserId) {
      return [];
    }
    return users.filter((u, i, self) => {
      const id = this.getUserId(u);
      return (
        id !== this.currentUserId &&
        i === self.findIndex((v) => this.getUserId(v) === id)
      );
    });
  }

  private getUserId(user: any): string {
    return user?.userId || user?._id || '';
  }

  getFirstNameInitial(name: string): string {
    return name?.trim().split(' ')[0] || '';
  }

  onImageError(event: any) {
    if (event.target) {
      event.target.src = 'https://i.pravatar.cc/150?img=1';
    }
  }

  getReactionUsersTooltip(reaction: any): string {
    return (reaction.users || [])
      .map((u: any) => {
        if (typeof u === 'string') {
          return u;
        }
        return u.fullName || u.username || u._id;
      })
      .join(', ');
  }

  isReactionActive(reaction: any): boolean {
    if (!reaction.users || !this.currentUserId) {
      return false;
    }
    return reaction.users.some((u: any) => {
      if (typeof u === 'string') {
        return u === this.currentUserId;
      }
      return this.getUserId(u) === this.currentUserId;
    });
  }

  onReactionClick(reaction: any) {
    if (this.isReactionActive(reaction)) {
      this.react.emit({
        messageId: this.message._id,
        emoji: reaction.emoji,
        action: 'remove',
        conversationId: this.conversationId,
      });
    } else {
      this.react.emit({
        messageId: this.message._id,
        emoji: reaction.emoji,
        action: 'add',
        conversationId: this.conversationId,
      });
    }
  }

  trackByReaction(index: number, reaction: any) {
    return reaction.emoji + '-' + (reaction.users?.length || 0);
  }
}
