export interface Conversation {
  _id?: string;
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
}

import { Message } from './message.model';
