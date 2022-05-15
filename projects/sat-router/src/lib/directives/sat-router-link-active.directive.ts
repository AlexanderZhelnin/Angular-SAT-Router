import { Subscription, BehaviorSubject } from 'rxjs';
import { AfterContentInit, ChangeDetectorRef, Directive, ElementRef, Input, OnChanges, OnDestroy, Renderer2, SimpleChanges } from '@angular/core';
import { SATRouterService } from '../sat-router.service';
import { SATRouterOutletComponent } from '../sat-router-outlet.component';


/**
 * Директива для обнаружения активности маршрута
 */
@Directive({
  selector: '[satRouterLinkActive]',
  exportAs: 'satRouterLinkActive'
})
export class SatRouterLinkActiveDirective implements OnChanges, OnDestroy, AfterContentInit
{
  isActive$ = new BehaviorSubject(false);

  @Input()
  satRouterLinkActive?: string

  //#region routerOutlet
  #roSubs?: Subscription;
  #routerOutlet?: SATRouterOutletComponent;
  get routerOutlet(): SATRouterOutletComponent | undefined { return this.#routerOutlet; }
  @Input()
  set routerOutlet(value: SATRouterOutletComponent | undefined)
  {
    this.#routerOutlet = value;

    this.#roSubs?.unsubscribe();
    this.#roSubs = value?.currentRout$.subscribe({ next: r => this.#update() });
  }
  //#endregion

  /** @nodoc */
  ngAfterContentInit(): void
  {
    this.#update();
  }

  /** @nodoc */
  ngOnChanges(changes: SimpleChanges): void
  {
    this.#update();
  }

  /** @nodoc */
  ngOnDestroy(): void
  {
    this.#roSubs?.unsubscribe();
  }

  /** Проверка обновления активности */
  #update(): void
  {
    const masPath = this.routerOutlet?.currentRout$?.value?.path?.split('/');
    if (!masPath) return;

    const path = masPath[masPath?.length - 1];
    const isActive = (path === this.satRouterLinkActive);

    if (this.isActive$.value === isActive) return;

    this.isActive$.next(isActive);
  }

}
