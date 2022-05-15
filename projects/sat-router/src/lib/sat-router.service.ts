import { Subject, Observable, of } from 'rxjs';
import { SATRoutNode, SATRoutLoader } from './model';
import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { routLoaders } from './static-data';

/** Токен свойств */
export const SATROUT_LINK_PARSE = new InjectionToken<(link: string) => Observable<SATRoutNode[]> | undefined>('SATROUT_LINK_PARSE');
export const SATROUT_LINK_STRINGIFY = new InjectionToken<(rs: SATRoutNode[]) => Observable<string> | undefined>('SATROUT_LINK_STRINGIFY');

@Injectable({ providedIn: 'root' })
export class SATRouterService
{
  pathData?: SATRoutNode[];
  changed$ = new Subject<void>();
  #current?: string;

  constructor(
    @Optional() @Inject(SATROUT_LINK_PARSE) private parse: (link: string) => Observable<SATRoutNode[]> | undefined,
    @Optional() @Inject(SATROUT_LINK_STRINGIFY) private stringify: (rs: SATRoutNode[]) => Observable<string> | undefined,
  )
  {
    this.parse ??= (link: string) =>
    {
      link = /sat-link:([a-z0-9==]+)/img.exec(link)?.[1] ?? '';
      if (!link) return undefined;
      return of(JSON.parse(decodeURIComponent(decodeURI(window.atob(link)))));
    };

    this.stringify ??= (rs: SATRoutNode[]) => of(`#sat-link:${window.btoa(encodeURI(encodeURIComponent(JSON.stringify(rs))))}`);

    this.navigate(document.location.hash);
  }

  /**
   * Добавление маршрута с загрузчиком
   *
   * @param routLoader Загрузчик маршрута
   */
  addRout(routLoader: SATRoutLoader): void
  {
    routLoaders.push(routLoader);
  }

  //#region navigate
  /**
   * Перейти по строковой ссылке
   *
   * ## Пример:
   * ```ts
   * navigate('root1/1')
   * ```
   */
  navigate(link: string): void;
  /**
   * Перейти по данным маршрута
   *
   * ## Пример:
   * ```ts
   * navigate([
      {
        path: 'root1',
        params: { name: '123' },
        children: [
          {
            path: '1', params: { id: '321' },
            children: [
              { name: 'left', params: { userId: '321' } },
              { name: 'right', params: { userId: '3212' } },
            ]
          }
        ]
      },
      {
        path: 'root1',
        name: 'rootRight',
        params: ['', 2,],
        children: [
          { name: 'left', params: { admin: true } },
          { name: 'right', params: ['right2', 6] },
        ]
      }
    ])
   * ```
   * */
  navigate(rout: SATRoutNode[]): void;
  navigate(arg: string | SATRoutNode[]): void
  {
    if (typeof arg === 'string')
    {
      if (this.#current === arg) return;
      this.parse(arg)?.subscribe({ next: (rs: SATRoutNode[]) => this.navigate(rs) });
      return;
    }

    const rs = arg as SATRoutNode[];
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
