import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of, from } from 'rxjs';
import { map, mergeMap, catchError, tap } from 'rxjs/operators';
import * as ConversationActions from './conversation.actions';
import * as MessageActions from '../message/message.actions';
import { ConversationApiService } from '../../services/conversation/conversation-api.service';
import { SocketService } from '../../services/socket/socket.service';
import { Conversation } from '../../../shared/enums/models/conversation.model';

@Injectable()
export class ConversationEffects {
  loadConversations$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ConversationActions.loadConversations),
      mergeMap(() =>
        this.conversationApi.getConversations().pipe(
          map((conversations: Conversation[]) => ConversationActions.loadConversationsSuccess({ conversations })),
          catchError(error => of(ConversationActions.loadConversationsFailure({ error: error.message })))
        )
      )
    )
  );

  loadConversation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ConversationActions.loadConversation),
      mergeMap(({ id }) =>
        this.conversationApi.getConversationById(id).pipe(
          map((conversation: Conversation) => ConversationActions.loadConversationSuccess({ conversation })),
          catchError(error => of(ConversationActions.loadConversationFailure({ error: error.message })))
        )
      )
    )
  );

  findOrCreate1on1Conversation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ConversationActions.findOrCreate1on1Conversation),
      mergeMap(({ participantId }) =>
        this.conversationApi.findOrCreate1on1Conversation(participantId).pipe(
          map((conversation: Conversation) => ConversationActions.findOrCreate1on1ConversationSuccess({ conversation })),
          catchError(error => of(ConversationActions.findOrCreate1on1ConversationFailure({ error: error.message })))
        )
      )
    )
  );

  createConversation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ConversationActions.createConversation),
      mergeMap(({ data }) =>
        this.conversationApi.createConversation(data).pipe(
          tap((conversation: Conversation) => {
            this.socketService.emitGroupCreated(conversation);
          }),
          map((conversation: Conversation) => ConversationActions.createConversationSuccess({ conversation })),
          catchError(error => of(ConversationActions.createConversationFailure({ error: error.message })))
        )
      )
    )
  );

  updateConversation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ConversationActions.updateConversation),
      mergeMap(({ id, data }) =>
        this.conversationApi.updateConversation(id, data).pipe(
          map((conversation: Conversation) => ConversationActions.updateConversationSuccess({ conversation })),
          catchError(error => of(ConversationActions.updateConversationFailure({ error: error.message })))
        )
      )
    )
  );

  updateLastAttachmentName$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ConversationActions.updateLastAttachmentName),
      mergeMap(({ conversationId, lastAttachmentName }) =>
        this.conversationApi.updateLastAttachmentName(conversationId, lastAttachmentName).pipe(
          map((conversation: Conversation) => ConversationActions.updateConversationSuccess({ conversation })),
          catchError(error => of(ConversationActions.updateConversationFailure({ error: error.message })))
        )
      )
    )
  );

  getAllUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ConversationActions.getAllUsers),
      mergeMap(() =>
        this.conversationApi.getAllUsers().pipe(
          map((users: any[]) => ConversationActions.getAllUsersSuccess({ users })),
          catchError(error => of(ConversationActions.getAllUsersFailure({ error: error.message })))
        )
      )
    )
  );

  addMembersToGroup$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ConversationActions.addMembersToGroup),
      mergeMap(({ conversationId, memberIds }) =>
        this.conversationApi.addMembersToGroup(conversationId, memberIds).pipe(
          mergeMap((conversation: Conversation) => [
            ConversationActions.addMembersToGroupSuccess({ conversation }),
            ConversationActions.loadConversations(),
            MessageActions.loadMessages({ conversationId })
          ]),
          catchError(error => of(ConversationActions.addMembersToGroupFailure({ error: error.message })))
        )
      )
    )
  );

  removeMemberFromGroup$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ConversationActions.removeMemberFromGroup),
      mergeMap(({ conversationId, userId }) =>
        this.conversationApi.removeMemberFromGroup(conversationId, userId).pipe(
          mergeMap((conversation: Conversation) => [
            ConversationActions.removeMemberFromGroupSuccess({ conversation }),
            ConversationActions.loadConversations(),
            MessageActions.loadMessages({ conversationId }) // Reload messages để hiển thị system message
          ]),
          catchError(error => of(ConversationActions.removeMemberFromGroupFailure({ error: error.message })))
        )
      )
    )
  );

  handleNewGroup$ = createEffect(() =>
    this.socketService.onGroupCreated().pipe(
      map((conversation) => ConversationActions.createConversationSuccess({ conversation }))
    )
  );

  handleMemberAdded$ = createEffect(() =>
    this.socketService.onMemberAdded().pipe(
      map(({ conversationId }) => [
        ConversationActions.loadConversations(), // Force reload to get updated conversation data
        MessageActions.loadMessages({ conversationId }) // Reload messages để hiển thị system message
      ]),
      mergeMap(actions => from(actions))
    )
  );

  handleMemberRemoved$ = createEffect(() =>
    this.socketService.onMemberRemoved().pipe(
      map(({ conversationId }) => [
        ConversationActions.loadConversations(), // Force reload to get updated conversation data
        MessageActions.loadMessages({ conversationId }) // Reload messages để hiển thị system message
      ]),
      mergeMap(actions => from(actions))
    )
  );

  constructor(
    private actions$: Actions,
    private conversationService: ConversationApiService,
    private conversationApi: ConversationApiService,
    private socketService: SocketService
  ) { }
}
