export interface UserConversation {
  _id?: string;
  conversationId: string;
  userId: string;
  lastReadAt?: string;
  lastReadMessage?: string;
  isPinned?: boolean;
  isArchived?: boolean;
  isDeleted?: boolean;
  labels?: string[];
  createdAt?: string;
  updatedAt?: string;
}