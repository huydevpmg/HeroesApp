import { Component, OnInit } from '@angular/core';
import { ConversationSocketService } from './services/socket/conversation-socket.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  showRightbar = true;

  constructor(private conversationSocketService: ConversationSocketService) { }

  ngOnInit(): void {
    this.conversationSocketService.initializeAutoJoin();
  }

  toggleRightbar() {
    this.showRightbar = !this.showRightbar;
  }
}
