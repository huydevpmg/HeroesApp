import { Component } from '@angular/core';
import { BaseMessageComponent } from '../base-message/base-message.component';

@Component({
  selector: 'app-attachment-message',
  templateUrl: './attachment-message.component.html',
  styleUrls: ['./attachment-message.component.css', '../base-message/base-message.component.css']
})
export class AttachmentMessageComponent extends BaseMessageComponent {
  getFileIcon(url: string): string {
    const extension = url.split('.').pop()?.toLowerCase();
    
    switch(extension) {
      case 'pdf':
        return 'bi-file-earmark-pdf';
      case 'doc':
      case 'docx':
        return 'bi-file-earmark-word';
      case 'xls':
      case 'xlsx':
        return 'bi-file-earmark-excel';
      case 'ppt':
      case 'pptx':
        return 'bi-file-earmark-ppt';
      case 'zip':
      case 'rar':
        return 'bi-file-earmark-zip';
      default:
        return 'bi-file-earmark';
    }
  }
  
  getFileName(url: string): string {
    return url.split('/').pop() || 'file';
  }
}