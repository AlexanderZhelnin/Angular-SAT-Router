import { Subscription, BehaviorSubject } from 'rxjs';
import { AfterContentInit, Directive, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';

import { SATRouterOutletComponent } from '../sat-router-outlet.component';

/**
 * Директива для обнаружения активности маршрута
 *
 * ### Свойства
 *
 * ### Контейнер маршрута
 * ```ts
 * routerOutlet: SATRouterOutletComponent | undefined
 * ```
 * #### Событие активации отслеживаемого маршрута
 * ```ts
 * isActive$: BehaviorSubject<boolean>
 * ```
 * #### Событие активации маршрута
 * ```ts
 * activated: EventEmitter<string>
 * ```
 *
 * ### Пример использования
 * ```html
 * <nav mat-tab-nav-bar>
 *   <a mat-tab-link (click)="onTabClick()"
 *      [satRouterLinkActive]="{rout_path}"
 *      [routerOutlet]="outlet"
 *      #rl="satRouterLinkActive"
 *      [active]="rl.isActive$ | async">
 *      {{Имя_закладки}}
 *   </a>
 * </nav>
 * <sat-router-outlet #outlet></sat-router-outlet>
 *```
 * @publicApi
 */
@Directive({
  selector: '[satRouterLinkActive]',
  exportAs: 'satRouterLinkActive'
})
export class SATRouterLinkActiveDirective implements OnChanges, OnDestroy, AfterContentInit
{
  /** Событие активации отслеживаемого маршрута */
  readonly isActive$ = new BehaviorSubject(false);

  /** Отслеживаемый маршрут */
  @Input()
  satRouterLinkActive?: string

  /** Событие активации маршрута */
  @Output()
  readonly activated = new EventEmitter<string>();

  //#region routerOutlet
  private _roSubs?: Subscription;
  private _routerOutlet?: SATRouterOutletComponent;

  /** Контейнер маршрута */
  get routerOutlet(): SATRouterOutletComponent | undefined { return this._routerOutlet; }
  @Input()
  set routerOutlet(value: SATRouterOutletComponent | undefined)
  {
    this._routerOutlet = value;

    this._roSubs?.unsubscribe();
    this._roSubs = value?.currentRoute$.subscribe({ next: r => this.update() });
  }
  //#endregion

  constructor()
  {

  }

  /** @nodoc */
  ngAfterContentInit(): void
  {
    this.update();
  }

  /** @nodoc */
  ngOnChanges(changes: SimpleChanges): void
  {
    this.update();
  }

  /** @nodoc */
  ngOnDestroy(): void
  {
    this._roSubs?.unsubscribe();
  }

  /** Проверка обновления активности */
  private update(): void
  {
    const masPath = this.routerOutlet?.currentRoute$?.value?.routePath?.pathAddress?.fullPath?.split('/');
    if (!masPath) return;

    const path = masPath[masPath?.length - 1];
    const isActive = (path === this.satRouterLinkActive);

    if (this.isActive$.value === isActive) return;

    this.isActive$.next(isActive);

    if (isActive)
      this.activated.emit(this.routerOutlet?.currentRoute$?.value?.routePath?.pathAddress?.fullPath);
  }

}
