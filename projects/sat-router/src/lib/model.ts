import { Type } from "@angular/core";
import { LoadChildrenCallback } from "@angular/router";

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

/** Маршрут с загрузчиком */
export interface SATRoutLoader
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
  canActivate?: any[];
  /** Можно ли деактивировать */
  canDeactivate?: any[];
};

