import { Component } from '@angular/core';
import { BaseMessageComponent } from '../base-message/base-message.component';

@Component({
  selector: 'app-attachment-message',
  templateUrl: './attachment-message.component.html',
  styleUrls: ['./attachment-message.component.css', '../base-message/base-message.component.css']
})
export class AttachmentMessageComponent extends BaseMessageComponent {
  getFileIcon(url: any): string {
    let fileName = '';
    if (typeof url === 'string') {
      fileName = url;
    } else if (url && typeof url === 'object' && url.name) {
      fileName = url.name;
    } else if (url && typeof url === 'object' && url.url) {
      fileName = url.url;
    }
    if (typeof fileName !== 'string') fileName = '';
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return 'bi-file-earmark-pdf text-danger';
      case 'doc':
      case 'docx': return 'bi-file-earmark-word text-primary';
      case 'xls':
      case 'xlsx': return 'bi-file-earmark-excel text-success';
      case 'ppt':
      case 'pptx': return 'bi-file-earmark-ppt text-warning';
      case 'zip':
      case 'rar': return 'bi-file-earmark-zip text-secondary';
      case 'txt': return 'bi-file-earmark-text';
      case 'mp3':
      case 'wav': return 'bi-file-earmark-music';
      case 'mp4':
      case 'mov':
      case 'avi': return 'bi-file-earmark-play';
      default: return 'bi-file-earmark';
    }
  }

  getFileName(url: any): string {
    let fileName = '';
    if (typeof url === 'string') {
      fileName = url;
    } else if (url && typeof url === 'object' && url.name) {
      fileName = url.name;
    } else if (url && typeof url === 'object' && url.url) {
      fileName = url.url;
    }
    if (typeof fileName !== 'string') fileName = '';
    return fileName.split('/').pop() || 'file';
  }
}
