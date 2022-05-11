import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { of } from 'rxjs';
import { SatRouterModule, RoutNode, SATROUT_LINK_PARSE, SATROUT_LINK_STRINGIFY } from 'sat-router';

import { AppComponent } from './app.component';
//import { Child1Component } from './modules/child1/child1/child1.component';
import { Root1Component } from './modules/root1/root1.component';
import { Root2Component } from './modules/root2/root2.component';

@NgModule({
  declarations: [
    AppComponent,
    Root1Component,
    Root2Component,
    //Child1Component,
  ],
  imports: [
    BrowserModule,
    SatRouterModule.forRoot(
      { path: 'root1', component: Root1Component },
      { path: 'root2', component: Root2Component },
      { path: 'root1:rootRight', loadChildren: () => import('./modules/child1/child1.module').then(_ => _.Child1Module) },
      { path: 'root1/1', loadChildren: () => import('./modules/child1/child1.module').then(_ => _.Child1Module) }
    )
  ],
  providers: [
    {
      provide: SATROUT_LINK_PARSE,
      useValue: (link: string) =>
      {
        link = /sat-link:([a-z0-9==]+)/img.exec(link)?.[1] ?? '';
        return of(JSON.parse(decodeURIComponent(decodeURI(window.atob(link)))));
      }
    },
    {
      provide: SATROUT_LINK_STRINGIFY,
      useValue: (rs: RoutNode[]) => of(`#sat-link:${window.btoa(encodeURI(encodeURIComponent(JSON.stringify(rs))))}`)
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule
{


}
