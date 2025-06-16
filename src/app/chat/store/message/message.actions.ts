import { createAction, props } from '@ngrx/store';
import { Message } from '../../models/message.model';

// Load messages
export const loadMessages = createAction(
  '[Message] Load Messages',
  props<{ conversationId: string }>()
);
export const loadMessagesSuccess = createAction(
  '[Message] Load Messages Success',
  props<{ messages: Message[] }>()
);
export const loadMessagesFailure = createAction(
  '[Message] Load Messages Failure',
  props<{ error: string }>()
);

// Send message
export const sendMessage = createAction(
  '[Message] Send Message',
  props<{ conversationId: string; content: string }>()
);
export const sendMessageSuccess = createAction(
  '[Message] Send Message Success',
  props<{ message: Message }>()
);
export const sendMessageFailure = createAction(
  '[Message] Send Message Failure',
  props<{ error: string }>()
);

// Delete message
export const deleteMessage = createAction(
  '[Message] Delete Message',
  props<{ messageId: string }>()
);
export const deleteMessageSuccess = createAction(
  '[Message] Delete Message Success',
  props<{ messageId: string }>()
);
export const deleteMessageFailure = createAction(
  '[Message] Delete Message Failure',
  props<{ error: string }>()
);

// Update message status
export const updateMessageStatus = createAction(
  '[Message] Update Message Status',
  props<{ messageId: string; status: string }>()
);
export const updateMessageStatusSuccess = createAction(
  '[Message] Update Message Status Success',
  props<{ message: Message }>()
);
export const updateMessageStatusFailure = createAction(
  '[Message] Update Message Status Failure',
  props<{ error: string }>()
);

// Add reaction
export const addReaction = createAction(
  '[Message] Add Reaction',
  props<{ messageId: string; emoji: string }>()
);
export const addReactionSuccess = createAction(
  '[Message] Add Reaction Success',
  props<{ message: Message }>()
);
export const addReactionFailure = createAction(
  '[Message] Add Reaction Failure',
  props<{ error: string }>()
);

// Remove reaction
export const removeReaction = createAction(
  '[Message] Remove Reaction',
  props<{ messageId: string }>()
);
export const removeReactionSuccess = createAction(
  '[Message] Remove Reaction Success',
  props<{ message: Message }>()
);
export const removeReactionFailure = createAction(
  '[Message] Remove Reaction Failure',
  props<{ error: string }>()
);

// Socket events
export const receiveMessage = createAction(
  '[Message] Receive Message',
  props<{ message: Message }>()
);
export const messageReactionAdded = createAction(
  '[Message] Reaction Added',
  props<{ messageId: string; userId: string; emoji: string }>()
);
export const messageReactionRemoved = createAction(
  '[Message] Reaction Removed',
  props<{ messageId: string; userId: string }>()
);

// Typing & status
export const userStartedTyping = createAction(
  '[Message] User Started Typing',
  props<{ userId: string }>()
);
export const userStoppedTyping = createAction(
  '[Message] User Stopped Typing',
  props<{ userId: string }>()
);
export const userWentOnline = createAction(
  '[Message] User Online',
  props<{ userId: string }>()
);
export const userWentOffline = createAction(
  '[Message] User Offline',
  props<{ userId: string }>()
);

// Conversation update
export const conversationUpdated = createAction(
  '[Message] Conversation Updated',
  props<{ conversationId: string; updateType: string; data: any }>()
);

export const setTypingUsers = createAction(
  '[Message] Set Typing Users',
  props<{ typingUsers: string[] }>()
);

export const setOnlineUsers = createAction(
  '[Message] Set Online Users',
  props<{ onlineUsers: string[] }>()
);
