import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { SATRouteLoader } from './model';
import { SATRouterOutletComponent, SAT_ROUTE_LOADERS } from './sat-router-outlet.component';
//import { routeLoaders } from './static-data';
import { SATRouterLinkActiveDirective } from './directives/sat-router-link-active.directive';
import { routeLoaders } from './static-data';


/**
 * @description
 *
 * Добавляет директивы и сервисы для навигации внутри приложения между представлениями,
 * определенными в приложении.
 *
 * Вы можете импортировать этот NgModule несколько раз, по одному разу
 * для каждого модуля с отложенной загрузкой.
 * Существует два способа регистрации маршрутов при импорте этого модуля
 *
 * * `create()` метод создает `NgModule`, который содержит все директивы и заданные
 * загрузчики маршрутов.
 *
 * ```ts
 *   imports: [
 *     SATRouterModule.create(
 *       // Загрузка определённого компонента
 *       { path: 'root1', component: RootComponent },
 *       // Динамически загружаемый модуль
 *       { path: 'root2', loadChildren: () =>
 *         import('./modules/root2.module').then(_ => _.Root2Module) }
 *     )
 *   ],
 * ```
 *
 * @publicApi
 */
@NgModule({
  declarations: [
    SATRouterOutletComponent,
    SATRouterLinkActiveDirective
  ],
  imports: [
    CommonModule
  ],
  exports: [
    SATRouterOutletComponent,
    SATRouterLinkActiveDirective
  ]
})
export class SATRouterModule
{
  static create(routs: SATRouteLoader[] | Observable<SATRouteLoader[]>): ModuleWithProviders<SATRouterModule>
  {
    return {
      ngModule: SATRouterModule, providers: [
        { provide: SAT_ROUTE_LOADERS, useValue: routs }
      ]
    }
  }

}
