import { Component, Input, OnInit } from '@angular/core';
import { Message } from '../../../models/message.model';
import { AuthService } from '../../../../auth/services/auth.service';

@Component({
  selector: 'app-base-message',
  templateUrl: './base-message.component.html',
  styleUrls: ['./base-message.component.css']
})
export class BaseMessageComponent implements OnInit {
  @Input() message!: Message;
  @Input() conversationId!: string;
  
  isCurrentUser = false;
  currentUserId: string | null = null;

  constructor(protected authService: AuthService) { }

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId();
    this.isCurrentUser = this.message.senderId === this.currentUserId;
  }
}