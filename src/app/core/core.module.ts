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
import { StoreModule } from '@ngrx/store';
import { heroReducer } from './store/reducers/hero.reducer';
import { CoreRoutingModule } from './core-routing.module';
import { CoreLayoutComponent } from './layout/core-layout.component';

@NgModule({
  declarations: [
    HeroesComponent,
    MessagesComponent,
    DashboardComponent,
    HeroDetailComponent,
    NavbarComponent,
    CoreLayoutComponent,
  ],
  imports: [
    StoreModule.forFeature('heroes', heroReducer),
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    CoreRoutingModule,
    RouterModule
  ],
  exports: [
    NavbarComponent,
    MessagesComponent,
    DashboardComponent,
    HeroDetailComponent,
  ]
})
export class CoreModule {}
