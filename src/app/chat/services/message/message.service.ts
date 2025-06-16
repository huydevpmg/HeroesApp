import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, of, catchError, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Message } from '../../models/message.model';
import { SocketService } from '../socket/socket.service';
import { AuthService } from '../../../auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private apiUrl = `${environment.apiUrl}/messages`;

  constructor(
    private http: HttpClient,
    private socketService: SocketService,
    private authService: AuthService
  ) { }

  // Send new message - try socket first, fallback to HTTP API
  sendMessage(conversationId: string, content: string): Observable<Message> {
    const currentUserId = this.authService.getCurrentUserId();
    if (!currentUserId) {
      throw new Error('User not authenticated');
    }

    const message: Partial<Message> = {
      conversationId,
      content,
      senderId: currentUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Create Observable from socket Promise
    return new Observable<Message>(observer => {
      this.socketService.sendMessage(message as Message)
        .then(response => {
          if (response && response.success) {
            console.log('Message sent successfully via socket:', response.message);
            observer.next(response.message);
            observer.complete();
          } else {
            console.warn('Socket message failed, falling back to HTTP API');
            // Fallback method to send message via HTTP API
            this.sendMessageViaHttp(message as Message).subscribe({
              next: (httpResponse) => {
                console.log('Message sent successfully via HTTP:', httpResponse);
                observer.next(httpResponse);
                observer.complete();
              },
              error: (httpError) => {
                console.error('Failed to send message via both socket and HTTP:', httpError);
                observer.error(httpError);
              }
            });
          }
        })
        .catch(error => {
          console.error('Error sending message via socket:', error);
          console.warn('Socket error, falling back to HTTP API');
          // Fallback method to send message via HTTP API
          this.sendMessageViaHttp(message as Message).subscribe({
            next: (httpResponse) => {
              console.log('Message sent successfully via HTTP:', httpResponse);
              observer.next(httpResponse);
              observer.complete();
            },
            error: (httpError) => {
              console.error('Failed to send message via both socket and HTTP:', httpError);
              observer.error(httpError);
            }
          });
        });
    });
  }

  // Fallback method to send message via HTTP API
  private sendMessageViaHttp(message: Message): Observable<Message> {
    const token = this.authService.getAccessToken();
    if (!token) {
      return throwError(() => new Error('User not authenticated'));
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    console.log('Sending message via HTTP API:', message);
    return this.http.post<Message>(`${this.apiUrl}`, message, { headers })
      .pipe(
        tap(response => console.log('HTTP API response:', response)),
        catchError(error => {
          console.error('HTTP API error:', error);
          return throwError(() => error);
        })
      );
  }

  getMessages(conversationId: string): Observable<Message[]> {
    const token = this.authService.getAccessToken();

    return this.http.get<Message[]>(`${this.apiUrl}`, {
      params: { conversationId },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).pipe(
      tap(messages => {
        console.log('Received messages:', messages);
      })
    );
  }

  updateMessageStatus(messageId: string, status: string): Observable<Message> {
    return this.http.put<Message>(`${this.apiUrl}/${messageId}/status`, { status });
  }

  // Delete message
  deleteMessage(messageId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${messageId}`);
  }

  // Add reaction to message - socket only
  addReaction(messageId: string, emoji: string): Observable<Message> {
    return new Observable<Message>(observer => {
      this.socketService.addReaction(messageId, emoji)
        .then(response => {
          if (response && response.success) {
            observer.next(response.message);
            observer.complete();
          } else {
            observer.error(new Error('Failed to add reaction via socket'));
          }
        })
        .catch(error => {
          console.error('Error adding reaction via socket:', error);
          observer.error(error);
        });
    });
  }

  // Remove reaction from message - socket only
  removeReaction(messageId: string): Observable<Message> {
    return new Observable<Message>(observer => {
      this.socketService.removeReaction(messageId)
        .then(response => {
          if (response && response.success) {
            observer.next(response.message);
            observer.complete();
          } else {
            observer.error(new Error('Failed to remove reaction via socket'));
          }
        })
        .catch(error => {
          console.error('Error removing reaction via socket:', error);
          observer.error(error);
        });
    });
  }
}
