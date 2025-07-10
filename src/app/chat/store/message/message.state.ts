import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { Message } from '../../../shared/enums/models/message.model';


// State for managing Messages
export interface MessageState extends EntityState<Message> {
  loading: boolean;
  error: string | null;
  page: number;
  total: number;
  totalPages: number;
}

export const messageAdapter: EntityAdapter<Message> = createEntityAdapter<Message>({
  selectId: (entity) => entity._id!,
});

export const initialMessageState: MessageState = messageAdapter.getInitialState({
  loading: false,
  error: null,
  page: 1,
  total: 0,
  totalPages: 1,
});
