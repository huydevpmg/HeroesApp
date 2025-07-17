import { Injectable } from '@angular/core';
import { MessageReadReceiptApiService } from './message-read-receipt-api.service';
import { Observable } from 'rxjs';
import { MessageReadReceipt } from '../../../shared/enums/models/message-read-receipt.model';

@Injectable({
  providedIn: 'root'
})
export class MessageReadReceiptService {

  constructor(private api: MessageReadReceiptApiService) { }

  getMessageReadReceipts(messageId: string): Observable<MessageReadReceipt[]> {
    return this.api.getMessageReadReceipts(messageId);
  }

  getConversationReadReceipts(conversationId: string, messageIds: string[]): Observable<{ [messageId: string]: MessageReadReceipt[] }> {
    return this.api.getConversationReadReceipts(conversationId, messageIds);
  }

  markMessageAsRead(messageId: string, conversationId: string): Observable<any> {
    return this.api.markMessageAsRead(messageId, conversationId);
  }

  markMultipleMessagesAsRead(conversationId: string, messageIds: string[]): Observable<any> {
    return this.api.markMultipleMessagesAsRead(conversationId, messageIds);
  }

  // Mark all messages as read for current user in a conversation
  markAllMessagesAsRead(conversationId: string): Observable<any> {
    return this.api.markAllMessagesAsRead(conversationId);
  }
}
