import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent {

  showRightbar = true;

  toggleRightbar() {
    this.showRightbar = !this.showRightbar;
  }
}
