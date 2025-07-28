import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Attachment } from '../../../shared/enums/models/attachment.model';

@Injectable({
  providedIn: 'root'
})
export class AttachmentApiService {
  private apiUrl = `${environment.apiUrl}/attachments`;

  constructor(private http: HttpClient) { }

  uploadAttachments(
    files: File[],
    conversationId: string,
    uploadedBy: string,
    fileNames?: string[]
  ): Observable<Attachment[]> {
    const form = new FormData();

    files.forEach((file, index) => {
      form.append('files', file);
      if (fileNames && fileNames[index]) {
        form.append('fileName', fileNames[index]);
      }
    });

    form.append('conversationId', conversationId);
    form.append('uploadedBy', uploadedBy);

    return this.http.post<Attachment[]>(this.apiUrl, form);
  }

  getAttachments(conversationId: string): Observable<Attachment[]> {
    const params = new HttpParams().set('conversationId', conversationId);
    return this.http.get<Attachment[]>(this.apiUrl, { params });
  }

  getAttachmentById(attachmentId: string): Observable<Attachment> {
    return this.http.get<Attachment>(`${this.apiUrl}/${attachmentId}`);
  }

  deleteAttachment(attachmentId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${attachmentId}`);
  }

  getAttachmentsByType(conversationId: string, type: string): Observable<Attachment[]> {
    const params = new HttpParams()
      .set('conversationId', conversationId)
      .set('type', type);

    return this.http.get<Attachment[]>(`${this.apiUrl}/type`, { params });
  }

  getAttachmentsByUser(userId: string): Observable<Attachment[]> {
    return this.http.get<Attachment[]>(`${this.apiUrl}/user/${userId}`);
  }
}
