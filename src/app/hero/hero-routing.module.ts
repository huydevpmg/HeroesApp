// src/app/core/core-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './component/dashboard/dashboard.component';
import { HeroesComponent } from './component/heroes/heroes.component';
import { HeroDetailComponent } from './component/hero-detail/hero-detail.component';
import { authGuard } from '../core/guards/auth.guard';
import { CoreLayoutComponent } from '../core/layout/core-layout.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    component: CoreLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'heroes', component: HeroesComponent },
      { path: 'detail/:id', component: HeroDetailComponent }
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HeroRoutingModule {}
