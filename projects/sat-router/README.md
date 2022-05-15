# SATRouter
Библиотека реализующая собственный механизм маршрутизации, вместо стандартного

[Исходный код](https://github.com/AlexanderZhelnin/Angular-SAT-Router)

* [SATRouterModule](#satroutermodule)
* [SAT_LINK_PARSE](#sat_link_parse)
* [SAT_STATE_STRINGIFY](#sat_state_stringify)
* [SATRouterOutletComponent](#satrouteroutletcomponent)
* [SATRouterService](#satrouterservice)
* [SATRouterLinkActive](#satrouterlinkactive)

## SATRouterModule
Добавляет директивы и сервисы для навигации внутри приложения между представлениями, определенными в приложении. Вы можете импортировать этот NgModule несколько раз, по одному разу, для каждого модуля с отложенной загрузкой.
Существует два способа регистрации маршрутов при импорте этого модуля
* `forRoot()` метод создает `NgModule`, который содержит все директивы и заданные загрузчики маршрутов для корневого модуля.
```ts
// Корневой модуль
@NgModule({
  declarations: [
    //
  ],
  imports: [    
    SATRouterModule.forRoot(
      // Загрузка определённого компонента
      { path: 'root1', component: RootComponent },
      // Динамически загружаемый модуль
      { path: 'root2', loadChildren: () => import('./modules/root2.module').then(_ => _.Root2Module) }
    )
  ],
```
* `forChild()` метод создает `NgModule`, который содержит все директивы и заданные заданные загрузчики  маршрутов
для дочерних модулей.
```ts
// Дочерний динамически загружаемый модуль
@NgModule({
  declarations: [
    //
  ],
  imports: [    
    SATRouterModule.forChildren(
      // корневой маршрут модуля
      { path: '', component: Child1Component },
      // маршрут для дочернего контейнера маршрутов
      { path: 'subChild1', component: SubChild1 },
      { path: 'subChild2', component: SubChild2 },
      // Динамически загружаемый модуль
      { path: 'subChild2', loadChildren: () => import('./modules/sub-child2.module').then(_ => _.SubChild2dModule) }
    )
  ],
```

## SAT_LINK_PARSE
Токен представляющий функцию преобразования из строки в полное состояние маршрута
```ts
providers: [
  {
    provide: SAT_LINK_PARSE,
    useValue: (link: string) =>
    {
      link = /sat-link:([a-z0-9==%"]+)/img.exec(link)?.[1] ?? '';

      if (!link) return of<SATStateNode[]>(
        [0, 1, 2].map(index => ({
          path: 'root1',
          outlet: index.toString(),
          params: { index },
          children: [
            {
              path: 'child1',
              children: [
                { path: 'subChild1', outlet: '0' },
                { path: 'subChild3', outlet: '1' }
              ]
            }
          ]
        }))
      );

      const s = unzip(decodeURIComponent(link));
      return of(JSON.parse(s));
    }
  },
```
## SAT_STATE_STRINGIFY
Токен представляющий функцию преобразования из полного состояния маршрута в строку
```ts
providers: [
 {
   provide: SAT_STATE_STRINGIFY,
   useValue: (rs: SATStateNode[]) =>
   {
     const s = encodeURIComponent(zip(JSON.stringify(rs)));
     return of(`#sat-link:${s}`);
   }
 }
```

## SATRouterService
Сервис для навигации

```ts

```

## SATRouterOutletComponent
Контейнер маршрута, который динамически заполняется в зависимости от текущего состояния маршрутизатора.

Каждый контейнер маршрута может иметь уникальное имя, определяемое необязательным атрибутом `name`.
```
<sat-router-outlet></sat-router-outlet>
<sat-router-outlet name='left'></sat-router-outlet>
<sat-router-outlet name='right'></sat-router-outlet>
```
Именованные контейнеры маршрута будут целями маршрута с тем же именем.

Объект `SATStateNode` для именованного маршрута имеет свойство `outlet` для идентификации целевого контейнера маршрута:
`{path: <base-path>, component: <component>, outlet: <target_outlet_name>}`


## SATRouterLinkActive
Директива для обнаружения активности маршрута
```
<nav mat-tab-nav-bar>
  <a mat-tab-link (click)="onClick1()" 
     [satRouterLinkActive]="{rout_path}"
     [routerOutlet]="outlet" 
     #rla1="satRouterLinkActive"
     [active]="rla1.isActive$ | async">
    {{tab1_header}}
  </a>

  <a mat-tab-link (click)="onClick2()" 
     [satRouterLinkActive]="{rout_path}"
     [routerOutlet]="outlet"
     #rla2="satRouterLinkActive"
     [active]="rla2.isActive$ | async">
    {{tab2_header}}
  </a>
</nav>
<sat-router-outlet #outlet ></sat-router-outlet>
```
