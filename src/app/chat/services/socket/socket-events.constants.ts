export const SOCKET_EVENTS = {
  // Connection events
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',

  // Room management
  JOIN_ROOM: 'join_room',
  CONNECT_CONVERSATION: 'connect_conversation',

  // Message events
  SEND_MESSAGE: 'send_message',
  RECEIVE_MESSAGE: 'receive_message',
  EDIT_MESSAGE: 'edit_message',
  DELETE_MESSAGE: 'delete_message',
  MESSAGE_UPDATED: 'message_updated',
  MESSAGE_DELETED_GLOBAL: 'message_deleted_global',
  MESSAGE_DELETED_PERSONAL: 'message_deleted_personal',

  // Typing indicators
  TYPING: 'typing',
  USER_TYPING: 'user_typing',

  // Reactions
  MESSAGE_REACTION: 'message_reaction',
  REMOVE_REACTION: 'remove_reaction',

  // Status
  USER_STATUS_CHANGE: 'user_status_change',

  // Group/Conversation management
  GROUP_CREATED: 'group_created',
  NEW_GROUP: 'new_group',
  MEMBER_ADDED: 'member_added',
  MEMBER_REMOVED: 'member_removed',
  PIN_CONVERSATION: 'pin_conversation',
  ARCHIVE_CONVERSATION: 'archive_conversation',
  ADD_LABEL: 'add_label',
  REMOVE_LABEL: 'remove_label',

  // Message status
  MARK_AS_READ: 'mark_as_read',

  // Attachments
  ATTACHMENT_CREATED: 'attachment_created',
  ATTACHMENT_DELETED: 'attachment_deleted',
} as const;

export type SocketEventName = keyof typeof SOCKET_EVENTS;
export type SocketEventValue = typeof SOCKET_EVENTS[SocketEventName];

// Grouped events for easier management
export const EVENT_GROUPS = {
  CONNECTION: [
    SOCKET_EVENTS.CONNECTION,
    SOCKET_EVENTS.DISCONNECT,
  ],

  MESSAGES: [
    SOCKET_EVENTS.SEND_MESSAGE,
    SOCKET_EVENTS.RECEIVE_MESSAGE,
    SOCKET_EVENTS.EDIT_MESSAGE,
    SOCKET_EVENTS.DELETE_MESSAGE,
    SOCKET_EVENTS.MESSAGE_UPDATED,
    SOCKET_EVENTS.MESSAGE_DELETED_GLOBAL,
    SOCKET_EVENTS.MESSAGE_DELETED_PERSONAL,
  ],

  TYPING: [
    SOCKET_EVENTS.TYPING,
    SOCKET_EVENTS.USER_TYPING,
  ],

  REACTIONS: [
    SOCKET_EVENTS.MESSAGE_REACTION,
    SOCKET_EVENTS.REMOVE_REACTION,
  ],

  CONVERSATIONS: [
    SOCKET_EVENTS.JOIN_ROOM,
    SOCKET_EVENTS.CONNECT_CONVERSATION,
    SOCKET_EVENTS.GROUP_CREATED,
    SOCKET_EVENTS.NEW_GROUP,
    SOCKET_EVENTS.MEMBER_ADDED,
    SOCKET_EVENTS.MEMBER_REMOVED,
    SOCKET_EVENTS.PIN_CONVERSATION,
    SOCKET_EVENTS.ARCHIVE_CONVERSATION,
    SOCKET_EVENTS.ADD_LABEL,
    SOCKET_EVENTS.REMOVE_LABEL,
  ],

  ATTACHMENTS: [
    SOCKET_EVENTS.ATTACHMENT_CREATED,
    SOCKET_EVENTS.ATTACHMENT_DELETED,
  ],

  PRESENCE: [
    SOCKET_EVENTS.USER_STATUS_CHANGE,
  ],
} as const;
