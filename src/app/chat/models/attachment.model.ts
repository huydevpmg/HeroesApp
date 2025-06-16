export interface Attachment {
  _id?: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedBy?: string;
  conversationId?: string;
  createdAt?: string;
  updatedAt?: string;
}
