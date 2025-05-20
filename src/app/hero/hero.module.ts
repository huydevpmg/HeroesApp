import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';


import { HeroesComponent } from './component/heroes/heroes.component';
import { HeroDetailComponent } from './component/hero-detail/hero-detail.component';
import { DashboardComponent } from './component/dashboard/dashboard.component';
import { HeroRoutingModule } from './hero-routing.module';
import { SharedModule } from '../shared/shared.module';
import { heroReducer } from './store/hero/hero.reducer';
import { HeroEffects } from './store/hero/hero.effects';
import { AddHeroModalComponent } from './component/add-hero-modal/add-hero-modal.component';
import { EditProfileModalComponent } from './component/edit-profile-modal/edit-profile-modal.component';
import { TagsComponent } from './component/tags/tags.component';
import { tagReducer } from './store/tag/tag.reducers';
import { TagEffects } from './store/tag/tag.effects';

@NgModule({
  declarations: [
    HeroesComponent,
    HeroDetailComponent,
    DashboardComponent,
    AddHeroModalComponent,
    EditProfileModalComponent,
    TagsComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,

    StoreModule.forFeature('heroes', heroReducer),
    EffectsModule.forFeature([HeroEffects]),
    StoreModule.forFeature('tag', tagReducer),
    EffectsModule.forFeature([TagEffects]),
    HeroRoutingModule,
    FormsModule
  ]
})
export class HeroModule { }
