import { Message } from "./message.model";

export interface ReplyingToMessage extends Message {
  senderName: string;
}
