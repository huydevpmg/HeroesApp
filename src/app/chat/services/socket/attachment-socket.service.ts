import { Injectable, inject } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { SocketCoreService } from './socket-core.service';
import { SOCKET_EVENTS } from './socket-events.constants';

@Injectable({
  providedIn: 'root'
})
export class AttachmentSocketService {
  private socketCore = inject(SocketCoreService);

  private attachmentCreatedSubject = new Subject<{ attachment: any; conversationId: string }>();
  private attachmentDeletedSubject = new Subject<{ attachmentId: string; conversationId: string }>();

  constructor() {
    this.setupAttachmentListeners();
  }

  private setupAttachmentListeners(): void {
    // Attachment created
    this.socketCore.on(SOCKET_EVENTS.ATTACHMENT_CREATED, (data: { attachment: any; conversationId: string }) => {
      console.log('Attachment created:', data);
      this.attachmentCreatedSubject.next(data);
    });

    // Attachment deleted
    this.socketCore.on(SOCKET_EVENTS.ATTACHMENT_DELETED, (data: { attachmentId: string; conversationId: string }) => {
      console.log('Attachment deleted:', data);
      this.attachmentDeletedSubject.next(data);
    });
  }

  // Emit attachment created (if needed)
  emitAttachmentCreated(attachment: any, conversationId: string): void {
    console.log('Emitting attachment created:', { attachment, conversationId });
    this.socketCore.emit(SOCKET_EVENTS.ATTACHMENT_CREATED, { attachment, conversationId });
  }

  // Emit attachment deleted (if needed)
  emitAttachmentDeleted(attachmentId: string, conversationId: string): void {
    console.log('Emitting attachment deleted:', { attachmentId, conversationId });
    this.socketCore.emit(SOCKET_EVENTS.ATTACHMENT_DELETED, { attachmentId, conversationId });
  }

  // Observables
  onAttachmentCreated(): Observable<{ attachment: any; conversationId: string }> {
    return this.attachmentCreatedSubject.asObservable();
  }

  onAttachmentDeleted(): Observable<{ attachmentId: string; conversationId: string }> {
    return this.attachmentDeletedSubject.asObservable();
  }

  // Combined observable for both create/delete events
  onAttachmentChange(): Observable<{
    attachment?: any;
    attachmentId?: string;
    conversationId: string;
    action: 'created' | 'deleted'
  }> {
    return new Observable(subscriber => {
      const createdSub = this.onAttachmentCreated().subscribe(data =>
        subscriber.next({ ...data, action: 'created' })
      );

      const deletedSub = this.onAttachmentDeleted().subscribe(data =>
        subscriber.next({ ...data, action: 'deleted' })
      );

      return () => {
        createdSub.unsubscribe();
        deletedSub.unsubscribe();
      };
    });
  }
}
