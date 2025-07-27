import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as AttachmentActions from './attachment.actions';
import { catchError, map, mergeMap, of } from 'rxjs';
import { AttachmentApiService } from '../../services/attachments/attachment-api.service';

@Injectable()
export class AttachmentEffects {
  constructor(
    private actions$: Actions,
    private attachmentApiService: AttachmentApiService
  ) { }


  /** Load attachment by ID */
  loadAttachment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AttachmentActions.loadAttachment),
      mergeMap(({ attachmentId }) =>
        this.attachmentApiService.getAttachmentById(attachmentId).pipe(
          map((attachment) => AttachmentActions.loadAttachmentSuccess({ attachment })),
          catchError((error) =>
            of(AttachmentActions.loadAttachmentFailure({ error: error.message }))
          )
        )
      )
    )
  );

  /** Load attachments by conversation */
  loadAttachmentsByConversation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AttachmentActions.loadAttachmentsByConversation),
      mergeMap(({ conversationId }) =>
        this.attachmentApiService.getAttachments(conversationId).pipe(
          map((attachments) =>
            AttachmentActions.loadAttachmentsByConversationSuccess({ attachments })
          ),
          catchError((error) =>
            of(AttachmentActions.loadAttachmentsByConversationFailure({ error: error.message }))
          )
        )
      )
    )
  );

  /** Load attachments by user */
  loadAttachmentsByUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AttachmentActions.loadAttachmentsByUser),
      mergeMap(({ userId }) =>
        this.attachmentApiService.getAttachmentsByUser(userId).pipe(
          map((attachments) =>
            AttachmentActions.loadAttachmentsByUserSuccess({ attachments })
          ),
          catchError((error) =>
            of(AttachmentActions.loadAttachmentsByUserFailure({ error: error.message }))
          )
        )
      )
    )
  );

  /** Load attachments by type */
  loadAttachmentsByType$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AttachmentActions.loadAttachmentsByType),
      mergeMap(({ conversationId, attachmentType }) =>
        this.attachmentApiService.getAttachmentsByType(conversationId, attachmentType).pipe(
          map((attachments) =>
            AttachmentActions.loadAttachmentsByTypeSuccess({ attachments })
          ),
          catchError((error) =>
            of(AttachmentActions.loadAttachmentsByTypeFailure({ error: error.message }))
          )
        )
      )
    )
  );

  /** Delete attachment */
  deleteAttachment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AttachmentActions.deleteAttachment),
      mergeMap(({ attachmentId }) =>
        this.attachmentApiService.deleteAttachment(attachmentId).pipe(
          map(() =>
            AttachmentActions.deleteAttachmentSuccess({ attachmentId })
          ),
          catchError((error) =>
            of(AttachmentActions.deleteAttachmentFailure({ error: error.message }))
          )
        )
      )
    )
  );
}
