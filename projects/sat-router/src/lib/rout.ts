import { Type } from "@angular/core";
import { LoadChildrenCallback } from "@angular/router";

export class RoutNode
{
  /** Путь маршрута */
  path?: string;
  /** Имя маршрута */
  name?: string = '';
  /** Дочерние маршруты */
  children?: RoutNode[];
  /** Параметры маршрута*/
  params?: any[];
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
  /** Можно ли активировать */
  canActivate?: any[];
  /** Можно ли деактивировать */
  canDeactivate?: any[];
};

