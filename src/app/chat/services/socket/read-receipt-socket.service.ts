import { Injectable, inject } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { SocketCoreService } from './socket-core.service';
import { SOCKET_EVENTS } from './socket-events.constants';

@Injectable({
  providedIn: 'root'
})
export class ReadReceiptSocketService {
  private socketCore = inject(SocketCoreService);
  private readReceiptUpdatedSubject = new Subject<any>();

  constructor() {
    this.setupReadReceiptListeners();
  }

  private setupReadReceiptListeners(): void {
    this.socketCore.on(SOCKET_EVENTS.READ_RECEIPT_UPDATED, (data: any) => {
      this.readReceiptUpdatedSubject.next(data);
    });
  }

  // Emit read receipt event via socket(single message)
  markMessageAsReadBySocket(messageId: string, userId: string, conversationId: string): void {
    this.socketCore.emit(
      SOCKET_EVENTS.MESSAGE_READ,
      { messageId, userId, conversationId }
    );
  }

  // Emit read receipt event via socket(bulk messages)
  markMultipleMessagesAsReadBySocket(messageIds: string[], userId: string, conversationId: string): void {
    this.socketCore.emit(
      SOCKET_EVENTS.BULK_MESSAGE_READ,
      { messageIds, userId, conversationId }
    );
  }

  // Observable for read receipt updates
  onReadReceiptUpdated(): Observable<any> {
    return this.readReceiptUpdatedSubject.asObservable();
  }
}
