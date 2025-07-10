import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of, from } from 'rxjs';
import { map, mergeMap, catchError, tap } from 'rxjs/operators';
import * as MessageActions from './message.actions';
import * as ConversationActions from '../conversation/conversation.actions';
import { SocketService } from '../../services/socket/socket.service';
import { MessageApiService } from '../../services/message/message-api.service';
import { DeleteType } from '../../../shared/enums/models/delete-type.enum';

@Injectable()
export class MessageEffects {
  loadMessages$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MessageActions.loadMessages),
      mergeMap(({ conversationId, page = 1, limit = 20 }) =>
        this.messageApiService.getMessages(conversationId, page, limit).pipe(
          map(result => MessageActions.loadMessagesSuccess({ messages: result.messages, total: result.total, page: result.page, totalPages: result.totalPages })),
          catchError(error => of(MessageActions.loadMessagesFailure({ error: error.message })))
        )
      )
    )
  );

  sendMessage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MessageActions.sendMessage),
      mergeMap(({ conversationId, content, attachmentId, parentMessageId }) =>
        this.messageApiService.sendMessage(conversationId, content, attachmentId, parentMessageId).pipe(
          map(message => [
            MessageActions.sendMessageSuccess({ message }),
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
      mergeMap(({ messageId, deleteType }) =>
        from(this.messageApiService.deleteMessage(messageId, deleteType as DeleteType)).pipe(
          tap(() => {
            if (deleteType === DeleteType.EVERYONE) {
              this.socketService.emitMessageDeletedGlobal(messageId);
            }
          }),
          map(() => MessageActions.deleteMessageSuccess({ messageId, deleteType })),
          catchError(error => of(MessageActions.deleteMessageFailure({ error: error?.message || 'Delete failed' })))
        )
      )
    )
  );

  updateMessageStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MessageActions.updateMessageStatus),
      mergeMap(({ messageId, status }) =>
        this.messageApiService.updateMessageStatus(messageId, status).pipe(
          map(message => MessageActions.updateMessageStatusSuccess({ message })),
          catchError(error => of(MessageActions.updateMessageStatusFailure({ error: error.message })))
        )
      )
    )
  );

  editMessage$ = createEffect(() => (
    this.actions$.pipe(
      ofType(MessageActions.editMessage),
      mergeMap(({ messageId, content }) =>
        this.messageApiService.editMessage(messageId, content).pipe(
          map(message => MessageActions.editMessageSuccess({ message })),
          catchError(error => of(MessageActions.editMessageFailure({ error: error.message })))
        )
      )
    )
  ))

  addReaction$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MessageActions.addReaction),
      mergeMap(({ messageId, emoji }) =>
        this.messageApiService.addReaction(messageId, emoji).pipe(
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
        this.messageApiService.removeReaction(messageId).pipe(
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
        if (!this.socketService.connected) {
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
        ...(message && message._id ? [ConversationActions.updateConversationLastMessage({ conversationId: message.conversationId, message })] : [])
      ]),
      mergeMap(actions => from(actions))
    )
  );

  // Handle message updated (edit)
  handleMessageUpdated$ = createEffect(() =>
    this.socketService.onMessageUpdated().pipe(
      map(message => MessageActions.updateMessageSuccess({ message }))
    )
  );

  // Handle message deleted (global)
  handleMessageDeletedGlobal$ = createEffect(() =>
    this.socketService.onMessageDeletedGlobal().pipe(
      map(({ messageId }) => [
        MessageActions.deleteMessageSuccess({ messageId, deleteType: DeleteType.EVERYONE }),
        ConversationActions.loadConversations({ page: 1, limit: 20 }) // Reload conversations để cập nhật lastMessage
      ]),
      mergeMap(actions => from(actions))
    )
  );

  // Handle message deleted (personal)
  handleMessageDeletedPersonal$ = createEffect(() =>
    this.socketService.onMessageDeletedPersonal().pipe(
      map(({ messageId }) => [
        MessageActions.deleteMessageSuccess({ messageId, deleteType: DeleteType.JUSTME }),
        ConversationActions.loadConversations({ page: 1, limit: 20 })
      ]),
      mergeMap(actions => from(actions))
    )
  );

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
    private messageApiService: MessageApiService,
    private socketService: SocketService
  ) { }
}
