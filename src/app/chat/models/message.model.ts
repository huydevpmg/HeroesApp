export interface Reaction {
  userId: string;
  emoji: string;
}


export interface Attachment {
  _id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedBy: string;
  conversationId: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface Message {
  _id?: string;
  content: string;
  senderId: string;
  conversationId: string;
  status?: 'SENT' | 'DELIVERED' | 'READ';
  parentMessage?: string;
  heroContext?: string[];
  attachmentId?: string;
  reactions?: Reaction[];
  isDeleteGlobal?: boolean;
  deletedForUserIds?: string[];
  createdAt?: string;
  updatedAt?: string;
}

