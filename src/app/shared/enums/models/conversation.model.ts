export interface Conversation {
  _id?: string;
  userConversationId?: string;
  name?: string;
  participants: string[];
  isGroup?: boolean;
  heroContext?: string[];
  createdBy?: string;
  lastMessage?: Message;
  avatar?: string;
  unreadCount?: number;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
  isArchived?: boolean;
  labels?: Label[];
}

import { Message } from './message.model';
import { Label } from './label.model';
