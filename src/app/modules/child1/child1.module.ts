import { ModuleWithProviders, NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Child1Component } from './child1/child1.component';
import { SatRouterModule, SatRouterService } from 'sat-router';
import { SubChild1Component } from './subchild1/subchild1.component';
import { LoadChildrenCallback } from '@angular/router';

@NgModule({
  declarations: [
    Child1Component,
    SubChild1Component
  ],
  imports: [
    CommonModule,
    SatRouterModule.forChildren(
      { path: '', component: Child1Component },
      { path: ':left', component: Child1Component },
      { path: ':right', component: Child1Component })
  ],
  providers: []
})
// Применение декоратора дочерних маршрутов
// @SatRouterForChildren(
//   { path: '', component: Child1Component },
//   { path: ':left', component: Child1Component },
//   { path: ':right', component: Child1Component })
export class Child1Module
{

}
