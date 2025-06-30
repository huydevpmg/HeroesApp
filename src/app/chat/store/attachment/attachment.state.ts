import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { Attachment } from '../../../shared/enums/models/message.model';

export interface AttachmentState extends EntityState<Attachment> {
  loading: boolean;
  error: string | null;
}

export const attachmentAdapter: EntityAdapter<Attachment> = createEntityAdapter<Attachment>({
  selectId: (entity) => entity._id!,
});

export const initialAttachmentState: AttachmentState = attachmentAdapter.getInitialState({
  loading: false,
  error: null,
});
