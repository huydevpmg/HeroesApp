import { createAction, props } from '@ngrx/store';
import { Attachment } from '../../models/message.model';

export const uploadAttachment = createAction(
  '[Attachment] Upload Attachment',
  props<{ file: File; content: string; conversationId: string; uploadedBy: string; fileName?: string }>()
);

export const uploadAttachmentSuccess = createAction(
  '[Attachment] Upload Attachment Success',
  props<{ attachment: Attachment; content: string; fileName?: string }>()
);

export const uploadAttachmentFailure = createAction(
  '[Attachment] Upload Attachment Failure',
  props<{ error: string }>()
);

export const loadAttachment = createAction(
  '[Attachment] Load Attachment',
  props<{ attachmentId: string }>()
);

export const loadAttachmentSuccess = createAction(
  '[Attachment] Load Attachment Success',
  props<{ attachment: Attachment }>()
);

export const loadAttachmentFailure = createAction(
  '[Attachment] Load Attachment Failure',
  props<{ error: string }>()
);
