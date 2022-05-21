import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoutePath, SATRouterModule } from 'sat-router';
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
    SATRouterModule.create([
      { path: '', component: Child1Component },
      { path: 'subChild1:0', component: Child1Sub1Component },
      {
        path: 'subChild2:0', component: Child1Sub2Component,
        canDeactivate: {
          canDeActivate: async (component: any, state: RoutePath) =>
          {
            alert(`нельзя покинуть маршрут "subChild2:0"`)
            return false;
          }
        }
      },
      { path: 'subChild3:1', component: Child1Sub1Component },
      {
        path: 'subChild4:1', component: Child1Sub2Component,
        canActivate:
        {
          canActivate: async (state: RoutePath) =>
          {
            alert(`нельзя перейти в маршрут "subChild4:1"`)
            return false;
          }
        }
        , redirectTo: 'subChild3:1'
      }

      //{ path: '*', redirectTo: 'subChild1:0' }
    ])
  ],
  providers: []
})
export class Child1Module
{

}
