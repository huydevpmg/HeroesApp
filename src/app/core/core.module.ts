// src/app/core/core.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { DashboardComponent } from './component/dashboard/dashboard.component';
import { HeroDetailComponent } from './component/hero-detail/hero-detail.component';
import { HeroesComponent } from './component/heroes/heroes.component';
import { MessagesComponent } from './component/messages/messages.component';
import { NavbarComponent } from './component/navbar/navbar.component';
import { ModalComponent } from './component/modal/modal.component';

@NgModule({
  declarations: [
    HeroesComponent,
    MessagesComponent,
    DashboardComponent,
    HeroDetailComponent,
    NavbarComponent,
    ModalComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
  ],
  exports: [
    NavbarComponent,
    MessagesComponent,
    DashboardComponent,
    HeroDetailComponent,
  ]
})
export class CoreModule {}
