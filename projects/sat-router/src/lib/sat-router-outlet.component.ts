import { LoadChildrenCallback } from '@angular/router';
import { Component, ElementRef, InjectionToken, Injector, Input, OnInit, Optional, SkipSelf, Type, ɵcreateInjector as createInjector, OnDestroy } from '@angular/core';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { SATRouterService } from './sat-router.service';
import { getRealPath, routLoaders } from './static-data';
import { SATRoutLoader, SATRoutNode } from './model';

/** Токен свойств */
export const SATROUT_PARAMS = new InjectionToken<Observable<Observable<any | undefined>>>('SATROUT_PARAMS');
/** Токен текщуго пути */
export const SATROUT_DIRECTION = new InjectionToken<Observable<number[]>>('SATROUT_DIRECTION');
/** Токен полного пути */
export const SATROUT_PATH = new InjectionToken<Observable<string | undefined>>('SATROUT_PATH');
/** Токен маршрутов */
export const SATROUT_LOADERS = new InjectionToken<SATRoutLoader[][]>('SATROUT_LOADERS');

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

/**
 * @description
 *
 * Контейнер маршрута, который динамически заполняется в зависимости от текущего состояния маршрутизатора.
 *
 * Каждый контейнер маршрута может иметь уникальное имя, определяемое необязательным атрибутом `name`.
 *
 * ```
 * <sat-router-outlet></sat-router-outlet>
 * <sat-router-outlet name='left'></sat-router-outlet>
 * <sat-router-outlet name='right'></sat-router-outlet>
 * ```
 *
 * Именованные контейнеры маршрута будут целями маршрута с тем же именем.
 * Объект `SATRoutNode` для именованного маршрута имеет свойство `outlet` для идентификации целевого контейнера маршрута:
 *
 * `{path: <base-path>, component: <component>, outlet: <target_outlet_name>}`
 *
 * @see `SATRouterLinkActiveDirective`
 * @see `SATRoutNode`
 * @see `SATRoutLoader`
 * @ngModule SATRouterModule
 *
 * @publicApi
 */
@Component({
  selector: 'sat-router-outlet',
  templateUrl: './sat-router-outlet.component.html',
  styleUrls: ['./sat-router-outlet.component.scss']
})
export class SATRouterOutletComponent implements OnInit, OnDestroy
{
  content1: CContent;
  content2: CContent;

  @Input() name: string = '';
  @Input() orientation: 'horizontal' | 'vertical' = 'horizontal';

  currentRout$ = new BehaviorSubject<{ path: string, direction: number[], params: any } | undefined>(undefined);

  #params$ = new BehaviorSubject<any>(undefined);
  #path$ = new BehaviorSubject<string | undefined>(undefined);
  #direction$ = new BehaviorSubject<number[]>([]);

  #isFirst = true;
  #subs: Subscription[] = [];
  #index = -1;

  readonly level: number = 0;

  constructor(
    private readonly element: ElementRef,
    private readonly s_router: SATRouterService,
    private readonly parentInjector: Injector,
    //@Inject(SATROUTS) private readonly routsLoader: SATRoutLoader[][],
    @SkipSelf() @Optional() protected readonly parent: SATRouterOutletComponent)
  {
    this.content1 = new CContent(parentInjector);
    this.content2 = new CContent(parentInjector);

    if (!!parent) this.level = parent.level + 1;
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
      c2.component.next(undefined);
      return;
    }

    //console.assert(!!rt, `Обработчик: "${cp.fullPath}" не существует`);

    if (!!rt?.component)
      this.#update(c1, c2, index, rt.component, cp.params, cp.currentPath, cp.fullPath);
    else if (!!rt?.loadChildren)
    {
      const ci = await this.#loadModule(cp.fullPath, rt.loadChildren);
      this.#update(c1, c2, index, ci.component, cp.params, cp.currentPath, cp.fullPath, ci.mInjector);
    }
    else
    {
      c1.component.next(undefined);
      c2.component.next(undefined);
    }
  }

  /** Получить информацию по маршруту */
  #getRout(routNodes: SATRoutNode[] | undefined):
    {
      cp: { fullPath: string; params: any; currentPath: number[] } | undefined,
      rt: SATRoutLoader | undefined,
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

    let index = routLoaders.findIndex(rl => rl.path === cp.fullPath);
    if (index < 0)
    {
      const masFullPath = cp.fullPath.split('/');
      const sPath = masFullPath.slice(0, -1).join('/');
      const anyPath = sPath + ((!!sPath) ? `/*` : '*');
      index = routLoaders.findIndex(rl => rl.path === anyPath);
      if (index >= 0 && !!routLoaders[index].redirectTo)
        index = routLoaders.findIndex(rl => rl.path === routLoaders[index].redirectTo);
    }
    else if (!!routLoaders[index].redirectTo)
      index = routLoaders.findIndex(rl => rl.path === routLoaders[index].redirectTo);

    return { cp, rt: (index < 0) ? undefined : routLoaders[index], index };
  }

  /** Обновить компонент */
  #update(
    c1: CContent,
    c2: CContent,
    index: number,
    component: Type<any> | undefined,
    params: any,
    direction: number[],
    path: string,
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
          this.#loadComponent(params, direction, path, c1, parentInjector, component);
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

        switch (this.orientation)
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
          this.#loadComponent(params, direction, path, c1, parentInjector, component);

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
    {
      this.currentRout$.next({ path, direction, params });
      this.#params$.next(params);
      this.#path$.next(path);
      this.#direction$.next(direction);
    }
  }

  #loadComponent(
    params: any,
    direction: number[],
    path: string,
    c: CContent,
    parentInjector: Injector | undefined,
    component: Type<any> | undefined)
  {
    this.currentRout$.next({ path, direction, params });
    this.#params$ = new BehaviorSubject(params);
    this.#path$ = new BehaviorSubject<string | undefined>(path);
    this.#direction$ = new BehaviorSubject(direction);

    c.injector = Injector.create(
      {
        providers: [
          { provide: SATROUT_PARAMS, useValue: this.#params$ },
          { provide: SATROUT_DIRECTION, useValue: this.#direction$ },
          { provide: SATROUT_PATH, useValue: this.#path$ }


        ],
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


    const mInjector = createInjector(module, this.parentInjector);

    const routs = mInjector.get(SATROUT_LOADERS);

    routs[0].forEach(r =>
    {
      const redirectTo = (!!r.redirectTo) ? `${path}/${r.redirectTo}` : undefined;

      if (!r.path)
        component = r.component;
      else
        this.s_router.addRout({ ...r, path: `${path}/${r.path}`, redirectTo });
    });

    return { component, mInjector };
    //if (!component) return;
    //this.#update(c1, c2, component, params, mInjector);
  }

  /** Получить размеры компонента */
  #rect() { return <DOMRect>this.element.nativeElement.getBoundingClientRect(); }
}
