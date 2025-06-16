export interface Reaction {
  userId: string;
  emoji: string;
}

export interface Message {
  _id?: string;
  content: string;
  senderId: string;
  conversationId: string;
  status?: 'SENT' | 'DELIVERED' | 'READ';
  parentMessage?: string;
  heroContext?: string[];
  attachments?: string[];
  reactions?: Reaction[];
  isDeleteGlobal?: boolean;
  deletedForUserIds?: string[];
  createdAt?: string;
  updatedAt?: string;
}