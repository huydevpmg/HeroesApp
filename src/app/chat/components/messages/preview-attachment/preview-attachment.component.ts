import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Attachment } from '../../../../shared/enums/models/attachment.model';

@Component({
  selector: 'app-preview-attachment',
  templateUrl: './preview-attachment.component.html',
  styleUrls: ['./preview-attachment.component.css']
})
export class PreviewAttachmentComponent {
  @Input() previewAttachment: Attachment | null = null;
  @Output() close = new EventEmitter<void>();

  closePreview() {
    this.close.emit();
  }
}
