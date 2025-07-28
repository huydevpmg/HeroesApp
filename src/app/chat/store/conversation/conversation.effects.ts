import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of, from } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';

import * as ConversationActions from './conversation.actions';
import * as MessageActions from '../message/message.actions';
import { ConversationApiService } from '../../services/conversation/conversation-api.service';
import { UserConversationApiService } from '../../services/userConversation/userconversation-api.service';
import { Conversation } from '../../../shared/enums/models/conversation.model';

@Injectable()
export class ConversationEffects {
  loadConversations$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ConversationActions.loadConversations),
      mergeMap(({ page = 1, limit = 20 }) =>
        this.conversationApi.getConversations(page, limit).pipe(
          map(result =>
            ConversationActions.loadConversationsSuccess({
              conversations: result.conversations,
              total: result.total,
              page: result.page,
              totalPages: result.totalPages
            })
          ),
          catchError(error => {
            console.error('[API] Error fetching conversations:', error);
            return of(ConversationActions.loadConversationsFailure({ error: error.message }));
          })
        )
      )
    )
  );


  createConversation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ConversationActions.createConversation),
      mergeMap(({ data }) =>
        this.conversationApi.createConversation(data).pipe(
          mergeMap((conversation: Conversation) => from([
            ConversationActions.createConversationSuccess({ conversation }),
            ConversationActions.loadConversation({ id: conversation._id! })
          ])),
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
            ConversationActions.loadConversations({ page: 1, limit: 20 }),
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
            ConversationActions.loadConversations({ page: 1, limit: 20 }),
            MessageActions.loadMessages({ conversationId }) // Reload messages để hiển thị system message
          ]),
          catchError(error => of(ConversationActions.removeMemberFromGroupFailure({ error: error.message })))
        )
      )
    )
  );

  leaveGroup$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ConversationActions.leaveGroup),
      mergeMap(({ conversationId }) =>
        this.conversationApi.leaveGroup(conversationId).pipe(
          map(() => ConversationActions.leaveGroupSuccess({ conversationId })),
          catchError(error => of(ConversationActions.leaveGroupFailure({ error: error.message })))
        )
      )
    )
  );

  clearConversation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ConversationActions.clearConversation),
      mergeMap(({ conversationId }) =>
        this.conversationApi.clearConversation(conversationId).pipe(
          map((response: any) => ConversationActions.clearConversationSuccess({
            conversationId,
            clearAt: response.data.clearAt
          })),
          catchError(error => of(ConversationActions.clearConversationFailure({ error: error.message })))
        )
      )
    )
  );

  clearConversationSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ConversationActions.clearConversationSuccess),
      mergeMap(({ conversationId }) => [
        MessageActions.loadMessages({ conversationId }),
        ConversationActions.loadConversations({ page: 1, limit: 20 })
      ])
    )
  );

  toggleArchive$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ConversationActions.toggleArchive),
      mergeMap(({ userConversationId }) =>
        this.userConversationApi.toggleArchive(userConversationId).pipe(
          mergeMap((userConversation) => [
            ConversationActions.toggleArchiveSuccess({
              userConversationId,
              isArchived: userConversation.isArchived || false
            }),
            ConversationActions.loadConversations({ page: 1, limit: 20 })
          ]),
          catchError(error => of(ConversationActions.toggleArchiveFailure({ error: error.message })))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private conversationApi: ConversationApiService,
    private userConversationApi: UserConversationApiService
  ) { }
}
