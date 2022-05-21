import { Root1Component } from './root1.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SATRouterModule } from 'sat-router';


@NgModule({
  declarations: [
    Root1Component
  ],
  imports: [
    CommonModule,
    SATRouterModule.create([
      {
        path: '', component: Root1Component,
        //canUnload: false,
      },
      { path: 'child1', loadChildren: () => import('./child1/child1.module').then(_ => _.Child1Module) },
      { path: '*', redirectTo: 'child1' }]
    )
  ],
  providers: []
})
// Применение декоратора дочерних маршрутов
export class Root1Module
{

}
