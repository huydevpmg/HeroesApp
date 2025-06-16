import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { ChatRoutingModule } from './chat-routing.module';
import { ChatComponent } from './chat.component';
import { LeftbarComponent } from './components/leftbar/leftbar.component';
import { MainContentComponent } from './components/main-content/main-content.component';
import { TimeAgoDirective } from '../shared/directives/time-ago.directive';
import { ChatInfoComponent } from './components/chat-info/chat-info.component';

import { conversationReducer } from './store/conversation/conversation.reducer';
import { messageReducer } from './store/message/message.reducer';
import { ConversationEffects } from './store/conversation/conversation.effects';
import { MessageEffects } from './store/message/message.effects';

@NgModule({
  declarations: [
    ChatComponent,
    LeftbarComponent,
    MainContentComponent,
    TimeAgoDirective,
    ChatInfoComponent
  ],
  imports: [
    CommonModule,
    ChatRoutingModule,
    FormsModule,
    StoreModule.forFeature('conversation', conversationReducer),
    StoreModule.forFeature('messages', messageReducer),
    EffectsModule.forFeature([ConversationEffects, MessageEffects])
  ]
})
export class ChatModule { }
