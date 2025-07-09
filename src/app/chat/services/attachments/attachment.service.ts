import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AttachmentApiService } from './attachment-api.service';
import { Attachment } from '../../../shared/enums/models/attachment.model';

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
