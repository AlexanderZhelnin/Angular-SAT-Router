import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { ISATRouteResolver } from './model';
import { SATRouterOutletComponent, SAT_ROUTE_RESOLVERS } from './sat-router-outlet.component';
import { SATRouterLinkActiveDirective } from './directives/sat-router-link-active.directive';


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
 * распознаватели маршрутов.
 *
 * @example
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
  static create(routs: ISATRouteResolver[] | Observable<ISATRouteResolver[]>): ModuleWithProviders<SATRouterModule>
  {
    return {
      ngModule: SATRouterModule, providers: [
        { provide: SAT_ROUTE_RESOLVERS, useValue: routs }
      ]
    }
  }

}
