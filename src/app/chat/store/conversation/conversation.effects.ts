import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, tap } from 'rxjs/operators';
import * as ConversationActions from './conversation.actions';
import { ConversationService } from '../../services/conversation/conversation.service';

@Injectable()
export class ConversationEffects {
  loadConversations$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ConversationActions.loadConversations),
      tap(() => console.log('Loading conversations...')),
      mergeMap(() =>
        this.conversationService.getConversations().pipe(
          tap(conversations => {
            console.log('Conversations loaded in effects:', conversations);
            conversations.forEach(conv => {
              console.log('Conversation:', conv._id, 'Participants:', conv.participants);
            });
          }),
          map(conversations => ConversationActions.loadConversationsSuccess({ conversations })),
          catchError(error => of(ConversationActions.loadConversationsFailure({ error: error.message })))
        )
      )
    )
  );

  loadConversation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ConversationActions.loadConversation),
      mergeMap(({ id }) =>
        this.conversationService.getConversationById(id).pipe(
          map(conversation => ConversationActions.loadConversationSuccess({ conversation })),
          catchError(error => of(ConversationActions.loadConversationFailure({ error: error.message })))
        )
      )
    )
  );

  findOrCreate1on1Conversation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ConversationActions.findOrCreate1on1Conversation),
      mergeMap(({ participantId }) =>
        this.conversationService.findOrCreate1on1Conversation(participantId).pipe(
          map(conversation => ConversationActions.findOrCreate1on1ConversationSuccess({ conversation })),
          catchError(error => of(ConversationActions.findOrCreate1on1ConversationFailure({ error: error.message })))
        )
      )
    )
  );

  createConversation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ConversationActions.createConversation),
      mergeMap(({ data }) =>
        this.conversationService.createConversation(data).pipe(
          map(conversation => ConversationActions.createConversationSuccess({ conversation })),
          catchError(error => of(ConversationActions.createConversationFailure({ error: error.message })))
        )
      )
    )
  );

  updateConversation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ConversationActions.updateConversation),
      mergeMap(({ id, data }) =>
        this.conversationService.updateConversation(id, data).pipe(
          map(conversation => ConversationActions.updateConversationSuccess({ conversation })),
          catchError(error => of(ConversationActions.updateConversationFailure({ error: error.message })))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private conversationService: ConversationService
  ) { }
}
