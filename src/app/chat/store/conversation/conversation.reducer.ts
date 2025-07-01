import { createReducer, on } from '@ngrx/store';
import * as ConversationActions from './conversation.actions';
import {
  conversationAdapter,
  initialConversationState,
} from './conversation.state';

export const conversationReducer = createReducer(
  initialConversationState,

  // Load all
  on(ConversationActions.loadConversations, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ConversationActions.loadConversationsSuccess, (state, { conversations }) =>
    conversationAdapter.setAll(conversations, {
      ...state,
      loading: false,
      error: null,
    })
  ),
  on(ConversationActions.loadConversationsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Load single
  on(ConversationActions.loadConversation, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ConversationActions.loadConversationSuccess, (state, { conversation }) => {
    const newState = conversationAdapter.upsertOne(conversation, {
      ...state,
      loading: false,
      error: null,
    });
    // Sắp xếp lại conversations theo thời gian cập nhật
    const all = conversationAdapter.getSelectors().selectAll(newState);
    const sorted = [...all].sort((a, b) => new Date(b.updatedAt || '').getTime() - new Date(a.updatedAt || '').getTime());
    return conversationAdapter.setAll(sorted, newState);
  }),
  on(ConversationActions.loadConversationFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Find or create 1-on-1
  on(ConversationActions.findOrCreate1on1Conversation, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(
    ConversationActions.findOrCreate1on1ConversationSuccess,
    (state, { conversation }) =>
      conversationAdapter.upsertOne(conversation, {
        ...state,
        selectedConversationId: conversation._id!,
        loading: false,
        error: null,
      })
  ),
  on(
    ConversationActions.findOrCreate1on1ConversationFailure,
    (state, { error }) => ({
      ...state,
      loading: false,
      error,
    })
  ),

  // Create group
  on(ConversationActions.createConversation, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ConversationActions.createConversationSuccess, (state, { conversation }) => {
    const isCurrentSelected = state.selectedConversationId === conversation._id;
    const newState = conversationAdapter.upsertOne(conversation, {
      ...state,
      selectedConversationId: isCurrentSelected ? conversation._id! : state.selectedConversationId,
      loading: false,
      error: null,
    });
    // Sort conversations by updatedAt desc
    const all = conversationAdapter.getSelectors().selectAll(newState);
    const sorted = [...all].sort((a, b) => new Date(b.updatedAt || '').getTime() - new Date(a.updatedAt || '').getTime());
    return conversationAdapter.setAll(sorted, newState);
  }),
  on(ConversationActions.createConversationFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Update
  on(ConversationActions.updateConversation, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ConversationActions.updateConversationSuccess, (state, { conversation }) =>
    conversationAdapter.updateOne(
      { id: conversation._id!, changes: conversation },
      { ...state, loading: false, error: null }
    )
  ),
  on(ConversationActions.updateConversationFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Update last message
  on(
    ConversationActions.updateConversationLastMessage,
    (state, { conversationId, message }) =>
      conversationAdapter.updateOne(
        { id: conversationId, changes: { lastMessage: message } },
        state
      )
  ),
  on(
    ConversationActions.updateLastAttachmentName,
    (state, { conversationId, lastAttachmentName }) =>
      conversationAdapter.updateOne(
        { id: conversationId, changes: { lastAttachmentName } },
        state
      )
  ),

  // Select conversation
  on(ConversationActions.selectConversation, (state, { id }) => ({
    ...state,
    selectedConversationId: id,
  })),

  // Typing
  on(ConversationActions.userStartedTyping, (state, { userId }) => ({
    ...state,
    typingUsers: [
      ...state.typingUsers,
      {
        userId,
        timestamp: Date.now(),
        conversationId: state.selectedConversationId!,
      },
    ],
  })),
  on(ConversationActions.userStoppedTyping, (state, { userId }) => ({
    ...state,
    typingUsers: state.typingUsers.filter((t) => t.userId !== userId),
  })),
  on(ConversationActions.setTypingUsers, (state, { typingUsers }) => ({
    ...state,
    typingUsers: typingUsers.map((id) => ({
      userId: id,
      timestamp: Date.now(),
    })),
  })),

  // Online
  on(ConversationActions.userWentOnline, (state, { userId }) => ({
    ...state,
    onlineUsers: Array.from(new Set([...state.onlineUsers, userId])),
  })),
  on(ConversationActions.userWentOffline, (state, { userId }) => ({
    ...state,
    onlineUsers: state.onlineUsers.filter((id) => id !== userId),
  })),
  on(ConversationActions.updateOnlineUsers, (state, { onlineUsers }) => ({
    ...state,
    onlineUsers,
  })),
  on(ConversationActions.setOnlineUsers, (state, { onlineUsers }) => ({
    ...state,
    onlineUsers,
  })),

  // Conversation updates via socket
  on(
    ConversationActions.conversationUpdated,
    (state, { conversationId, data }) =>
      conversationAdapter.updateOne(
        { id: conversationId, changes: data },
        state
      )
  ),

  // Load all users
  on(ConversationActions.getAllUsers, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(ConversationActions.getAllUsersSuccess, (state, { users }) => ({
    ...state,
    users,
    loading: false,
    error: null,
  })),

  on(ConversationActions.getAllUsersFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Leave group
  on(ConversationActions.leaveGroupSuccess, (state, { conversationId }) =>
    conversationAdapter.removeOne(conversationId, state)
  ),
  on(ConversationActions.leaveGroupFailure, (state, { error }) => ({
    ...state,
    error,
  })),

  on(ConversationActions.removeUserFromConversation, (state, { conversationId, userId }) => {
    const conversation = state.entities[conversationId];
    if (conversation && conversation.participants) {
      const updatedParticipants = conversation.participants.filter((p: any) => p._id !== userId);
      return conversationAdapter.updateOne(
        {
          id: conversationId,
          changes: {
            participants: updatedParticipants,
            updatedAt: new Date().toISOString()
          }
        },
        state
      );
    }
    return state;
  })
);
