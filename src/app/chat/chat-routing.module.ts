import { ChatComponent } from './chat.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from '../core/guards/auth.guard';
import { CoreLayoutComponent } from '../core/layout/core-layout.component';

const routes: Routes = [
  {
    path: '',
    // canActivate: [authGuard],
    component: CoreLayoutComponent,
    children: [
      { path: '', component: ChatComponent },
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChatRoutingModule { }
