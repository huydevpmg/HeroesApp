import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Label } from '../../../shared/enums/models/label.model';

@Component({
  selector: 'app-dropdown-label',
  templateUrl: './dropdown-label.component.html',
  styleUrls: ['./dropdown-label.component.css']
})
export class DropdownLabelComponent {
  @Input() userConversationId!: string;
  @Input() conversationId!: string;
  @Input() selectedLabelId: string | null = null;
  @Input() labels: Label[] = [];
  @Input() isArchived: boolean = false;
  @Input() isHovered: boolean = false;

  @Output() selectLabel = new EventEmitter<{ userConversationId: string, label: string, conversationId: string }>();
  @Output() manageLabels = new EventEmitter<void>();
  @Output() markRead = new EventEmitter<void>();
  @Output() archive = new EventEmitter<void>();
  @Output() clear = new EventEmitter<void>();
  @Output() openStateChange = new EventEmitter<boolean>();

  isOpenDropdown = false;
  isOpenSubDropdown = false;

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.isOpenDropdown = !this.isOpenDropdown;
    this.isOpenSubDropdown = false;
  }

  closeDropdown() {
    this.isOpenDropdown = false;
    this.isOpenSubDropdown = false;
    this.openStateChange.emit(false);
  }

  openSubDropdown(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.isOpenSubDropdown = !this.isOpenSubDropdown;
  }

  selectLabelHandler(labelId: string, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.selectLabel.emit({
      userConversationId: this.userConversationId,
      label: labelId,
      conversationId: this.conversationId
    });
    this.closeDropdown();
  }

  onManageLabels(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.manageLabels.emit();
    this.closeDropdown();
  }

  markAsRead(event: Event) {
    event.preventDefault();
    this.markRead.emit();
    this.closeDropdown();
  }

  toggleArchive(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.archive.emit();
    this.closeDropdown();
  }

  clearConversation(event: Event) {
    event.preventDefault();
    this.clear.emit();
    this.closeDropdown();
  }
}
