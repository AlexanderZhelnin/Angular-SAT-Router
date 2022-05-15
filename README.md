# AngularSatRouterLib

[Исходный код](https://github.com/AlexanderZhelnin/Angular-SAT-Router)

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

## SATRouterService

## SATRouterOutletComponent
Контейнер маршрута, который динамически заполняется в зависимости от текущего состояния маршрутизатора.

Каждый контейнер маршрута может иметь уникальное имя, определяемое необязательным атрибутом `name`.
```
<sat-router-outlet></sat-router-outlet>
<sat-router-outlet name='left'></sat-router-outlet>
<sat-router-outlet name='right'></sat-router-outlet>
```
Именованные контейнеры маршрута будут целями маршрута с тем же именем.

Объект `SATRoutNode` для именованного маршрута имеет свойство `outlet` для идентификации целевого контейнера маршрута:
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
