import { Type } from "@angular/core";
import { LoadChildrenCallback } from "@angular/router";

/** Узел данных маршрута */
export class RoutNode
{
  /** Путь маршрута */
  path?: string;
  /** Имя маршрута */
  name?: string = '';
  /** Дочерние маршруты */
  children?: RoutNode[];
  /** Параметры маршрута*/
  params?: any;
}

/** Маршрут с загрузчиком */
export interface RoutLoader
{
  /** Путь маршрута */
  path: string;
  /** Тип компонента */
  component?: Type<any>;
  /** Загрузчик модуля */
  loadChildren?: LoadChildrenCallback;
  /** Перенаправление */
  redirectTo?: string;
  /** Можно ли активировать */
  canActivate?: any[];
  /** Можно ли деактивировать */
  canDeactivate?: any[];
};

