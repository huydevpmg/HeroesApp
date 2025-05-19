import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { NavbarComponent } from './../../shared/navbar/navbar.component';

@Component({
  selector: 'app-core-layout',
  template: `
    <app-navbar></app-navbar>
    <router-outlet></router-outlet>
  `
})
export class CoreLayoutComponent {}
