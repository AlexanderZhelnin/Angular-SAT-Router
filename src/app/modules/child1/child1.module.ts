import { ModuleWithProviders, NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SATRouterModule, SATRouterService } from 'sat-router';
import { Child1Sub1Component } from './child1-sub1.component';
import { Child1Sub2Component } from './child1-sub2.component';
import { Child1Component } from './child1.component';
import { TabsModule } from 'src/app/tabs/tabs.module';

@NgModule({
  declarations: [
    Child1Component,
    Child1Sub1Component,
    Child1Sub2Component,

  ],
  imports: [
    CommonModule,
    TabsModule,
    SATRouterModule.forChildren(
      { path: '', component: Child1Component },
      { path: `subChild1:0`, component: Child1Sub1Component },
      { path: `subChild2:0`, component: Child1Sub2Component },
      { path: `subChild3:1`, component: Child1Sub1Component },
      { path: `subChild4:1`, component: Child1Sub2Component }

      //{ path: '*', redirectTo: 'subChild1:0' }
      )
  ],
  providers: []
})
export class Child1Module
{

}
