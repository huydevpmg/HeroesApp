import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { CoreLayoutComponent } from './layout/core-layout.component';
import { NavbarComponent } from './navbar/navbar.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    NavbarComponent,
    CoreLayoutComponent
  ],
  imports: [
    ReactiveFormsModule,
    CommonModule,
    RouterModule   // ✅ bắt buộc phải có nếu dùng <router-outlet>
  ],
  exports: [
    NavbarComponent,
    CoreLayoutComponent
  ]
})
export class SharedModule {}
