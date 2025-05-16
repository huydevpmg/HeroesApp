import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { CoreLayoutComponent } from '../core/layout/core-layout.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HeroCardComponent } from './hero-card/hero-card.component';
import { AddHeroModalComponent } from './add-hero-modal/add-hero-modal.component';
import { EditProfileModalComponent } from './edit-profile-modal/edit-profile-modal.component';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [

    HeroCardComponent,
     AddHeroModalComponent,
     EditProfileModalComponent
  ],
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule, FormsModule, NgSelectModule
  ],
  exports: [
    HeroCardComponent
  ]
})
export class SharedModule {}
