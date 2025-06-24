import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of, from } from 'rxjs';
import { map, mergeMap, catchError, tap } from 'rxjs/operators';
import * as MessageActions from './message.actions';
import * as ConversationActions from '../conversation/conversation.actions';
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
      mergeMap(({ conversationId, content, attachments }) =>
        this.messageService.sendMessage(conversationId, content, attachments ?? []).pipe(
          map(message => [
            MessageActions.sendMessageSuccess({ message }),
            // Only update lastMessage if message._id is defined (avoid loop)
            ...(message && message._id ? [ConversationActions.updateConversationLastMessage({ conversationId, message })] : [])
          ]),
          catchError(error => of([MessageActions.sendMessageFailure({ error: error.message })]))
        )
      ),
      mergeMap(actions => from(actions))
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
        if (!this.socketService.getSocket().connected) {
          this.socketService.connect();
          setTimeout(() => {
            this.socketService.joinConversation(conversationId);
          }, 1000);
        } else {
          this.socketService.joinConversation(conversationId);
        }
      })
    ),
    { dispatch: false }
  );

  // Handle incoming messages
  handleNewMessage$ = createEffect(() =>
    this.socketService.onMessage().pipe(
      map(message => [
        MessageActions.receiveMessage({ message }),
        // Only update lastMessage if message._id is defined (avoid loop)
        ...(message && message._id ? [ConversationActions.updateConversationLastMessage({ conversationId: message.conversationId, message })] : [])
      ]),
      mergeMap(actions => from(actions))
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

  constructor(
    private actions$: Actions,
    private messageService: MessageService,
    private socketService: SocketService
  ) { }
}
