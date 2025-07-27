import { AttachmentApiService } from './attachment-api.service';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import * as AttachmentActions from '../../store/attachment/attachment.actions';
import { Observable } from 'rxjs';
import { Attachment } from '../../../shared/enums/models/attachment.model';
import {selectAttachmentById, selectAllAttachments } from '../../store/attachment/attachment.selectors';

@Injectable({
  providedIn: 'root'
})
export class AttachmentService {
  constructor(private store: Store, private attachmentApiService: AttachmentApiService) { }

  uploadMultipleAttachments(files: File[], conversationId: string, uploadedBy: string): Observable<any[]> {
    return this.attachmentApiService.uploadAttachments(files, conversationId, uploadedBy);
  }


  getAttachmentById(attachmentId: string): Observable<Attachment | undefined> {
    this.store.dispatch(
      AttachmentActions.loadAttachment({ attachmentId })
    );
    return this.store.select(selectAttachmentById(attachmentId));
  }

  loadAttachmentsByConversation(conversationId: string): void {
    this.store.dispatch(
      AttachmentActions.loadAttachmentsByConversation({ conversationId })
    );
  }

  loadAttachmentsByUser(userId: string): void {
    this.store.dispatch(
      AttachmentActions.loadAttachmentsByUser({ userId })
    );
  }

  loadAttachmentsByType(conversationId: string, attachmentType: string): void {
    this.store.dispatch(
      AttachmentActions.loadAttachmentsByType({ conversationId, attachmentType })
    );
  }

  deleteAttachment(attachmentId: string): void {
    this.store.dispatch(
      AttachmentActions.deleteAttachment({ attachmentId })
    );
  }

  getAllAttachments(): Observable<Attachment[]> {
    return this.store.select(selectAllAttachments);
  }
}
