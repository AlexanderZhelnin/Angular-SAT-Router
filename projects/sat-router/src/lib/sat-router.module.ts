import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { SafeStylePipe } from './pipes/safe-style.pipe';
import { SATRoutLoader } from './model';
import { SATRouterOutletComponent, SATROUT_LOADERS } from './sat-router-outlet.component';
import { routLoaders } from './static-data';
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
 * * `forRoot()` метод создает `NgModule`, который содержит все директивы и заданные
 * загрузчики маршрутов для корневого модуля.
 *
 * ```ts
 *   imports: [
 *     SATRouterModule.forRoot(
 *       // Загрузка определённого компонента
 *       { path: 'root1', component: RootComponent },
 *       // Динамически загружаемый модуль
 *       { path: 'root2', loadChildren: () =>
 *         import('./modules/root2.module').then(_ => _.Root2Module) }
 *     )
 *   ],
 * ```
 * * `forChild()` метод создает `NgModule`, который содержит все директивы и заданные
 * загрузчики маршрутов для дочерних модулей.
 *
 * ```ts
 *   imports: [
 *     SATRouterModule.forChildren(
 *       // корневой маршрут модуля
 *       { path: '', component: Child1Component },
 *       // маршрут для дочернего контейнера маршрутов
 *       { path: 'subChild1', component: SubChild1 },
 *       { path: 'subChild2', component: SubChild2 },
 *       // Динамически загружаемый модуль
 *       { path: 'subChild2', loadChildren: () =>
 *         import('./modules/sub-child2.module').then(_ => _.SubChild2dModule) }
 *     )
 *   ],
 * ```
 *
 * @publicApi
 */
@NgModule({
  declarations: [
    SafeStylePipe,
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
  static forChildren(...routs: SATRoutLoader[]): ModuleWithProviders<SATRouterModule>
  {
    return {
      ngModule: SATRouterModule, providers: [
        { provide: SATROUT_LOADERS, useValue: routs, multi: true }
      ]
    }
  }

  static forRoot(...routs: SATRoutLoader[]): ModuleWithProviders<SATRouterModule>
  {
    routLoaders.push(...routs);

    return {
      ngModule: SATRouterModule, providers: [
        { provide: SATROUT_LOADERS, useValue: routs, multi: true }
      ]
    }
  }
}
