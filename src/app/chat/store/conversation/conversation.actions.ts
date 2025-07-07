import { createAction, props } from '@ngrx/store';
import { Conversation } from '../../../shared/enums/models/conversation.model';

// Load Conversations
export const loadConversations = createAction(
  '[Conversation] Load Conversations'
);

export const loadConversationsSuccess = createAction(
  '[Conversation] Load Conversations Success',
  props<{ conversations: Conversation[] }>()
);

export const loadConversationsFailure = createAction(
  '[Conversation] Load Conversations Failure',
  props<{ error: string }>()
);

// Load Single Conversation
export const loadConversation = createAction(
  '[Conversation] Load Conversation',
  props<{ id: string }>()
);

export const loadConversationSuccess = createAction(
  '[Conversation] Load Conversation Success',
  props<{ conversation: Conversation }>()
);

export const loadConversationFailure = createAction(
  '[Conversation] Load Conversation Failure',
  props<{ error: string }>()
);

// Create 1on1 Conversation
export const findOrCreate1on1Conversation = createAction(
  '[Conversation] Find Or Create 1on1 Conversation',
  props<{ participantId: string }>()
);

export const findOrCreate1on1ConversationSuccess = createAction(
  '[Conversation] Find Or Create 1on1 Conversation Success',
  props<{ conversation: Conversation }>()
);

export const findOrCreate1on1ConversationFailure = createAction(
  '[Conversation] Find Or Create 1on1 Conversation Failure',
  props<{ error: string }>()
);

// Create Group Conversation
export const createConversation = createAction(
  '[Conversation] Create Conversation',
  props<{ data: Partial<Conversation> }>()
);

export const createConversationSuccess = createAction(
  '[Conversation] Create Conversation Success',
  props<{ conversation: Conversation }>()
);

export const createConversationFailure = createAction(
  '[Conversation] Create Conversation Failure',
  props<{ error: string }>()
);

// Update Conversation
export const updateConversation = createAction(
  '[Conversation] Update Conversation',
  props<{ id: string; data: Partial<Conversation> }>()
);

export const updateConversationSuccess = createAction(
  '[Conversation] Update Conversation Success',
  props<{ conversation: Conversation }>()
);

export const updateConversationFailure = createAction(
  '[Conversation] Update Conversation Failure',
  props<{ error: string }>()
);

// Update Last Message
export const updateConversationLastMessage = createAction(
  '[Conversation] Update Last Message',
  props<{ conversationId: string; message: any }>()
);

// Select Conversation
export const selectConversation = createAction(
  '[Conversation] Select Conversation',
  props<{ id: string | null }>()
);


// Typing & status
export const userStartedTyping = createAction(
  '[Conversation] User Started Typing',
  props<{ userId: string }>()
);
export const userStoppedTyping = createAction(
  '[Conversation] User Stopped Typing',
  props<{ userId: string }>()
);
export const userWentOnline = createAction(
  '[Conversation] User Online',
  props<{ userId: string }>()
);
export const userWentOffline = createAction(
  '[Conversation] User Offline',
  props<{ userId: string }>()
);

// Conversation update
export const conversationUpdated = createAction(
  '[Conversation] Conversation Updated',
  props<{ conversationId: string; updateType: string; data: any }>()
);

export const setTypingUsers = createAction(
  '[Conversation] Set Typing Users',
  props<{ typingUsers: string[] }>()
);

export const updateOnlineUsers = createAction(
  '[Conversation] Update Online Users',
  props<{ onlineUsers: string[] }>()
);

export const setOnlineUsers = createAction(
  '[Conversation] Set Online Users',
  props<{ onlineUsers: any[] }>()
);



//Get All Users
export const getAllUsers = createAction(
  '[Conversation] Get All Users'
);

export const getAllUsersSuccess = createAction(
  '[Conversation] Get All Users Success',
  props<{ users: any[] }>()
);

export const getAllUsersFailure = createAction(
  '[Conversation] Get All Users Failure',
  props<{ error: string }>()
);

export const updateLastAttachmentName = createAction(
  '[Conversation] Update Last Attachment Name',
  props<{ conversationId: string; lastAttachmentName: string }>()
);

// Add Members to Group
export const addMembersToGroup = createAction(
  '[Conversation] Add Members to Group',
  props<{ conversationId: string; memberIds: string[] }>()
);

export const addMembersToGroupSuccess = createAction(
  '[Conversation] Add Members to Group Success',
  props<{ conversation: Conversation }>()
);

export const addMembersToGroupFailure = createAction(
  '[Conversation] Add Members to Group Failure',
  props<{ error: string }>()
);

// Remove Member from Group
export const removeMemberFromGroup = createAction(
  '[Conversation] Remove Member from Group',
  props<{ conversationId: string; userId: string }>()
);

export const removeMemberFromGroupSuccess = createAction(
  '[Conversation] Remove Member from Group Success',
  props<{ conversation: Conversation }>()
);

export const removeMemberFromGroupFailure = createAction(
  '[Conversation] Remove Member from Group Failure',
  props<{ error: string }>()
);

// Leave Group
export const leaveGroup = createAction(
  '[Conversation] Leave Group',
  props<{ conversationId: string }>()
);
export const leaveGroupSuccess = createAction(
  '[Conversation] Leave Group Success',
  props<{ conversationId: string }>()
);
export const leaveGroupFailure = createAction(
  '[Conversation] Leave Group Failure',
  props<{ error: string }>()
);

export const removeUserFromConversation = createAction(
  '[Conversation] Remove User From Conversation',
  props<{ conversationId: string; userId: string }>()
);
