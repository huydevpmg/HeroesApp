import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { Message } from '../../../shared/enums/models/message.model';


// State for managing Messages
export interface MessageState extends EntityState<Message> {
  loading: boolean;
  error: string | null;
}

export const messageAdapter: EntityAdapter<Message> = createEntityAdapter<Message>({
  selectId: (entity) => entity._id!,
});

export const initialMessageState: MessageState = messageAdapter.getInitialState({
  loading: false,
  error: null,
});
