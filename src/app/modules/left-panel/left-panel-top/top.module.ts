import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SATRouterModule } from 'sat-router';
import { LeftPanelTopComponent } from './left-panel-top.component';
import { FileTreeComponent } from './file-tree/file-tree.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { GitComponent } from './git/git.component';

@NgModule({
  declarations: [
    LeftPanelTopComponent,
    FileTreeComponent,
    GitComponent
  ],
  imports: [
    CommonModule,
    MatTabsModule,
    MatListModule,
    SATRouterModule.create([
      { path: '', component: LeftPanelTopComponent },
      { path: 'files', component: FileTreeComponent },
      { path: 'git', component: GitComponent },

      // { path: 'top:0', component: LeftPanelTopComponent },
      // { path: 'bottom:1', component: LeftPanelTopComponent }
    ])

  ]
})
export class TopModule { }
