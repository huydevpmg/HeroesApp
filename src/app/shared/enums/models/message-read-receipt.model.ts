export interface MessageReadReceipt {
  _id?: string;
  messageId: string;
  userId: string;
  conversationId: string;
  readAt: string;
  user?: {
    _id: string;
    username?: string;
    fullName?: string;
    email?: string;
    avatar?: string;
  };
}
