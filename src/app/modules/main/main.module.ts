import { TabsModule } from './../../tabs/tabs.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainComponent } from './main.component';
import { SATRouterModule } from 'sat-router';
import { Root2Component } from '../root2.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [
    MainComponent
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    TabsModule,
    SATRouterModule.create([

      { path: '', component: MainComponent, canUnload: false },

      { path: 'panel-left:left', loadChildren: () => import('../left-panel/left-panel.module').then(_ => _.LeftPanelModule) },

      { path: 'editor:center', loadChildren: () => import('../editor/editor.module').then(_ => _.EditorModule) },

      { path: 'root1:2', loadChildren: () => import('../root1.module').then(_ => _.Root1Module) },
      { path: 'root2:2', component: Root2Component },

    ])
  ]
})
export class MainModule { }
