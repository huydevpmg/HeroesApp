import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { SocketCoreService } from './socket-core.service';
import { MessageSocketService } from './message-socket.service';
import { ConversationSocketService } from './conversation-socket.service';
import { PresenceSocketService } from './status-socket.service';
import { AttachmentSocketService } from './attachment-socket.service';
import { Message } from '../../../shared/enums/models/message.model';
import { Conversation } from '../../../shared/enums/models/conversation.model';
import { DeleteType } from '../../../shared/enums/models/delete-type.enum';
import { SOCKET_EVENTS } from './socket-events.constants';
import { Attachment } from '../../../shared/enums/models/attachment.model';
@Injectable({
  providedIn: 'root'
})
export class SocketService {
  // Inject all socket services
  private socketCore = inject(SocketCoreService);
  private messageSocket = inject(MessageSocketService);
  private conversationSocket = inject(ConversationSocketService);
  private presenceSocket = inject(PresenceSocketService);
  private attachmentSocket = inject(AttachmentSocketService);

  // === CONNECTION METHODS ===
  get connected(): boolean {
    return this.socketCore.connected;
  }

  // Async version
  isConnected(): Observable<boolean> {
    return this.socketCore.isConnected();
  }

  connect(): void {
    this.socketCore.connect();
  }

  disconnect(): void {
    this.socketCore.disconnect();
  }

  // === MESSAGE METHODS ===
  // sendMessage(message: Message): Promise<{ success: boolean; message: Message }> {
  //   return this.messageSocket.sendMessage(message);
  // }

  editMessage(messageId: string, content: string): Promise<{ success: boolean; message: Message }> {
    return this.messageSocket.editMessage(messageId, content);
  }

  deleteMessage(messageId: string, deleteType: DeleteType): Promise<{ success: boolean; message: string }> {
    return this.messageSocket.deleteMessage(messageId, deleteType);
  }

  startTyping(conversationId: string): void {
    this.messageSocket.startTyping(conversationId);
  }

  stopTyping(conversationId: string): void {
    this.messageSocket.stopTyping(conversationId);
  }


  // === CONVERSATION METHODS ===
  joinConversation(conversationId: string): void {
    this.conversationSocket.joinConversation(conversationId);
  }

  // === PRESENCE METHODS ===
  isUserOnline(userId: string): boolean {
    return this.presenceSocket.isUserOnline(userId);
  }

  getOnlineUsers(): Set<string> {
    return this.presenceSocket.getOnlineUsers();
  }

  getOnlineUsersCount(): number {
    return this.presenceSocket.getOnlineUsersCount();
  }

  areUsersOnline(userIds: string[]): { [userId: string]: boolean } {
    return this.presenceSocket.areUsersOnline(userIds);
  }

  // === ATTACHMENT METHODS ===
  emitAttachmentCreated(attachment: Attachment, conversationId: string): void {
    this.attachmentSocket.emitAttachmentCreated(attachment, conversationId);
  }

  emitAttachmentDeleted(attachmentId: string, conversationId: string): void {
    this.attachmentSocket.emitAttachmentDeleted(attachmentId, conversationId);
  }

  emitMessageDeletedGlobal(messageId: string) {
    this.socketCore.emit(SOCKET_EVENTS.MESSAGE_DELETED_GLOBAL, { messageId });
  }

  // === OBSERVABLE METHODS ===

  // Message observables
  onMessage(): Observable<Message> {
    return this.messageSocket.onMessage();
  }

  onMessageUpdated(): Observable<Message> {
    return this.messageSocket.onMessageUpdated();
  }

  onMessageDeletedGlobal(): Observable<{ messageId: string; conversationId: string }> {
    return this.messageSocket.onMessageDeletedGlobal();
  }

  onMessageDeletedPersonal(): Observable<{ messageId: string; userId: string; conversationId: string }> {
    return this.messageSocket.onMessageDeletedPersonal();
  }

  onTyping(): Observable<{ userId: string; isTyping: boolean }> {
    return this.messageSocket.onTyping();
  }

  // Conversation observables
  onGroupCreated(): Observable<Conversation> {
    return this.conversationSocket.onGroupCreated();
  }

  onConversationUpdated(): Observable<{ conversationId: string; type: 'pin' | 'archive' | 'label'; data: any }> {
    return this.conversationSocket.onConversationUpdated();
  }

  onUserJoined(): Observable<{ userId: string; conversationId: string }> {
    return this.conversationSocket.onUserJoined();
  }

  onMemberAdded(): Observable<{ conversationId: string; addedMembers: string[]; conversation: Conversation; systemMessage: any }> {
    return this.conversationSocket.onMemberAdded();
  }

  onMemberRemoved(): Observable<{ conversationId: string; removedUserId: string; conversation: Conversation; systemMessage: any }> {
    return this.conversationSocket.onMemberRemoved();
  }

  onLeaveGroup(): Observable<{ conversationId: string; userId: string }> {
    return this.conversationSocket.onLeaveGroup();
  }

  // Presence observables
  onOnlineStatus(): Observable<{ userId: string; status: 'online' | 'offline' }> {
    return this.presenceSocket.onOnlineStatus();
  }

  onOnlineUserIds(): Observable<Set<string>> {
    return this.presenceSocket.onOnlineUserIds();
  }

  getCurrentOnlineUsers(): Observable<Set<string>> {
    return this.presenceSocket.getCurrentOnlineUsers();
  }

  // Attachment observables
  onAttachmentCreated(): Observable<{ attachment: Attachment; conversationId: string }> {
    return this.attachmentSocket.onAttachmentCreated();
  }

  onAttachmentDeleted(): Observable<{ attachmentId: string; conversationId: string }> {
    return this.attachmentSocket.onAttachmentDeleted();
  }

  onAttachmentChange(): Observable<{
    attachment?: Attachment;
    attachmentId?: string;
    conversationId: string;
    action: 'created' | 'deleted'
  }> {
    return this.attachmentSocket.onAttachmentChange();
  }
}
