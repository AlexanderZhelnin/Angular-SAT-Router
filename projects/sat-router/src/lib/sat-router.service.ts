import { Subject, Observable, of, BehaviorSubject, firstValueFrom } from 'rxjs';
import { ISATStateNode } from './model';
import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { canDeactivate, translator } from './static-data';

/**
 * Токен представляющий функцию преобразования из строки в полное состояние маршрута
 *
 * @example Пример регистрации в корневом модуле
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
export const SAT_LINK_PARSE = new InjectionToken<(link: string) => Observable<ISATStateNode[]> | undefined>('SAT_LINK_PARSE');
/**
 * Токен представляющий функцию преобразования из полного состояния маршрута в строку
 * @example
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
 * @publicApi
 */
export const SAT_STATE_STRINGIFY = new InjectionToken<(rs: ISATStateNode[]) => Observable<string> | undefined>('SAT_STATE_STRINGIFY');

/**
 * Сервис для навигации
 *
 * @publicApi
 */
@Injectable({ providedIn: 'root' })
export class SATRouterService
{
  private _state?: ISATStateNode[];
  /** Текущее состояние маршрута */
  get state() { return this._state; }

  /** Событие изменения текущего состояния маршрута */
  readonly changed$ = new Subject<void>();
  private _current?: string;

  constructor(
    @Optional() @Inject(SAT_LINK_PARSE) parse: (link: string) => Observable<ISATStateNode[]> | undefined,
    @Optional() @Inject(SAT_STATE_STRINGIFY) stringify: (rs: ISATStateNode[]) => Observable<string> | undefined,
  )
  {
    if (!!parse) translator.parse = parse;
    if (!!stringify) translator.stringify = stringify;
    this.navigate(document.location.hash);
  }

  //#region navigate
  /**
   * Перейти по строковой ссылке
   *
   * @example
   * ```ts
   * navigate('root1/1')
   * ```
   */
  navigate(link: string): Promise<void>;
  /**
   * Перейти по состоянию маршрута
   *
   * @example
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
  navigate(state: ISATStateNode[]): Promise<void>;
  async navigate(arg: string | ISATStateNode[])
  {
    if (typeof arg === 'string')
    {
      if (this._current === arg) return;
      translator.parse(arg)?.subscribe({ next: (rs: ISATStateNode[]) => this.navigate(rs) });
      return;
    }

    const rs = arg as ISATStateNode[];

    await canDeactivate(rs);

    const s = await firstValueFrom(translator.stringify(rs) ?? new BehaviorSubject<string | undefined>(undefined));
    if (!s || s === this._current) return;

    this._state = rs;
    this._current = s;
    this.changed$.next();

    history.replaceState(null, '', s);
  }
  //#endregion


  /**
   * Обновление адресной строки браузера
   * @async
   */
  async updateHistoryAsync()
  {
    const s = await firstValueFrom(translator.stringify(this.state ?? []) ?? new BehaviorSubject<string | undefined>(undefined));
    if (!!s) history.replaceState(null, '', s);
  }

  /**
   * Копия маршрута с выделением текущего уровня
   *
   * @param address Адрес текущего уровня
   * @return {*}
   */
  cloneState(address: number[]): { state: ISATStateNode[]; currentNode?: ISATStateNode; }
  {
    const state = JSON.parse(JSON.stringify(this.state ?? [])) as ISATStateNode[];
    const currentNode = this.getNode(state, address);

    return { state, currentNode }
  }

  /**
   * Получить узел данных маршрута
   *
   * @param state - состояние всего маршрута
   * @param address - адрес узла маршрута
   * @param [withOutLast=false] - не учитывать последний узел
   * @return {*} Узел маршрута
   */
  getNode(state: ISATStateNode[], address: number[], withOutLast: boolean = false): ISATStateNode | undefined
  {
    let currentNodes: ISATStateNode[] = state;
    let count = address.length - 1;
    if (withOutLast) count--;
    for (let i = 0; i < count; i++)
      currentNodes = currentNodes?.[address[i]]?.children ?? [];

    return address.length > 0
      ? currentNodes[address[count]]
      : undefined;
  }


}
