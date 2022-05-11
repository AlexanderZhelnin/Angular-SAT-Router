import { BehaviorSubject, Subject, Observable, of } from 'rxjs';
import { RoutNode, RoutLoader } from './rout';
import { Inject, Injectable, InjectionToken, Optional, Type } from '@angular/core';
import { LoadChildrenCallback } from '@angular/router';
import { routLoaders, canActivate } from './static-data';

/** Токен свойств */
export const SATROUT_LINK_PARSE = new InjectionToken<(link: string) => Observable<RoutNode[]> | undefined>('SATROUT_LINK_PARSE');
export const SATROUT_LINK_STRINGIFY = new InjectionToken<(rs: RoutNode[]) => Observable<string> | undefined>('SATROUT_LINK_STRINGIFY');

@Injectable({ providedIn: 'root' })
export class SatRouterService
{
  pathData?: RoutNode[];
  changed$ = new Subject<void>();
  #current: string = '';

  constructor(
    @Optional() @Inject(SATROUT_LINK_PARSE) private parse: (link: string) => Observable<RoutNode[]> | undefined,
    @Optional() @Inject(SATROUT_LINK_STRINGIFY) private stringify: (rs: RoutNode[]) => Observable<string> | undefined,
  )
  {
    this.parse ??= (link: string) =>
    {
      link = /sat-link:([a-z0-9==]+)/img.exec(link)?.[1] ?? '';
      if (!link) return undefined;
      return of(JSON.parse(decodeURIComponent(decodeURI(window.atob(link)))));
    };

    this.stringify ??= (rs: RoutNode[]) => of(`#sat-link:${window.btoa(encodeURI(encodeURIComponent(JSON.stringify(rs))))}`);

    this.navigate(document.location.hash);
  }

  /**
   * Добавление маршрута с загрузчиком
   *
   * @param routLoader Загрузчик маршрута
   */
  addRout(routLoader: RoutLoader): void
  {
    routLoaders.push(routLoader);
  }

  //#region navigate
  navigate(link: string): void;
  navigate(rout: RoutNode[]): void;
  /** Перейти */
  navigate(arg: string | RoutNode[]): void
  {
    if (typeof arg === 'string')
    {
      if (this.#current === arg) return;
      this.parse(arg)?.subscribe({ next: (rs: RoutNode[]) => this.navigate(rs) });
      return;
    }

    const rs = arg as RoutNode[];
    this.stringify(rs)?.subscribe({
      next: s =>
      {
        if (s === this.#current) return;

        //canActivate.canActivate$.

        this.pathData = rs;
        this.#current = s;
        this.changed$.next();

        history.replaceState(null, '', s);
      }
    });
  }
  //#endregion

}
