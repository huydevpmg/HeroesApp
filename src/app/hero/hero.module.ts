import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';


import { heroReducer } from './store/reducers/hero.reducer';
import { HeroEffects } from './store/effects/hero.effects';
import { HeroesComponent } from './component/heroes/heroes.component';
import { HeroDetailComponent } from './component/hero-detail/hero-detail.component';
import { DashboardComponent } from './component/dashboard/dashboard.component';
import { HeroRoutingModule } from './hero-routing.module';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    HeroesComponent,
    HeroDetailComponent,
    DashboardComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    StoreModule.forFeature('heroes', heroReducer),
    EffectsModule.forFeature([HeroEffects]),
    HeroRoutingModule,
    FormsModule
  ]
})
export class HeroModule {}
