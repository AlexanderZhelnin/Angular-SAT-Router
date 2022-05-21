import { Component, ElementRef, InjectionToken, Injector, Input, OnInit, Optional, SkipSelf, ɵcreateInjector as createInjector, OnDestroy, ViewChild, Renderer2, ChangeDetectorRef, ViewContainerRef, Inject, InjectFlags } from '@angular/core';
import { Observable, BehaviorSubject, Subscription, firstValueFrom } from 'rxjs';
import { SATRouterService } from './sat-router.service';
import { SATRouteLoader, SATStateNode, SATCanDeActivate, type RoutePath, ISATRouteConfiguration } from './model';
import { allCanActivateDeactivated, routeLoaders, translator, type canActivateDeActivateResult } from './static-data';

/** Токен свойств */
export const SAT_ROUTE_PARAMS = new InjectionToken<Observable<any | undefined>>('SAT_ROUTE_PARAMS');
/** Токен текущего пути */
export const SAT_ROUTE_ADDRESS = new InjectionToken<Observable<number[]>>('SAT_ROUTE_ADDRESS');
/** Токен полного пути */
export const SAT_ROUTE_PATH = new InjectionToken<Observable<string | undefined>>('SAT_ROUTE_PATH');
/** Токен загрузчиков */
export const SAT_ROUTE_LOADERS = new InjectionToken<SATRouteLoader[] | BehaviorSubject<SATRouteLoader[]>>('SAT_ROUTE_LOADERS');

/** Токен конфигурации */
export const SAT_ROUTE_CONFIGURATION = new InjectionToken<ISATRouteConfiguration>('SAT_ROUTE_CONFIGURATION');

/** Загрузчик с индексом в массиве загрузчиков */
type RouteLoader = SATRouteLoader & { index: number };
/** Данные маршрута с загрузчиком */
type Route = { routePath: RoutePath, routeLoader: RouteLoader };
/** Данные маршрута с загрузчиком и инжектором */
type RouteAndInjector = Route & { injector?: Injector };
//type LoaderHierarchy = { loaders: SATRouteLoader[], child?: LoaderHierarchy };

