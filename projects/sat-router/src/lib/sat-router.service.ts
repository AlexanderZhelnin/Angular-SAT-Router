import { Subject, Observable, of } from 'rxjs';
import { SATStateNode, SATRoutLoader } from './model';
import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { routLoaders } from './static-data';

/**
 * Токен представляющий функцию преобразования из строки в полное состояние маршрута
 *
 * # Пример регистрации в корневом модуле
 * ```ts
 * providers: [
 *   {
 *     provide: SAT_LINK_PARSE,
 *     useValue: (link: string) =>
 *     {
 *       link = /sat-link:([a-z0-9==%"]+)/img.exec(link)?.[1] ?? '';
 *
 *       if (!link) return of<SATStateNode[]>(
 *         [0, 1, 2].map(index => ({
 *           path: 'root1',
 *           outlet: index.toString(),
 *           params: { index },
 *           children: [
 *             {
 *               path: 'child1',
 *               children: [
 *                 { path: 'subChild1', outlet: '0' },
 *                 { path: 'subChild3', outlet: '1' }
 *               ]
 *             }
 *           ]
 *         }))
 *       );
 *
 *       const s = unzip(decodeURIComponent(link));
 *       return of(JSON.parse(s));
 *     }
 *   },
 * ```
 */
export const SAT_LINK_PARSE = new InjectionToken<(link: string) => Observable<SATStateNode[]> | undefined>('SATROUT_LINK_PARSE');
/**
 * Токен представляющий функцию преобразования из полного состояния маршрута в строку
 * ```ts
 * providers: [
 *  {
      provide: SAT_STATE_STRINGIFY,
      useValue: (rs: SATStateNode[]) =>
      {
        const s = encodeURIComponent(zip(JSON.stringify(rs)));
        return of(`#sat-link:${s}`);
      }
    }

 * ```
 */
export const SAT_STATE_STRINGIFY = new InjectionToken<(rs: SATStateNode[]) => Observable<string> | undefined>('SATROUT_LINK_STRINGIFY');


/**
 * Сервис для навигации
 *
 * @publicApi
 */
@Injectable({ providedIn: 'root' })
export class SATRouterService
{
  #state?: SATStateNode[];
  /** Текущее состояние маршрута */
  get state() { return this.#state ;}

  /** Событие изменения текущего состояния маршрута */
  readonly changed$ = new Subject<void>();
  #current?: string;

  constructor(
    @Optional() @Inject(SAT_LINK_PARSE) private parse: (link: string) => Observable<SATStateNode[]> | undefined,
    @Optional() @Inject(SAT_STATE_STRINGIFY) private stringify: (rs: SATStateNode[]) => Observable<string> | undefined,
  )
  {
    this.parse ??= (link: string) =>
    {
      link = /sat-link:([a-z0-9==]+)/img.exec(link)?.[1] ?? '';
      if (!link) return undefined;
      return of(JSON.parse(decodeURIComponent(decodeURI(window.atob(link)))));
    };

    this.stringify ??= (rs: SATStateNode[]) => of(`#sat-link:${window.btoa(encodeURI(encodeURIComponent(JSON.stringify(rs))))}`);

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
   * Перейти по состоянию маршрута
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
  navigate(state: SATStateNode[]): void;
  navigate(arg: string | SATStateNode[]): void
  {
    if (typeof arg === 'string')
    {
      if (this.#current === arg) return;
      this.parse(arg)?.subscribe({ next: (rs: SATStateNode[]) => this.navigate(rs) });
      return;
    }

    const rs = arg as SATStateNode[];
    this.stringify(rs)?.subscribe({
      next: s =>
      {
        if (s === this.#current) return;

        //canActivate.canActivate$.

        this.#state = rs;
        this.#current = s;
        this.changed$.next();

        history.replaceState(null, '', s);
      }
    });
  }
  //#endregion

}
