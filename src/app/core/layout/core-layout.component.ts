import { Component } from "@angular/core";

@Component({
  selector: 'app-core-layout',
  template: `
    <app-navbar></app-navbar>
    <router-outlet></router-outlet>
  `
})
export class CoreLayoutComponent {}
