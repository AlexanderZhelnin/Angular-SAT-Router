import { Subscription, BehaviorSubject } from 'rxjs';
import { AfterContentInit, Directive, EventEmitter, Injector, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';

import { SATRouterOutletComponent } from '../sat-router-outlet.component';
import { MatTabLink } from '@angular/material/tabs';

/**
 * Директива для обнаружения активности маршрута
 * ```
 * <nav mat-tab-nav-bar>
 *   <a mat-tab-link (click)="onClick1()"
 *      [satRouterLinkActive]="{rout_path}"
 *      [routerOutlet]="outlet">
 *     {{Имя_закладки}}
 *   </a>
 *
 *   <a mat-tab-link (click)="onClick2()"
 *      [satRouterLinkActive]="{rout_path}"
 *      [routerOutlet]="outlet">
 *     {{Имя_закладки}}
 *   </a>
 * </nav>
 * <sat-router-outlet #outlet></sat-router-outlet>
```
 */
@Directive({
  selector: '[satRouterLinkActive]',
  exportAs: 'satRouterLinkActive'
})
export class SATRouterLinkActiveDirective implements OnChanges, OnDestroy, AfterContentInit
{
  isActive$ = new BehaviorSubject(false);

  @Input()
  satRouterLinkActive?: string

  @Output()
  activated = new EventEmitter<string>();

  //#region routerOutlet
  private _roSubs?: Subscription;
  private _routerOutlet?: SATRouterOutletComponent;
  get routerOutlet(): SATRouterOutletComponent | undefined { return this._routerOutlet; }
  @Input()
  set routerOutlet(value: SATRouterOutletComponent | undefined)
  {
    this._routerOutlet = value;

    this._roSubs?.unsubscribe();
    this._roSubs = value?.currentRoute$.subscribe({ next: r => this.update() });
  }
  //#endregion

  constructor(private mtl: MatTabLink)
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

    this.mtl.active = isActive;


    if (isActive)
      this.activated.emit(this.routerOutlet?.currentRoute$?.value?.routePath?.pathAddress?.fullPath);
  }

}
