import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { SafeStylePipe } from './pipes/safe-style.pipe';
import { RoutLoader } from './model';
import { SATRouterOutletComponent, SATROUT_LOADERS } from './sat-router-outlet.component';
import { routLoaders } from './static-data';
import { SatRouterLinkActiveDirective } from './directives/sat-router-link-active.directive';


@NgModule({
  declarations: [
    SafeStylePipe,
    SATRouterOutletComponent,
    SatRouterLinkActiveDirective
  ],
  imports: [
    CommonModule
  ],
  exports: [
    SATRouterOutletComponent,
    SatRouterLinkActiveDirective
  ]
})
export class SATRouterModule
{
  static forChildren(...routs: RoutLoader[]): ModuleWithProviders<SATRouterModule>
  {
    return {
      ngModule: SATRouterModule, providers: [
        { provide: SATROUT_LOADERS, useValue: routs, multi: true }
      ]
    }
  }

  static forRoot(...routs: RoutLoader[]): ModuleWithProviders<SATRouterModule>
  {
    routLoaders.push(...routs);

    return {
      ngModule: SATRouterModule, providers: [
        { provide: SATROUT_LOADERS, useValue: routs, multi: true }
      ]
    }
  }
}
