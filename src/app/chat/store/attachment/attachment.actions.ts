import { createAction, props } from '@ngrx/store';
import { Attachment } from '../../../shared/enums/models/attachment.model';


export const uploadMultipleAttachments = createAction(
  '[Attachment] Upload Multiple Attachments',
  props<{ files: File[]; conversationId: string; uploadedBy: string }>()
);

export const uploadMultipleAttachmentsSuccess = createAction(
  '[Attachment] Upload Multiple Attachments Success',
  props<{ attachments: Attachment[] }>()
);

export const uploadMultipleAttachmentsFailure = createAction(
  '[Attachment] Upload Multiple Attachments Failure',
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

export const loadAttachmentsByConversation = createAction(
  '[Attachment] Load Attachments By Conversation',
  props<{ conversationId: string }>()
);

export const loadAttachmentsByConversationSuccess = createAction(
  '[Attachment] Load Attachments By Conversation Success',
  props<{ attachments: Attachment[] }>()
);

export const loadAttachmentsByConversationFailure = createAction(
  '[Attachment] Load Attachments By Conversation Failure',
  props<{ error: string }>()
);

export const loadAttachmentsByUser = createAction(
  '[Attachment] Load Attachments By User',
  props<{ userId: string }>()
);

export const loadAttachmentsByUserSuccess = createAction(
  '[Attachment] Load Attachments By User Success',
  props<{ attachments: Attachment[] }>()
);

export const loadAttachmentsByUserFailure = createAction(
  '[Attachment] Load Attachments By User Failure',
  props<{ error: string }>()
);

export const loadAttachmentsByType = createAction(
  '[Attachment] Load Attachments By Type',
  props<{ conversationId: string; attachmentType: string }>()
);

export const loadAttachmentsByTypeSuccess = createAction(
  '[Attachment] Load Attachments By Type Success',
  props<{ attachments: Attachment[] }>()
);

export const loadAttachmentsByTypeFailure = createAction(
  '[Attachment] Load Attachments By Type Failure',
  props<{ error: string }>()
);

export const deleteAttachment = createAction(
  '[Attachment] Delete Attachment',
  props<{ attachmentId: string }>()
);

export const deleteAttachmentSuccess = createAction(
  '[Attachment] Delete Attachment Success',
  props<{ attachmentId: string }>()
);

export const deleteAttachmentFailure = createAction(
  '[Attachment] Delete Attachment Failure',
  props<{ error: string }>()
);
