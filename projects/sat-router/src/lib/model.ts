import { Type } from "@angular/core";
import { LoadChildrenCallback } from "@angular/router";
import { Observable } from "rxjs";

/** Узел данных маршрута */
export class SATStateNode
{
  /** Путь маршрута */
  path?: string;
  /** Имя контейнера маршрута */
  outlet?: string = '';
  /** Дочерние маршруты */
  children?: SATStateNode[];
  /** Параметры маршрута*/
  params?: any;
}

// export class SATStateNodeFp extends SATStateNode
// {
//   fullPath?: string;
// }

/** Маршрут с загрузчиком */
export interface SATRouteLoader
{
  /** Путь маршрута, если есть именованные контейнеры, то они пишутся `:{outlet}` */
  path: string;
  /** Тип компонента */
  component?: Type<any>;
  /** Загрузчик модуля */
  loadChildren?: LoadChildrenCallback;
  /** Перенаправление */
  redirectTo?: string;
  /** Можно ли активировать */
  canActivate?: SATCanActivate | SATCanActivate[];
  /** Можно ли деактивировать */
  canDeactivate?: SATCanDeActivate | SATCanDeActivate[];
  /** Можно ли выгружать */
  canUnload?: boolean;
  /** Не проверять на изменение компонента */
  alwaysNew?: boolean;
};

/** Интерфейс защитника активации */
export interface SATCanActivate
{
  canActivate(state: RoutePath): Observable<boolean> | Promise<boolean> | boolean;
}

/** Адрес маршрута */
export type PathAddress = { fullPath: string, address: number[] };
/** Данные маршрута */
export type RoutePath = { pathAddress: PathAddress, stateNode: SATStateNode };

/** Интерфейс защитника деактивации */
export interface SATCanDeActivate
{
  canDeActivate(component: any, state: RoutePath): Observable<boolean> | Promise<boolean> | boolean;
}

/** Интерфейс конфигурации*/
export interface ISATRouteConfiguration
{
  debug?: boolean;
}
