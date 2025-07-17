import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { MessageReadReceipt } from '../../../shared/enums/models/message-read-receipt.model';

@Injectable({
  providedIn: 'root'
})
export class MessageReadReceiptApiService {
  private baseUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) { }

  // Get read receipts for a single message
  getMessageReadReceipts(messageId: string): Observable<MessageReadReceipt[]> {
    return this.http.get<any>(`${this.baseUrl}/messages/${messageId}/read-receipts`)
      .pipe(map((response: any) => response.data));
  }

  // Get read receipts for multiple messages in a conversation
  getConversationReadReceipts(conversationId: string, messageIds: string[]): Observable<{ [messageId: string]: MessageReadReceipt[] }> {
    const params = messageIds && messageIds.length
      ? `?messageIds=${messageIds.join(',')}`
      : '';
    return this.http.get<any>(`${this.baseUrl}/conversations/${conversationId}/read-receipts${params}`)
      .pipe(map((response: any) => response.data));
  }

  // Mark a single message as read
  markMessageAsRead(messageId: string, conversationId: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/messages/${messageId}/read`, { conversationId })
      .pipe(map((response: any) => response.data));
  }

  // Mark multiple messages as read in a conversation
  markMultipleMessagesAsRead(conversationId: string, messageIds: string[]): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/conversations/${conversationId}/read`, { messageIds })
      .pipe(map((response: any) => response.data));
  }

  // Mark all messages as read for current user in a conversation
  markAllMessagesAsRead(conversationId: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/conversations/${conversationId}/read-all`, {})
      .pipe(map((response: any) => response.data));
  }
}
