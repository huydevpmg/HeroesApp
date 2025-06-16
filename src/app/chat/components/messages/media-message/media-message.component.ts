import { Component } from '@angular/core';
import { BaseMessageComponent } from '../base-message/base-message.component';

@Component({
  selector: 'app-media-message',
  templateUrl: './media-message.component.html',
  styleUrls: ['./media-message.component.css', '../base-message/base-message.component.css']
})
export class MediaMessageComponent extends BaseMessageComponent {
  isImage(url: string): boolean {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  }
  
  isVideo(url: string): boolean {
    return /\.(mp4|webm|ogg|mov)$/i.test(url);
  }
}