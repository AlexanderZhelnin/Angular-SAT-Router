import { Component, ElementRef, InjectionToken, Injector, Input, OnInit, Optional, SkipSelf, ɵcreateInjector as createInjector, OnDestroy, ViewChild, Renderer2, ChangeDetectorRef, ViewContainerRef, Inject, InjectFlags } from '@angular/core';
import { Observable, BehaviorSubject, Subscription, firstValueFrom } from 'rxjs';
import { SATRouterService } from './sat-router.service';
import { ISATRouteResolver, ISATStateNode, ISATCanDeActivate, type RoutePath, ISATRouteConfiguration } from './model';
import { allCanActivateDeactivated, routeResolvers, type canActivateDeActivateResult } from './static-data';

/** Токен свойств */
export const SAT_ROUTE_PARAMS = new InjectionToken<Observable<any | undefined>>('SAT_ROUTE_PARAMS');
/** Токен текущего пути */
export const SAT_ROUTE_ADDRESS = new InjectionToken<Observable<number[]>>('SAT_ROUTE_ADDRESS');
/** Токен полного пути */
export const SAT_ROUTE_PATH = new InjectionToken<Observable<string | undefined>>('SAT_ROUTE_PATH');
/** Токен распознавателей маршрутов */
export const SAT_ROUTE_RESOLVERS = new InjectionToken<ISATRouteResolver[] | BehaviorSubject<ISATRouteResolver[]>>('SAT_ROUTE_RESOLVERS');

/** Токен конфигурации */
export const SAT_ROUTE_CONFIGURATION = new InjectionToken<ISATRouteConfiguration>('SAT_ROUTE_CONFIGURATION');

/** Данные маршрута с распознавателем */
type Route = { routePath: RoutePath, routeResolver: ISATRouteResolver };//RouteResolver };
/** Данные маршрута с распознавателем и инжектором */
type RouteAndInjector = Route & { injector?: Injector };

/** Получить реальный маршрута из иерархии */
function getRealPath(path: string, pathData?: ISATStateNode[]): RoutePath | undefined
{
  const masPath = path?.split('/');
  if ((masPath?.length ?? 0) === 0) return undefined;

  let result: string | undefined = '';
  let address: number[] = [];
  let stateNode: ISATStateNode | undefined;

  masPath.reduce((ds, name) =>
  {
    const index = ds?.findIndex(item => (item.outlet ?? '') === name) ?? -1;
    if (index < 0)
    {
      result += '/*';
      stateNode = undefined;
      return [];
    }

    address.push(index);
    const r = ds![index];

    result += `/${(r?.path ?? '') + ((!!r?.outlet) ? `:${r.outlet}` : '')}`;
    stateNode = r;
    return r?.children ?? []
  }, pathData)

  return (result === undefined)
    ? undefined
    : {
      pathAddress: {
        fullPath: (result[0] === '/')
          ? result.substring(1)
          : result,
        address: address
      },
      stateNode: stateNode!

    };
}

function deepClone<T>(v: T): T
{
  if (Array.isArray(v))
    return [...(v as any[]).map(m => deepClone(m))] as any;
  else if (typeof v === 'object')
  {
    const clObj: { [key: string]: any } = {};
    for (const key in v)
      clObj[key] = deepClone(v[key]);

    return clObj as T;
  }
  else return v;

}

class CContent
{
  /** Загруженный компонент, нужен например в проверке можно ли деактивировать */
  component: any;
  /** Полные данные маршрута */
  routeAndInjector?: RouteAndInjector
  /** Observable параметров загруженного компонента */
  params$ = new BehaviorSubject<any>(undefined);
  /** Observable пути загруженного компонента */
  path$ = new BehaviorSubject<string | undefined>(undefined);
  /** Observable адреса состояния загруженного компонента */
  address$ = new BehaviorSubject<number[]>([]);

  constructor(
    public injector: Injector,
    public view: ViewContainerRef,
    public content: HTMLDivElement)
  {

  }
}

