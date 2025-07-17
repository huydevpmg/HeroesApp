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
      if (data.type === 'bulk' && Array.isArray(data.receipts)) {
        data.receipts.forEach((receipt: any) => {
         this.readReceiptUpdatedSubject.next(receipt);
        });
      } else if (data.messageId) {
        this.readReceiptUpdatedSubject.next(data);
      }
      // this.readReceiptUpdatedSubject.next(data);
    });
  }

  // Observable for read receipt updates
  onReadReceiptUpdated(): Observable<any> {
    return this.readReceiptUpdatedSubject.asObservable();
  }
}
