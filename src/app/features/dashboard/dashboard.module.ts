import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ListsComponent } from './lists/lists.component';
import { OverviewComponent } from './overview/overview.component';
import { ListDetailsComponent } from './list-details/list-details.component';

@NgModule({
  declarations: [
    DashboardComponent,
    ListsComponent,
    OverviewComponent,
    ListDetailsComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule
  ]
})
export class DashboardModule { }
