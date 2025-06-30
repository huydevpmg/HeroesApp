import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Message } from '../../../shared/enums/models/message.model';
import { AuthService } from '../../../auth/services/auth.service';
import { DeleteType } from '../../../shared/enums/models/delete-type.enum';

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

  getMessages(conversationId: string): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}`, {
      params: { conversationId },
    });
  }

  updateMessageStatus(messageId: string, status: string): Observable<Message> {
    return this.http.put<Message>(`${this.apiUrl}/${messageId}/status`, { status });
  }

  deleteMessage(messageId: string, deleteType: DeleteType, userId?: string): Observable<void> {
    const body: any = { deleteType };
    if (userId) {
      body.userId = userId;
    }
    return this.http.patch<void>(`${this.apiUrl}/${messageId}/delete`, body);
  }

  addReaction(messageId: string, emoji: string): Observable<Message> {
    // TODO: Replace with real API call if available
    return of({} as Message); // Temporary stub to satisfy type
  }

  removeReaction(messageId: string): Observable<Message> {
    // TODO: Replace with real API call if available
    return of({} as Message); // Temporary stub to satisfy type
  }

  sendMessage(conversationId: string, content: string, attachmentId?: string): Observable<Message> {
    const senderId = this.authService.getCurrentUserId() || '';
    const message: Partial<Message> = {
      conversationId,
      content,
      attachmentId,
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
