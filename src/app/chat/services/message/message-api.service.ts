import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Message } from '../../../shared/enums/models/message.model';
import { AuthService } from '../../../auth/services/auth.service';
import { DeleteType } from '../../../shared/enums/models/delete-type.enum';
import { Attachment } from '../../../shared/enums/models/attachment.model';

@Injectable({
  providedIn: 'root',
})
export class MessageApiService {
  private apiUrl = `${environment.apiUrl}/messages`;

  constructor(private http: HttpClient, private authService: AuthService) { }

  sendMessageViaHttp(message: Message): Observable<Message> {
    return this.http.post<Message>(`${this.apiUrl}`, message).pipe(
      catchError((error) => {
        console.error('HTTP API error:', error);
        return throwError(() => error);
      })
    );
  }

  getMessages(conversationId: string, page: number = 1, limit: number = 20): Observable<{ messages: Message[], total: number, page: number, totalPages: number }> {
    return this.http.get<{ messages: Message[], total: number, page: number, totalPages: number }>(`${this.apiUrl}`, {
      params: { conversationId, page, limit }
    });
  }

  editMessage(messageId: string, content: string): Observable<Message> {
    return this.http.put<Message>(`${this.apiUrl}/${messageId}`, { content })
  }

  deleteMessage(messageId: string, deleteType: DeleteType, userId?: string): Observable<void> {
    const body: any = { deleteType };
    if (userId) {
      body.userId = userId;
    }
    return this.http.patch<void>(`${this.apiUrl}/${messageId}/delete`, body);
  }

  sendMessage(conversationId: string, content: string, attachments?: Attachment[], parentMessageId?: string): Observable<Message> {
    const senderId = this.authService.getCurrentUserId() || '';
    const message: Partial<Message> = {
      conversationId,
      content,
      attachments,
      parentMessage: parentMessageId,
      senderId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return this.http.post<Message>(`${this.apiUrl}`, message).pipe(
      catchError((error) => {
        console.error('HTTP API error:', error);
        return throwError(() => error);
      })
    );
  }
}
