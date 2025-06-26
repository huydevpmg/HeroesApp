import { Injectable, inject } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Message } from '../../models/message.model';
import { SocketCoreService } from './socket-core.service';
import { SOCKET_EVENTS } from './socket-events.constants';

@Injectable({
  providedIn: 'root'
})
export class ReactionSocketService {
  private socketCore = inject(SocketCoreService);

  private reactionSubject = new Subject<{ messageId: string; userId: string; emoji: string }>();
  private reactionRemovedSubject = new Subject<{ messageId: string; userId: string }>();

  constructor() {
    this.setupReactionListeners();
  }

  private setupReactionListeners(): void {
    // Reaction added
    this.socketCore.on(SOCKET_EVENTS.MESSAGE_REACTION, (data: { messageId: string; userId: string; emoji: string }) => {
      console.log('😀 Reaction added:', data);
      this.reactionSubject.next(data);
    });

    // Reaction removed
    this.socketCore.on(SOCKET_EVENTS.REMOVE_REACTION, (data: { messageId: string; userId: string }) => {
      console.log('Reaction removed:', data);
      this.reactionRemovedSubject.next(data);
    });
  }

  // Add reaction
  addReaction(messageId: string, emoji: string): Promise<{ success: boolean; message: Message }> {
    return new Promise((resolve) => {
      console.log('😀 Adding reaction:', { messageId, emoji });

      this.socketCore.emit(
        SOCKET_EVENTS.MESSAGE_REACTION,
        { messageId, emoji },
        (response: any) => {
          if (response.success) {
            console.log('Reaction added successfully:', response);
          } else {
            console.error('Failed to add reaction:', response);
          }
          resolve(response);
        }
      );
    });
  }

  // Remove reaction
  removeReaction(messageId: string): Promise<{ success: boolean; message: Message }> {
    return new Promise((resolve) => {
      console.log('Removing reaction:', { messageId });

      this.socketCore.emit(
        SOCKET_EVENTS.REMOVE_REACTION,
        { messageId },
        (response: any) => {
          if (response.success) {
            console.log('Reaction removed successfully:', response);
          } else {
            console.error('Failed to remove reaction:', response);
          }
          resolve(response);
        }
      );
    });
  }

  // Toggle reaction (add if not exists, remove if exists)
  toggleReaction(messageId: string, emoji: string, currentUserReaction?: string): Promise<{ success: boolean; message: Message }> {
    if (currentUserReaction && currentUserReaction === emoji) {
      return this.removeReaction(messageId);
    } else {
      return this.addReaction(messageId, emoji);
    }
  }

  // Observables
  onReaction(): Observable<{ messageId: string; userId: string; emoji: string }> {
    return this.reactionSubject.asObservable();
  }

  onReactionRemoved(): Observable<{ messageId: string; userId: string }> {
    return this.reactionRemovedSubject.asObservable();
  }

  // Combined observable for both add/remove reactions
  onReactionChange(): Observable<{ messageId: string; userId: string; emoji?: string; action: 'add' | 'remove' }> {
    return new Observable(subscriber => {
      const addSub = this.onReaction().subscribe(data =>
        subscriber.next({ ...data, action: 'add' })
      );

      const removeSub = this.onReactionRemoved().subscribe(data =>
        subscriber.next({ ...data, action: 'remove' })
      );

      return () => {
        addSub.unsubscribe();
        removeSub.unsubscribe();
      };
    });
  }
}
