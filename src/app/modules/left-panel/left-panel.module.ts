import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SATRouterModule } from 'sat-router';
import { LeftPanelComponent } from './left-panel.component';
import { LeftPanelBottomComponent } from './left-panel-bottom/left-panel-bottom.component';

@NgModule({
  declarations: [
    LeftPanelComponent,
    LeftPanelBottomComponent
  ],
  imports: [
    CommonModule,
    SATRouterModule.create([
      { path: '', component: LeftPanelComponent },
      { path: 'top:top', loadChildren: () => import('./left-panel-top/top.module').then(_ => _.TopModule) },
      { path: 'bottom:bottom', component: LeftPanelBottomComponent }
    ])

  ]
})
export class LeftPanelModule { }
