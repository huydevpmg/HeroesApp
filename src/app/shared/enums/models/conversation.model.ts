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
  lastAttachmentName?: string;
  isDeleted?: boolean;
  isArchived?: boolean;
}

import { Message } from './message.model';
