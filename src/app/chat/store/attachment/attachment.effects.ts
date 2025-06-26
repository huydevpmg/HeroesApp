import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of, forkJoin } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import * as AttachmentActions from './attachment.actions';
import * as MessageActions from '../message/message.actions';
import * as ConversationActions from '../conversation/conversation.actions';
import { Attachment } from '../../models/message.model';
import { AttachmentService } from '../../services/attachments/attachment.service';
import { ConversationService } from '../../services/conversation/conversation.service';

@Injectable()
export class AttachmentEffects {
  uploadAttachment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AttachmentActions.uploadAttachment),
      mergeMap(({ file, content, conversationId, uploadedBy, fileName }) =>
        this.attachmentService.uploadAttachment(file, content, conversationId, uploadedBy, fileName).pipe(
          map((attachment: Attachment) => AttachmentActions.uploadAttachmentSuccess({ attachment, content, fileName })),
          catchError(error => {
            return of(AttachmentActions.uploadAttachmentFailure({ error: error.message || 'Upload failed' }));
          })
        )
      )
    )
  );

  loadAttachment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AttachmentActions.loadAttachment),
      mergeMap(({ attachmentId }) =>
        this.attachmentService.getAttachmentById(attachmentId).pipe(
          map((attachment: Attachment) => AttachmentActions.loadAttachmentSuccess({ attachment })),
          catchError(error => of(AttachmentActions.loadAttachmentFailure({ error: error.message || 'Load failed' })))
        )
      )
    )
  );

  uploadAttachmentSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AttachmentActions.uploadAttachmentSuccess),
      mergeMap(({ attachment, content, fileName }) => {
        if (content && content.trim()) {
          return [MessageActions.sendMessage({
            conversationId: attachment.conversationId,
            content: content,
            attachmentId: attachment._id
          })];
        }

        if (fileName && !content?.trim()) {
          return [
            MessageActions.sendMessage({
              conversationId: attachment.conversationId,
              content: '',
              attachmentId: attachment._id,
              fileName: fileName
            }),
            ConversationActions.updateConversationLastAttachmentName({
              conversationId: attachment.conversationId,
              lastAttachmentName: fileName
            })
          ];
        }

        return [MessageActions.sendMessage({
          conversationId: attachment.conversationId,
          content: '',
          attachmentId: attachment._id
        })];
      })
    )
  );

  updateLastAttachmentName$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ConversationActions.updateConversationLastAttachmentName),
      mergeMap(({ conversationId, lastAttachmentName }) =>
        this.conversationService.updateLastAttachmentName(conversationId, lastAttachmentName).pipe(
          map(() => ({ type: '[Conversation] Update Last Attachment Name Success' })),
          catchError(() => of({ type: '[Conversation] Update Last Attachment Name Failure' }))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private attachmentService: AttachmentService,
    private conversationService: ConversationService
  ) { }
}