/**
 * Контейнер маршрута
 *
 * @description Динамически заполняется в зависимости от текущего состояния маршрутизатора *
 *
 * @property name - Необходимо для идентификации контейнера в маршруте
 * @property orientation - Служит для анимации перехода
 * @property currentRoute$ - Текущие данные маршрута с распознавателем *
 * @property childrenOutlet - Дочерние контейнеры маршрута
 * @property parentOutlet - Родительский контейнер маршрута
 * @property level - Уровень вложенности
 *
 * @example
 * ```html
 * <sat-router-outlet></sat-router-outlet>
 * <sat-router-outlet name='left'></sat-router-outlet>
 * <sat-router-outlet name='right'></sat-router-outlet>
 * ```
 *
 * Именованные контейнеры маршрута будут целями маршрута с тем же именем.
 * Объект `SATStateNode` для именованного маршрута имеет свойство `outlet` для идентификации целевого контейнера маршрута:
 *
 * `{path: <base-path>, component: <component>, outlet: <target_outlet_name>}`
 *
 * @see `SATRouterLinkActiveDirective`
 * @see `SATStateNode`
 * @see `SATRouteResolver`
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

  /**
   * Имя контейнера
   * @description Необходимо для идентификации контейнера в маршруте
   */
  @Input() name: string = '';

  /**
   * Ориентация контейнера
   * @description служит для анимации перехода
   * @default 'horizontal'
   */
  @Input() orientation: 'horizontal' | 'vertical' = 'horizontal';

  @ViewChild('contentDiv1', { static: true }) private contentDiv1?: ElementRef<any>;
  @ViewChild('contentDiv2', { static: true }) private contentDiv2?: ElementRef<any>;

  @ViewChild('placeholder1', { read: ViewContainerRef, static: true }) private view1?: ViewContainerRef;
  @ViewChild('placeholder2', { read: ViewContainerRef, static: true }) private view2?: ViewContainerRef;

  private content1!: CContent;
  private content2!: CContent;

  /** Текущие данные маршрута с загрузчиком */
  readonly currentRoute$ = new BehaviorSubject<Route | undefined>(undefined);
  /** Уровень вложенности */
  readonly level: number = 0;

  /** Дочерние контейнеры маршрута*/
  readonly childrenOutlet: ReadonlyArray<SATRouterOutletComponent> = [];

  private _isFirst = true;
  private _subs: Subscription[] = [];

  constructor(
    private readonly element: ElementRef,
    private readonly s_router: SATRouterService,
    private readonly parentInjector: Injector,
    private readonly renderer: Renderer2,
    private readonly cdr: ChangeDetectorRef,
    @Optional() @Inject(SAT_ROUTE_CONFIGURATION) private readonly settings: ISATRouteConfiguration,
    /** Родительский контейнер маршрута */
    @SkipSelf() @Optional() public readonly parentOutlet: SATRouterOutletComponent)
  {
    if (!parentOutlet) return;
    this.level = parentOutlet.level + 1;
    (parentOutlet.childrenOutlet as SATRouterOutletComponent[]).push(this);
  }

  ngOnInit(): void
  {
    allCanActivateDeactivated.push(this);
    this.content1 = new CContent(this.parentInjector, this.view1!, this.contentDiv1!.nativeElement);
    this.content2 = new CContent(this.parentInjector, this.view2!, this.contentDiv2!.nativeElement);

    // если есть настройки, то подписываемся на изменение данных маршрута
    if (this.settings?.debug)
    {
      this.renderer.addClass(this.element.nativeElement, 'sat_route_debug');
      this.currentRoute$.subscribe({
        next: fi =>
        {
          this.renderer.setAttribute(this.element.nativeElement, 'data-sat_route_path', fi?.routePath?.pathAddress?.fullPath ?? 'Не найден');
        }
      });
    }

    this._subs.push(
      this.s_router.changed$.subscribe({ next: () => this.load() })
    );
    this.load();
  }

  ngOnDestroy(): void
  {
    let index = allCanActivateDeactivated.indexOf(this);
    if (index > -1) allCanActivateDeactivated.splice(index, 1);
    if (!!this.parentOutlet)
    {
      index = this.parentOutlet.childrenOutlet.indexOf(this);
      (this.parentOutlet.childrenOutlet as SATRouterOutletComponent[]).splice(index, 1);
    }

    //allCanDeactivated = allCanDeactivated.filter(o => o !== this);
    this._subs.forEach(s => s.unsubscribe());
  }

  private load(): Promise<void>;
  private load(c1: CContent, c2: CContent): Promise<void>;
  private async load(com1?: CContent, com2?: CContent)
  {
    if (!this.s_router.state) return;

    if (!com1)
    {
      if (this._isFirst)
        this.load(this.content1, this.content2);
      else
        this.load(this.content2, this.content1);
      return;
    }

    const c1 = com1 as CContent;
    const c2 = com2 as CContent;

    const r = await this.getRouteAsync(this.s_router.state);

    if (!r)
    {
      this.clear();
      return;
    }

    //console.assert(!!rt, `Обработчик: "${cp.fullPath}" не существует`);

    await this.loadUpdate(r, c1, c2);
  }

  /** Загрузка или обновление компонента */
  private async loadUpdate(r: Route, c1: CContent, c2: CContent)
  {
    if (!!r.routeResolver.loadChildren)
    {
      const rm = await this.loadModuleAsync(r);
      this.update(c1, c2, rm);
    }
    else if (!!r.routeResolver.component)
      this.update(c1, c2, r);
    else
      this.clear();
  }

  private clear(): void;
  private clear(c: CContent): void;
  private clear(c?: CContent): void
  {
    if (!c)
    {
      this.clear(this.content1);
      this.clear(this.content2);
      return;
    }

    c.routeAndInjector = undefined;
    c.view.clear();

    this.cdr.markForCheck();
  }

  /** Получить информацию по маршруту */
  private async getRouteAsync(routeNodes: ISATStateNode[] | undefined): Promise<Route | undefined>
  {
    let path = this.name;
    let parent = this.parentOutlet;
    while (!!parent)
    {
      path = `${parent.name}/${path}`;
      parent = parent.parentOutlet;
    }

    const rp = getRealPath(path, routeNodes);

    if (!rp) return undefined;

    await this.rootResolversAsync(this.parentInjector);

    let index = routeResolvers.findIndex(rl => rl.path === rp.pathAddress.fullPath);
    if (index < 0)
    {
      const masFullPath = rp.pathAddress.fullPath.split('/');
      const sPath = masFullPath.slice(0, -1).join('/');
      const anyPath = sPath + ((!!sPath) ? `/*` : '*');

      index = routeResolvers.findIndex(rl => rl.path === anyPath);
      index = await this.checkCanLoadAndRedirectAsync(index, rp);
    }
    else
      index = await this.checkCanLoadAndRedirectAsync(index, rp);

    return (index < 0)
      ? undefined
      : { routePath: rp, routeResolver: { ...routeResolvers[index] } };
  }

  /** Проверяем маршрут на возможность загрузки и перенаправление на другой маршрут */
  private async checkCanLoadAndRedirectAsync(index: number, rp: RoutePath)
  {
    if (index < 0) return -1;
    let rl = routeResolvers[index];
    if (!!rl.component || !!rl.loadChildren)
    {
      if (!await this.canActivateAsync(rl, rp))
      {
        if (!!rl.redirectTo)
        {
          index = routeResolvers.findIndex(rll => rll.path === rl.redirectTo);
          index = await this.checkCanLoadAndRedirectAsync(index, rp);
          if (index >= 0)
          {

            if (this.previewContent.routeAndInjector?.routePath?.pathAddress?.fullPath === routeResolvers[index].path)
            {
              rp.pathAddress = this.previewContent.routeAndInjector.routePath.pathAddress;
              rp.stateNode = this.previewContent.routeAndInjector.routePath.stateNode;

              const n = this.s_router.getNode(this.s_router.state ?? [], rp.pathAddress.address, true);
              if (!!n?.children) n.children[rp.pathAddress.address[rp.pathAddress.address.length - 1]] = rp.stateNode;
            }
            else
            {
              rp.pathAddress.fullPath = routeResolvers[index].path;

              const masPath = rp.pathAddress.fullPath.split('/');
              const [path, outlet] = masPath[masPath.length - 1].split(':');

              rp.stateNode = { path, outlet };
              const n = this.s_router.getNode(this.s_router.state ?? [], rp.pathAddress.address, true);
              if (!!n?.children)
                n.children[rp.pathAddress.address[rp.pathAddress.address.length - 1]] = rp.stateNode;
            }

            await this.s_router.updateHistoryAsync();
          }

          return index;
        }
        return -1;
      }
    }
    else
    {
      if (!!rl.redirectTo)
      {
        index = routeResolvers.findIndex(rll => rll.path === rl.redirectTo);
        index = await this.checkCanLoadAndRedirectAsync(index, rp);
        if (index >= 0) rp.pathAddress.fullPath = routeResolvers[index].path;
        return index;
      }

      return -1;
    }
    return index;
  }

  /** Обновить компонент */
  private update(
    c1: CContent,
    c2: CContent,
    rAi?: RouteAndInjector
  )
  {
    if (!rAi)
    {
      this.clear();
      return;
    }
    const ri = rAi!;

    if (c2.routeAndInjector?.routeResolver.component === ri.routeResolver.component &&
      JSON.stringify(c2.params$.value) === JSON.stringify(ri.routePath.stateNode?.params))
    {
      if (!!c2.routeAndInjector?.routePath)
        c2.routeAndInjector.routePath = ri.routePath;
      return;
    }

    if (ri.routeResolver.alwaysNew || c2.routeAndInjector?.routeResolver.component !== ri.routeResolver.component)
    {
      if (!c1.routeAndInjector?.routeResolver?.component && !c2.routeAndInjector?.routeResolver?.component)
      {
        this.renderer.setStyle(c1.content, 'transition', 'none');
        this.renderer.setStyle(c1.content, 'display', 'flex');
        this.renderer.setStyle(c1.content, 'transform', 'translate(0, 0)');
        this.renderer.setStyle(c2.content, 'display', 'none');
        this.loadComponent(c1, ri);
        this._isFirst = !this._isFirst;
        //this._index = ri.routeLoader.index;
        return;
      }

      const observer = new MutationObserver((el) =>
      {
        this.renderer.setStyle(c1.content, 'transition', 'transform .2s');
        this.renderer.setStyle(c1.content, 'transform', 'translate(0, 0)');
        this._isFirst = !this._isFirst;
        setTimeout(() =>
        {
          if (c2.routeAndInjector?.routeResolver.canUnload !== false)
            this.clear(c2);

          this.renderer.setStyle(c2.content, 'display', 'none');
          this.cdr.markForCheck();
        }, 250);
        observer.disconnect();
      });
      observer.observe(c1.content, { attributes: true });

      this.renderer.setStyle(c1.content, 'transition', 'none');
      this.renderer.setStyle(c2.content, 'transition', 'transform .2s');
      const rect = this.rect();

      const index1 = routeResolvers.findIndex(r => r.path === ri.routeResolver.path);
      const index2 = routeResolvers.findIndex(r => r.path === c2.routeAndInjector?.routeResolver?.path);

      switch (this.orientation)
      {
        case 'horizontal':
          if (index1 > index2)
          {
            this.renderer.setStyle(c1.content, 'transform', `translate(${rect.width}px, 0)`);
            this.renderer.setStyle(c2.content, 'transform', `translate(-${rect.width}px, 0)`);
          }
          else
          {
            this.renderer.setStyle(c1.content, 'transform', `translate(-${rect.width}px, 0)`);
            this.renderer.setStyle(c2.content, 'transform', `translate(${rect.width}px, 0)`);

            // c1.transform = `translate(-${rect.width}px, 0)`;
            // c2.transform = `translate(${rect.width}px, 0)`;
          }
          break;
        case 'vertical':
          if (index1 > index2)
          {
            this.renderer.setStyle(c1.content, 'transform', `translate(0, ${rect.height}px)`);
            this.renderer.setStyle(c2.content, 'transform', `translate(0, -${rect.height}px)`);
          }
          else
          {
            this.renderer.setStyle(c1.content, 'transform', `translate(0, -${rect.height}px)`);
            this.renderer.setStyle(c2.content, 'transform', `translate(0, ${rect.height}px)`);
          }
          break;
      }

      this.loadComponent(c1, ri);
      this.renderer.setStyle(c1.content, 'display', 'flex');
      return;
    }
    else if (JSON.stringify(ri.routePath.stateNode?.params) !== JSON.stringify(c2.params$.value))
    {
      this.currentRoute$.next(ri);
      c2.params$.next(ri.routePath.stateNode.params);
      c2.path$.next(ri.routePath.pathAddress.fullPath);
      c2.address$.next(ri.routePath.pathAddress.address);
    }
    c2.routeAndInjector = ri;
  }

  private loadComponent(
    c: CContent,
    ri: RouteAndInjector
  ): void
  {
    this.currentRoute$.next(ri);

    if (c.routeAndInjector?.routeResolver.component === ri.routeResolver.component)
    {
      c.params$.next(ri.routePath.stateNode?.params);
      c.path$.next(ri.routePath.pathAddress.fullPath);
      c.address$.next(ri.routePath.pathAddress.address);
      c.routeAndInjector = ri;
      return;
    }

    c.routeAndInjector = ri;

    c.params$ = new BehaviorSubject(ri.routePath.stateNode?.params);
    c.path$ = new BehaviorSubject<string | undefined>(ri.routePath.pathAddress.fullPath);
    c.address$ = new BehaviorSubject(ri.routePath.pathAddress.address);

    c.injector = Injector.create(
      {
        providers: [
          { provide: SAT_ROUTE_PARAMS, useValue: c.params$ },
          { provide: SAT_ROUTE_ADDRESS, useValue: c.address$ },
          { provide: SAT_ROUTE_PATH, useValue: c.path$ }
        ],
        parent: ri.injector ?? this.parentInjector
      });

    const component = ri.routeResolver.component;
    c.view.clear();
    if (!!component)
      c.component = c.view.createComponent(component, { injector: c.injector }).instance;

    this.cdr.markForCheck();
  }

  private async loadModuleAsync(route: Route): Promise<RouteAndInjector>
  {
    if (!route.routeResolver.loadChildren) return route;

    const module = await route.routeResolver.loadChildren();
    let resolver: ISATRouteResolver | undefined;

    const injector = createInjector(module, this.parentInjector);
    const routs = injector.get(SAT_ROUTE_RESOLVERS);
    const path = route.routePath.pathAddress.fullPath;


    for (let i = routeResolvers.length - 1; i >= 0; i--)
      if (routeResolvers[i].path.startsWith(path) && routeResolvers[i].path !== path)
        routeResolvers.splice(i, 1);

    const resolvers = await ((routs instanceof Observable)
      ? firstValueFrom(routs)
      : new Promise((resolve: (value: ISATRouteResolver[]) => void) => resolve(routs)));

    resolvers.forEach(r =>
    {
      if (!r.path)
        resolver = r;
      else
        routeResolvers.push({
          ...r,
          path: `${path}/${r.path}`,
          redirectTo: (!!r.redirectTo) ? `${path}/${r.redirectTo}` : undefined
        });
    });

    if (!resolver) return route;

    route = deepClone(route);
    route.routeResolver = { ...resolver }
    return { ...route, injector };
  }

  private static rootResolvers?: ISATRouteResolver[];
  /** Находим корневые пути */
  private async rootResolversAsync(injector: Injector)
  {
    if (!!SATRouterOutletComponent.rootResolvers) return;
    let resolvers = injector.get(SAT_ROUTE_RESOLVERS, undefined);
    let parent = injector.get(Injector, undefined, InjectFlags.SkipSelf);
    while (!!parent)
    {
      const parentResolvers = parent.get(SAT_ROUTE_RESOLVERS, undefined);
      if (!!parentResolvers && parentResolvers !== resolvers)
        resolvers = parentResolvers;

      const newParent = parent.get(Injector, undefined, InjectFlags.SkipSelf);
      if (newParent === parent) break;
      parent = newParent;
    }

    if (resolvers instanceof Observable)
    {
      resolvers.subscribe({
        next: ls =>
        {
          if (!SATRouterOutletComponent.rootResolvers) return;

          // Удаляем предыдущие корневые пути
          SATRouterOutletComponent.rootResolvers.forEach(l =>
          {
            const index = routeResolvers.findIndex(lo => lo.path === l.path);
            if (index < 0) return;
            routeResolvers.splice(index, 1);
          });

          routeResolvers.splice(0, 0, ...ls);
          SATRouterOutletComponent.rootResolvers = ls;
        }
      });

      resolvers = SATRouterOutletComponent.rootResolvers = await firstValueFrom(resolvers);

    }

    if (!!SATRouterOutletComponent.rootResolvers) return;
    routeResolvers.push(...resolvers);
    SATRouterOutletComponent.rootResolvers = resolvers;
    //return loaders;
  }

  /** Можно ли деактивировать текущий маршрут, в результате будет дерево, соответствующее узлам состояний и признаком возможности деактивировать*/
  async canDeActivateAsync(ds: ISATStateNode[]): Promise<canActivateDeActivateResult>
  {
    let result: canActivateDeActivateResult = { canDeactivate: true, children: [] };

    for (const ro of this.childrenOutlet)
    {
      const cd = await ro.canDeActivateAsync(ds);
      if (!cd.canDeactivate) result.canDeactivate = false;

      result.children.push(cd);
    }

    if (!result.canDeactivate) return result;

    const c = this.previewContent;
    const canD = c.routeAndInjector?.routeResolver?.canDeactivate;
    if (!canD) return result;

    const address = c.routeAndInjector?.routePath?.pathAddress?.address ?? [];
    const newPath = this.s_router.getNode(ds, address)?.path;
    const oldPath = c.routeAndInjector?.routePath?.stateNode?.path;

    if (oldPath === newPath) return result;

    let cds: ISATCanDeActivate[] = Array.isArray(canD)
      ? canD
      : [canD];

    const state = deepClone(c.routeAndInjector!.routePath);
    for (let cd of cds)
    {
      let resultCD = cd.canDeActivate(c.component, state);

      if (resultCD instanceof Observable)
        resultCD = firstValueFrom(resultCD);

      if ((typeof resultCD === 'boolean' && !resultCD) || (resultCD instanceof Promise && !await resultCD))
      {
        result.canDeactivate = false;
        return result;
      }
    }
    return result;
  }

  /** Можно ли активировать маршрут */
  async canActivateAsync(resolver: ISATRouteResolver, state: RoutePath)
  {
    if (!resolver.canActivate) return true;
    const ca = Array.isArray(resolver.canActivate)
      ? resolver.canActivate
      : [resolver.canActivate];

    for (const loader of ca)
    {
      let resultCA = loader.canActivate(state);
      if (resultCA instanceof Observable)
        resultCA = firstValueFrom(resultCA);

      if ((typeof resultCA === 'boolean' && !resultCA) || (resultCA instanceof Promise && !await resultCA))
        return false;
    }

    return true;
  }

  /** Восстановить состояния для узлов с невозможностью перехода, начиная от начала к концу */
  restoreState(cdr: canActivateDeActivateResult, ds: ISATStateNode[]): void
  {
    if (cdr.canDeactivate) return;
    const c = this.previewContent;

    let currentNodes: ISATStateNode[] = ds;
    const address = c.routeAndInjector?.routePath?.pathAddress?.address ?? [];
    for (let i = 0; i < address.length - 1; i++)
      currentNodes = currentNodes[address[i]]?.children ?? [];

    const lastIndex = address[address.length - 1];
    const oldState = c.routeAndInjector?.routePath?.stateNode!;

    if (lastIndex < currentNodes.length)
      currentNodes[lastIndex] = oldState;

    for (let i = 0; i < this.childrenOutlet.length - 1; i++)
      this.childrenOutlet[i].restoreState(cdr.children[i], ds);
  }

  /** Получить размеры компонента */
  private rect() { return <DOMRect>this.element.nativeElement.getBoundingClientRect(); }

  /** Предыдущий контент */
  private get previewContent()
  {
    return (!this._isFirst)
      ? this.content1
      : this.content2;
  }
}


