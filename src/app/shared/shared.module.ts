import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HeroCardComponent } from './hero-card/hero-card.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { NavbarComponent } from './navbar/navbar.component';
import { NgbDropdownModule, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { OwnerBadgeDirective } from './directives/owner-badge.directive';

@NgModule({
  declarations: [
    HeroCardComponent,
    NavbarComponent,
    OwnerBadgeDirective
  ],
  imports: [
    CommonModule,
    NgSelectModule,
    RouterModule,
    NgbDropdownModule,
    NgbModalModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    NavbarComponent,
    HeroCardComponent,
    OwnerBadgeDirective
  ],

})
export class SharedModule { }