/** Получить реальный маршрута из иерархии */
function getRealPath(path: string, pathData?: SATStateNode[]): RoutePath | undefined
{
  const masPath = path?.split('/');
  if ((masPath?.length ?? 0) === 0) return undefined;

  let result: string | undefined = '';
  let address: number[] = [];
  let stateNode: SATStateNode | undefined;

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
  /** Observable загруженного компонента необходим для отслеживания изменения параметров */
  params$ = new BehaviorSubject<any>(undefined);
  /** Observable загруженного компонента необходим для отслеживания изменения пути */
  path$ = new BehaviorSubject<string | undefined>(undefined);
  /** Observable загруженного компонента необходим для отслеживания изменения данных получения адреса данных маршрута */
  address$ = new BehaviorSubject<number[]>([]);

  constructor(
    public injector: Injector,
    public view: ViewContainerRef,
    public content: HTMLDivElement)
  {

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
 * Объект `SATStateNode` для именованного маршрута имеет свойство `outlet` для идентификации целевого контейнера маршрута:
 *
 * `{path: <base-path>, component: <component>, outlet: <target_outlet_name>}`
 *
 * @see `SATRouterLinkActiveDirective`
 * @see `SATStateNode`
 * @see `SATRouteLoader`
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
  @Input() name: string = '';
  @Input() orientation: 'horizontal' | 'vertical' = 'horizontal';

  @ViewChild('contentDiv1', { static: true }) contentDiv1?: ElementRef<any>;
  @ViewChild('contentDiv2', { static: true }) contentDiv2?: ElementRef<any>;

  @ViewChild('placeholder1', { read: ViewContainerRef, static: true }) view1?: ViewContainerRef;
  @ViewChild('placeholder2', { read: ViewContainerRef, static: true }) view2?: ViewContainerRef;

  content1!: CContent;
  content2!: CContent;

  currentRoute$ = new BehaviorSubject<Route | undefined>(undefined);
  readonly level: number = 0;

  childrenOutlet: SATRouterOutletComponent[] = [];

  private _isFirst = true;
  private _subs: Subscription[] = [];

  constructor(
    private readonly element: ElementRef,
    private readonly s_router: SATRouterService,
    private readonly parentInjector: Injector,
    private readonly renderer: Renderer2,
    private readonly cdr: ChangeDetectorRef,
    @Optional() @Inject(SAT_ROUTE_CONFIGURATION) private readonly settings: ISATRouteConfiguration,
    @SkipSelf() @Optional() public readonly parent: SATRouterOutletComponent)
  {
    if (!parent) return;
    this.level = parent.level + 1;
    parent.childrenOutlet.push(this);
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
    if (!!this.parent)
    {
      index = this.parent.childrenOutlet.indexOf(this);
      this.parent.childrenOutlet.splice(index, 1);
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
    if (!!r.routeLoader.loadChildren)
    {
      const rm = await this.loadModuleAsync(r);
      this.update(c1, c2, rm);
    }
    else if (!!r.routeLoader.component)
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
  private async getRouteAsync(routeNodes: SATStateNode[] | undefined): Promise<Route | undefined>
  {
    let path = this.name;
    let parent = this.parent;
    while (!!parent)
    {
      path = `${parent.name}/${path}`;
      parent = parent.parent;
    }

    const rp = getRealPath(path, routeNodes);

    if (!rp) return undefined;

    await this.rootLoadersAsync(this.parentInjector);

    let index = routeLoaders.findIndex(rl => rl.path === rp.pathAddress.fullPath);
    if (index < 0)
    {
      const masFullPath = rp.pathAddress.fullPath.split('/');
      const sPath = masFullPath.slice(0, -1).join('/');
      const anyPath = sPath + ((!!sPath) ? `/*` : '*');

      index = routeLoaders.findIndex(rl => rl.path === anyPath);
      index = await this.checkCanLoadAndRedirectAsync(index, rp);
    }
    else
      index = await this.checkCanLoadAndRedirectAsync(index, rp);

    return (index < 0)
      ? undefined
      : { routePath: rp, routeLoader: { ...routeLoaders[index], index } };
  }

  /** Проверяем маршрут на возможность загрузки и перенаправление на другой маршрут */
  private async checkCanLoadAndRedirectAsync(index: number, rp: RoutePath)
  {
    if (index < 0) return -1;
    let rl = routeLoaders[index];
    if (!!rl.component || !!rl.loadChildren)
    {
      if (!await this.canActivateAsync(rl, rp))
      {
        if (!!rl.redirectTo)
        {
          index = routeLoaders.findIndex(rll => rll.path === rl.redirectTo);
          index = await this.checkCanLoadAndRedirectAsync(index, rp);
          if (index >= 0)
          {

            if (this.previewContent.routeAndInjector?.routePath?.pathAddress?.fullPath === routeLoaders[index].path)
            {
              rp.pathAddress = this.previewContent.routeAndInjector.routePath.pathAddress;
              rp.stateNode = this.previewContent.routeAndInjector.routePath.stateNode;

              const n = this.s_router.getNode(this.s_router.state ?? [], rp.pathAddress.address, true);
              if (!!n?.children) n.children[rp.pathAddress.address[rp.pathAddress.address.length - 1]] = rp.stateNode;
            }
            else
            {
              rp.pathAddress.fullPath = routeLoaders[index].path;

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
        index = routeLoaders.findIndex(rll => rll.path === rl.redirectTo);
        index = await this.checkCanLoadAndRedirectAsync(index, rp);
        if (index >= 0) rp.pathAddress.fullPath = routeLoaders[index].path;
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

    if (c2.routeAndInjector?.routeLoader.component === ri.routeLoader.component &&
      JSON.stringify(c2.params$.value) === JSON.stringify(ri.routePath.stateNode?.params))
    {
      if (!!c2.routeAndInjector?.routePath)
        c2.routeAndInjector.routePath = ri.routePath;
      return;
    }

    if (ri.routeLoader.alwaysNew || c2.routeAndInjector?.routeLoader.component !== ri.routeLoader.component)
    {
      if (!c1.routeAndInjector?.routeLoader?.component && !c2.routeAndInjector?.routeLoader?.component)
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
          if (c2.routeAndInjector?.routeLoader.canUnload !== false)
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
      switch (this.orientation)
      {
        case 'horizontal':
          if (ri.routeLoader.index > (c2.routeAndInjector?.routeLoader?.index ?? -1))
          {
            this.renderer.setStyle(c1.content, 'transform', `translate(${rect.width}px, 0)`);
            this.renderer.setStyle(c2.content, 'transform', `translate(-${rect.width}px, 0)`);

            // c1.transform = `translate(${rect.width}px, 0)`;
            // c2.transform = `translate(-${rect.width}px, 0)`;
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
          if (ri.routeLoader.index > (c2.routeAndInjector?.routeLoader?.index ?? -1))
          {
            this.renderer.setStyle(c1.content, 'transform', `translate(0, ${rect.height}px)`);
            this.renderer.setStyle(c2.content, 'transform', `translate(0, -${rect.height}px)`);

            // c1.transform = `translate(0, ${rect.height}px)`;
            // c2.transform = `translate(0, -${rect.height}px)`;
          }
          else
          {
            this.renderer.setStyle(c1.content, 'transform', `translate(0, -${rect.height}px)`);
            this.renderer.setStyle(c2.content, 'transform', `translate(0, ${rect.height}px)`);

            // c1.transform = `translate(0, ${rect.height}px)`;
            // c2.transform = `translate(0, -${rect.height}px)`;
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

    if (c.routeAndInjector?.routeLoader.component === ri.routeLoader.component)
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

    const component = ri.routeLoader.component;
    c.view.clear();
    if (!!component)
      c.component = c.view.createComponent(component, { injector: c.injector }).instance;

    this.cdr.markForCheck();
  }

  private async loadModuleAsync(route: Route): Promise<RouteAndInjector>
  {
    if (!route.routeLoader.loadChildren) return route;

    const module = await route.routeLoader.loadChildren();
    let loader: SATRouteLoader | undefined;

    const injector = createInjector(module, this.parentInjector);
    const routs = injector.get(SAT_ROUTE_LOADERS);
    const path = route.routePath.pathAddress.fullPath;

    //const hierarchy = this.routeHierarchy(injector);
    //routeLoaders = buildRouteLoaders(path, );

    for (let i = routeLoaders.length - 1; i >= 0; i--)
      if (routeLoaders[i].path.startsWith(path) && routeLoaders[i].path !== path)
        routeLoaders.splice(i, 1);

    const loaders = await ((routs instanceof Observable)
      ? firstValueFrom(routs)
      : new Promise((resolve: (value: SATRouteLoader[]) => void) => resolve(routs)));

    loaders.forEach(r =>
    {
      if (!r.path)
        loader = r;
      else
        routeLoaders.push({
          ...r,
          path: `${path}/${r.path}`,
          redirectTo: (!!r.redirectTo) ? `${path}/${r.redirectTo}` : undefined
        });
    });

    if (!loader) return route;

    route = deepClone(route);
    route.routeLoader = { ...loader, index: route.routeLoader.index };
    return { ...route, injector };
  }

  private static rootLoaders?: SATRouteLoader[];
  /** Находим корневые пути */
  private async rootLoadersAsync(injector: Injector)
  {
    if (!!SATRouterOutletComponent.rootLoaders) return;
    let loaders = injector.get(SAT_ROUTE_LOADERS, undefined);
    let parent = injector.get(Injector, undefined, InjectFlags.SkipSelf);
    while (!!parent)
    {
      const parentLoaders = parent.get(SAT_ROUTE_LOADERS, undefined);
      if (!!parentLoaders && parentLoaders !== loaders)
        loaders = parentLoaders;

      const newParent = parent.get(Injector, undefined, InjectFlags.SkipSelf);
      if (newParent === parent) break;
      parent = newParent;
    }

    if (loaders instanceof Observable)
    {
      loaders.subscribe({
        next: ls =>
        {
          if (!SATRouterOutletComponent.rootLoaders) return;

          // Удаляем предыдущие корневые пути
          SATRouterOutletComponent.rootLoaders.forEach(l =>
          {
            const index = routeLoaders.findIndex(lo => lo.path === l.path);
            if (index < 0) return;
            routeLoaders.splice(index, 1);
          });

          routeLoaders.splice(0, 0, ...ls);
          SATRouterOutletComponent.rootLoaders = ls;
        }
      });

      loaders = SATRouterOutletComponent.rootLoaders = await firstValueFrom(loaders);

    }

    if (!!SATRouterOutletComponent.rootLoaders) return;
    routeLoaders.push(...loaders);
    SATRouterOutletComponent.rootLoaders = loaders;
    //return loaders;
  }

  /** Можно ли деактивировать текущий маршрут, в результате будет дерево, соответствующее узлам состояний и признаком возможности деактивировать*/
  async canDeActivateAsync(ds: SATStateNode[]): Promise<canActivateDeActivateResult>
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
    const canD = c.routeAndInjector?.routeLoader?.canDeactivate;
    if (!canD) return result;

    const address = c.routeAndInjector?.routePath?.pathAddress?.address ?? [];
    const newPath = this.s_router.getNode(ds, address)?.path;
    const oldPath = c.routeAndInjector?.routePath?.stateNode?.path;

    if (oldPath === newPath) return result;

    let cds: SATCanDeActivate[] = Array.isArray(canD)
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
  async canActivateAsync(loaders: SATRouteLoader, state: RoutePath)
  {
    if (!loaders.canActivate) return true;
    const ca = Array.isArray(loaders.canActivate)
      ? loaders.canActivate
      : [loaders.canActivate];

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
  restoreState(cdr: canActivateDeActivateResult, ds: SATStateNode[]): void
  {
    if (cdr.canDeactivate) return;
    const c = this.previewContent;

    let currentNodes: SATStateNode[] = ds;
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


