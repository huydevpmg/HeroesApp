import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Attachment } from '../../../shared/enums/models/message.model';
import { AttachmentApiService } from './attachment-api.service';

@Injectable({
  providedIn: 'root'
})
export class AttachmentService {
  constructor(private attachmentApi: AttachmentApiService) { }

  uploadAttachment(file: File, content: string, conversationId: string, uploadedBy: string, fileName?: string): Observable<Attachment> {
    return this.attachmentApi.uploadAttachment(file, content, conversationId, uploadedBy, fileName);
  }

  getAttachmentById(attachmentId: string): Observable<Attachment> {
    return this.attachmentApi.getAttachmentById(attachmentId);
  }
}
