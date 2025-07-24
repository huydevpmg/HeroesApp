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
  on(ConversationActions.loadConversationsSuccess, (state, { conversations, total, page, totalPages }) => {
    const sorted = [...conversations].sort((a, b) => new Date(b.updatedAt || '').getTime() - new Date(a.updatedAt || '').getTime());
    const ids = state.ids as string[];
    if (page === 1) {
      return conversationAdapter.setAll(sorted, {
        ...state,
        loading: false,
        error: null,
        total,
        page,
        totalPages,
      });
    } else {
      return conversationAdapter.addMany(
        sorted.filter(c => !!c._id && !ids.includes(c._id as string)),
        {
          ...state,
          loading: false,
          error: null,
          total,
          page,
          totalPages,
        }
      );
    }
  }),
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
    const all = conversationAdapter.getSelectors().selectAll(newState);
    const sorted = [...all].sort((a, b) => new Date(b.updatedAt || '').getTime() - new Date(a.updatedAt || '').getTime());
    return conversationAdapter.setAll(sorted, newState);
  }),
  on(ConversationActions.loadConversationFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),


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
    (state, { conversationId, message }) => {
      const newState = conversationAdapter.updateOne(
        {
          id: conversationId,
          changes: {
            lastMessage: {
              ...message,
              senderName: message.senderName || message.sender?.fullName || message.sender?.username || '',
            },
            updatedAt: new Date().toISOString()
          }
        },
        state
      );
      // Re-sort conversations after updating last message
      const all = conversationAdapter.getSelectors().selectAll(newState);
      const sorted = [...all].sort((a, b) => new Date(b.updatedAt || '').getTime() - new Date(a.updatedAt || '').getTime());
      return conversationAdapter.setAll(sorted, newState);
    }
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

  // Add members to group
  on(ConversationActions.addMembersToGroup, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ConversationActions.addMembersToGroupSuccess, (state, { conversation }) => {
    if (!conversation || !conversation._id) {
      return { ...state, loading: false, error: null };
    }
    const newState = conversationAdapter.updateOne(
      { id: conversation._id!, changes: conversation },
      { ...state, loading: false, error: null }
    );
    // Re-sort conversations after adding members
    const all = conversationAdapter.getSelectors().selectAll(newState);
    const sorted = [...all].sort((a, b) => new Date(b.updatedAt || '').getTime() - new Date(a.updatedAt || '').getTime());
    return conversationAdapter.setAll(sorted, newState);
  }),
  on(ConversationActions.addMembersToGroupFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Remove member from group
  on(ConversationActions.removeMemberFromGroup, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ConversationActions.removeMemberFromGroupSuccess, (state, { conversation }) => {
    if (!conversation || !conversation._id) {
      return { ...state, loading: false, error: null };
    }
    return conversationAdapter.updateOne(
      { id: conversation._id!, changes: conversation },
      { ...state, loading: false, error: null }
    );
  }),
  on(ConversationActions.removeMemberFromGroupFailure, (state, { error }) => ({
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
  }),

  // Toggle Archive
  on(ConversationActions.toggleArchive, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ConversationActions.toggleArchiveSuccess, (state) => {
    return {
      ...state,
      loading: false,
      error: null,
    };
  }),
  on(ConversationActions.toggleArchiveFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Unread count actions for conversation
  on(ConversationActions.incrementUnreadCount, (state, { conversationId }) => {
    const conversation = state.entities[conversationId];
    if (conversation) {
      const unreadCount = (conversation.unreadCount || 0) + 1;
      return conversationAdapter.updateOne(
        {
          id: conversationId,
          changes: { unreadCount }
        },
        state
      );
    }
    return state;
  }),
  on(ConversationActions.resetUnreadCount, (state, { conversationId }) => {
    const conversation = state.entities[conversationId];
    if (conversation) {
      return conversationAdapter.updateOne(
        {
          id: conversationId,
          changes: { unreadCount: 0 }
        },
        state
      );
    }
    return state;
  }),
);
