import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, tap } from 'rxjs/operators';
import * as MessageActions from './message.actions';
import { MessageService } from '../../services/message/message.service';
import { SocketService } from '../../services/socket/socket.service';

@Injectable()
export class MessageEffects {
  loadMessages$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MessageActions.loadMessages),
      mergeMap(({ conversationId }) =>
        this.messageService.getMessages(conversationId).pipe(
          map(messages => MessageActions.loadMessagesSuccess({ messages })),
          catchError(error => of(MessageActions.loadMessagesFailure({ error: error.message })))
        )
      )
    )
  );

  sendMessage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MessageActions.sendMessage),
      mergeMap(({ conversationId, content }) =>
        this.messageService.sendMessage(conversationId, content).pipe(
          map(message => MessageActions.sendMessageSuccess({ message })),
          catchError(error => of(MessageActions.sendMessageFailure({ error: error.message })))
        )
      )
    )
  );

  deleteMessage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MessageActions.deleteMessage),
      mergeMap(({ messageId }) =>
        this.messageService.deleteMessage(messageId).pipe(
          map(() => MessageActions.deleteMessageSuccess({ messageId })),
          catchError(error => of(MessageActions.deleteMessageFailure({ error: error.message })))
        )
      )
    )
  );

  updateMessageStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MessageActions.updateMessageStatus),
      mergeMap(({ messageId, status }) =>
        this.messageService.updateMessageStatus(messageId, status).pipe(
          map(message => MessageActions.updateMessageStatusSuccess({ message })),
          catchError(error => of(MessageActions.updateMessageStatusFailure({ error: error.message })))
        )
      )
    )
  );

  addReaction$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MessageActions.addReaction),
      mergeMap(({ messageId, emoji }) =>
        this.messageService.addReaction(messageId, emoji).pipe(
          map(message => MessageActions.addReactionSuccess({ message })),
          catchError(error => of(MessageActions.addReactionFailure({ error: error.message })))
        )
      )
    )
  );

  removeReaction$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MessageActions.removeReaction),
      mergeMap(({ messageId }) =>
        this.messageService.removeReaction(messageId).pipe(
          map(message => MessageActions.removeReactionSuccess({ message })),
          catchError(error => of(MessageActions.removeReactionFailure({ error: error.message })))
        )
      )
    )
  );

  // Socket Effects
  joinConversation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MessageActions.loadMessages),
      tap(({ conversationId }) => {
        this.socketService.joinConversation(conversationId);
      })
    ),
    { dispatch: false }
  );

  // Handle incoming messages
  handleNewMessage$ = createEffect(() =>
    this.socketService.onMessage().pipe(
      map(message => MessageActions.receiveMessage({ message }))
    )
  );

  // Handle typing indicators
  handleTyping$ = createEffect(() =>
    this.socketService.onTyping().pipe(
      map(({ userId, isTyping }) =>
        isTyping
          ? MessageActions.userStartedTyping({ userId })
          : MessageActions.userStoppedTyping({ userId })
      )
    )
  );

  // Handle online status
  handleOnlineStatus$ = createEffect(() =>
    this.socketService.onOnlineStatus().pipe(
      map(({ userId, status }) =>
        status === 'online'
          ? MessageActions.userWentOnline({ userId })
          : MessageActions.userWentOffline({ userId })
      )
    )
  );

  // Handle reactions
  handleReaction$ = createEffect(() =>
    this.socketService.onReaction().pipe(
      map(({ messageId, userId, emoji }) =>
        MessageActions.messageReactionAdded({ messageId, userId, emoji })
      )
    )
  );

  handleReactionRemoved$ = createEffect(() =>
    this.socketService.onReactionRemoved().pipe(
      map(({ messageId, userId }) =>
        MessageActions.messageReactionRemoved({ messageId, userId })
      )
    )
  );

  // Handle conversation updates
  handleConversationUpdated$ = createEffect(() =>
    this.socketService.onConversationUpdated().pipe(
      map(({ conversationId, type, data }) =>
        MessageActions.conversationUpdated({ conversationId, updateType: type, data })
      )
    )
  );

  constructor(
    private actions$: Actions,
    private messageService: MessageService,
    private socketService: SocketService
  ) { }
}
