// src/app/core/core.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { DashboardComponent } from './component/dashboard/dashboard.component';
import { HeroDetailComponent } from './component/hero-detail/hero-detail.component';
import { HeroesComponent } from './component/heroes/heroes.component';
import { MessagesComponent } from './component/messages/messages.component';

@NgModule({
  declarations: [
    HeroesComponent,
    MessagesComponent,
    DashboardComponent,
    HeroDetailComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
  ],
  exports: [
    HeroesComponent,
    MessagesComponent,
    DashboardComponent,
    HeroDetailComponent,
  ]
})
export class CoreModule {}
