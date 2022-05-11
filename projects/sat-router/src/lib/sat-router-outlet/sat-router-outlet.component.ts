import { LoadChildrenCallback } from '@angular/router';
import { Component, ElementRef, Inject, InjectionToken, Injector, Input, OnInit, Optional, SkipSelf, Type, ɵcreateInjector, OnDestroy } from '@angular/core';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { SatRouterService } from '../sat-router.service';
import { canActivate, getRealPath, routLoaders } from '../static-data';
import { RoutLoader, RoutNode } from '../rout';

/** Токен свойств */
export const SATROUT_PARAMS = new InjectionToken<Observable<Observable<any[] | undefined>>>('SATROUT_PARAMS');

/** Токен маршрутов */
export const SATROUT_LOADERS = new InjectionToken<RoutLoader[][]>('SATROUT_LOADERS');

class CContent
{
  transition = 'none';
  transform = 'translate(0, 0)';
  display: 'flex' | 'none' = 'none'
  component = new BehaviorSubject<Type<any> | undefined>(undefined);
  injector: Injector;
  constructor(injector: Injector)
  {
    this.injector = injector;
  }
}

@Component({
  selector: 'sat-router-outlet',
  templateUrl: './sat-router-outlet.component.html',
  styleUrls: ['./sat-router-outlet.component.scss']
})
export class SatRouterOutletComponent implements OnInit, OnDestroy
{
  content1: CContent;
  content2: CContent;

  @Input() name: string = '';
  @Input() direction: 'horizontal' | 'vertical' = 'horizontal';

  #params$ = new BehaviorSubject<any[] | undefined>(undefined);
  #isFirst = true;
  #subs: Subscription[] = [];
  #index = -1;

  constructor(
    private readonly element: ElementRef,
    private readonly s_router: SatRouterService,
    private readonly parentInjector: Injector,
    //@Inject(SATROUTS) private readonly routsLoader: RoutLoader[][],
    @SkipSelf() @Optional() protected readonly parent: SatRouterOutletComponent)
  {
    this.content1 = new CContent(parentInjector);
    this.content2 = new CContent(parentInjector);
  }

  ngOnInit(): void
  {
    // this.#subs.push(canActivate.canActivate$.subscribe({
    //   next: rns =>
    //   {
    //     const { cp, rt, index } = this.#getRout(rns);
    //   }
    // }));
    this.#subs.push(this.s_router.changed$.subscribe({
      next: () =>
      {
        this.#load();
      }
    }));
    this.#load();
  }

  ngOnDestroy(): void
  {
    this.#subs.forEach(s => s.unsubscribe());
  }

  #load(): Promise<void>;
  #load(c1: CContent, c2: CContent): Promise<void>;
  async #load(com1?: CContent, com2?: CContent)
  {
    if (!this.s_router.pathData) return;

    if (!com1)
    {
      if (this.#isFirst)
        this.#load(this.content1, this.content2);
      else
        this.#load(this.content2, this.content1);
      return;
    }

    const c1 = com1 as CContent;
    const c2 = com2 as CContent;

    const { cp, rt, index } = this.#getRout(this.s_router.pathData);

    if (!cp)
    {
      c1.component.next(undefined);
      return;
    }
    console.assert(!!rt, `Обработчик: "${cp.fullPath}" не существует`);

    if (!!rt?.component)
      this.#update(c1, c2, index, rt.component, cp.params);
    else if (!!rt?.loadChildren)
    {
      const ci = await this.#loadModule(cp.fullPath, rt.loadChildren);
      this.#update(c1, c2, index, ci.component, cp.params, ci.mInjector);
    }
    else
    {
      c1.component.next(undefined);
      c2.component.next(undefined);
    }
  }

  /** Получить информацию по маршруту */
  #getRout(routNodes: RoutNode[] | undefined):
    {
      cp: { fullPath: string; params: any[] | undefined; } | undefined,
      rt: RoutLoader | undefined,
      index: number
    }
  {
    let path = this.name;
    let parent = this.parent;
    while (!!parent)
    {
      path = `${parent.name}/${path}`;
      parent = parent.parent;
    }

    const cp = getRealPath(path, routNodes);

    if (!cp) return { cp, rt: undefined, index: -1 };

    const index = routLoaders.findIndex(rl => rl.path === cp.fullPath);
    return { cp, rt: (index < 0) ? undefined : routLoaders[index], index };
  }

  /** Обновить компонент */
  #update(
    c1: CContent,
    c2: CContent,
    index: number,
    component: Type<any> | undefined,
    params: any[] | undefined,
    parentInjector: Injector | undefined = undefined,
  )
  {
    if (c2.component.value !== component)
    {
      if (!c1.component.value && !c2.component.value)
      {
        c1.transition = 'none';
        c1.display = 'flex';
        setTimeout(() =>
        {
          c1.transform = 'translate(0, 0)';
          this.#loadComponent(params, c1, parentInjector, component);
          this.#isFirst = !this.#isFirst;
          this.#index = index;
        }, 50);
        return;
      }

      c1.transition = 'none';
      c2.transition = 'transform .2s';

      setTimeout(() =>
      {
        const rect = this.#rect();

        switch (this.direction)
        {
          case 'horizontal':
            if (index > this.#index)
            {
              c1.transform = `translate(${rect.width}px, 0)`;
              c2.transform = `translate(-${rect.width}px, 0)`;
            }
            else
            {
              c1.transform = `translate(-${rect.width}px, 0)`;
              c2.transform = `translate(${rect.width}px, 0)`;
            }
            break;
          case 'vertical':
            if (index > this.#index)
            {
              c1.transform = `translate(0, ${rect.height}px)`;
              c2.transform = `translate(0, -${rect.height}px)`;
            }
            else
            {
              c1.transform = `translate(0, ${rect.height}px)`;
              c2.transform = `translate(0, -${rect.height}px)`;
            }
            break;
        }
        this.#index = index;

        setTimeout(() =>
        {
          this.#loadComponent(params, c1, parentInjector, component);

          c1.display = 'flex';
          c1.transition = 'transform .2s';

          setTimeout(() =>
          {
            c1.transform = 'translate(0, 0)';
            setTimeout(() =>
            {
              c2.component.next(undefined);
              c2.display = 'none';
              this.#isFirst = !this.#isFirst;
            }, 250);
          }, 50);
        }, 50);
      }, 50);
    }
    else if (JSON.stringify(params) !== JSON.stringify(this.#params$.value))
      this.#params$.next(params);
  }

  #loadComponent(
    params: any[] | undefined,
    c: CContent,
    parentInjector: Injector | undefined,
    component: Type<any> | undefined)
  {
    this.#params$ = new BehaviorSubject(params);
    c.injector = Injector.create(
      {
        providers: [{ provide: SATROUT_PARAMS, useValue: this.#params$ }],
        parent: parentInjector ?? this.parentInjector
      });
    c.component.next(component);
  }

  async #loadModule(
    path: string,
    pr: LoadChildrenCallback)
  {
    const module = await pr();
    let component: Type<any> | undefined;

    const mInjector = ɵcreateInjector(module, this.parentInjector);

    const routs = mInjector.get(SATROUT_LOADERS);

    routs[0].forEach(r =>
    {
      if (!r.path)
        component = r.component;
      else
        this.s_router.addRout({ ...r, path: `${path}/${r.path}` });
    });

    return { component, mInjector };
    //if (!component) return;
    //this.#update(c1, c2, component, params, mInjector);
  }

  /** Получить размеры компонента */
  #rect() { return <DOMRect>this.element.nativeElement.getBoundingClientRect(); }
}
