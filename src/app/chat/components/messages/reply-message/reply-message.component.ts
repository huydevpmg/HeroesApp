import { Component, OnInit } from '@angular/core';
import { BaseMessageComponent } from '../base-message/base-message.component';
import { Store } from '@ngrx/store';
import { Message } from '../../../models/message.model';
import * as MessageSelectors from '../../../store/message/message.selectors';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../../../../auth/services/auth.service';

@Component({
  selector: 'app-reply-message',
  templateUrl: './reply-message.component.html',
  styleUrls: ['./reply-message.component.css', '../base-message/base-message.component.css']
})
export class ReplyMessageComponent extends BaseMessageComponent implements OnInit {
  parentMessage$: Observable<Message | null> = of(null);

  constructor(protected override authService: AuthService, private store: Store) {
    super(authService);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    
    if (this.message.parentMessage) {
      this.parentMessage$ = this.store.select(MessageSelectors.selectAllMessages).pipe(
        map(messages => messages.find(m => m._id === this.message.parentMessage) || null)
      );
    }
  }
}