import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { Label } from '../../../shared/enums/models/label.model';
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';

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

  @ViewChild(NgbDropdown) dropdown!: NgbDropdown;

  closeDropdown() {
    if (this.dropdown) {
      this.dropdown.close();
    }
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
    event.stopPropagation();
    this.markRead.emit();
    this.closeDropdown();
  }

  toggleArchive(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.archive.emit();
    this.closeDropdown();
  }

  clearConversation(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.clear.emit();
    this.closeDropdown();
  }
  onSubDropdownClick(event: Event) {
    event.preventDefault();
    event.stopPropagation();
  }

  onOpenChange(isOpen: boolean) {
    this.openStateChange.emit(isOpen);
  }
}


