import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Attachment } from '../../../shared/enums/models/message.model';

@Injectable({
  providedIn: 'root'
})
export class AttachmentApiService {
  private apiUrl = `${environment.apiUrl}/attachments`;

  constructor(private http: HttpClient) { }

  uploadAttachment(file: File, content: string, conversationId: string, uploadedBy: string, fileName?: string): Observable<Attachment> {
    const form = new FormData();
    form.append('file', file);
    form.append('content', content);
    form.append('conversationId', conversationId);
    form.append('uploadedBy', uploadedBy);
    if (fileName) {
      form.append('fileName', fileName);
    }
    return this.http.post<Attachment>(this.apiUrl, form);
  }

  getAttachmentById(attachmentId: string): Observable<Attachment> {
    return this.http.get<Attachment>(`${this.apiUrl}/${attachmentId}`);
  }
}
