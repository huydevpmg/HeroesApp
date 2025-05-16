import { NgModule, Optional, SkipSelf } from '@angular/core';
import { NavbarComponent } from './navbar/navbar.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CoreLayoutComponent } from './layout/core-layout.component';
import { NgbDropdownModule, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [NavbarComponent, CoreLayoutComponent],
  imports: [
    ReactiveFormsModule,
    CommonModule,
    RouterModule,
     NgbDropdownModule,
    NgbModalModule,
  ],
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import it in AppModule only.');
    }
  }
}
