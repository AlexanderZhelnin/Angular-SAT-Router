import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule, Type } from '@angular/core';
import { LoadChildrenCallback } from '@angular/router';
import { SafeStylePipe } from './pipes/safe-style.pipe';
import { RoutLoader } from './rout';
import { SatRouterOutletComponent, SATROUT_LOADERS } from './sat-router-outlet/sat-router-outlet.component';
import { routLoaders } from './static-data';


@NgModule({
  declarations: [
    SafeStylePipe,
    SatRouterOutletComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    SatRouterOutletComponent
  ]
})
export class SatRouterModule
{
  static forChildren(...routs: RoutLoader[]): ModuleWithProviders<SatRouterModule>
  {
    return {
      ngModule: SatRouterModule, providers: [
        { provide: SATROUT_LOADERS, useValue: routs, multi: true }
      ]
    }
  }

  static forRoot(...routs: RoutLoader[]): ModuleWithProviders<SatRouterModule>
  {
    routLoaders.push(...routs);

    return {
      ngModule: SatRouterModule, providers: [
        { provide: SATROUT_LOADERS, useValue: routs, multi: true }
      ]
    }
  }
}
