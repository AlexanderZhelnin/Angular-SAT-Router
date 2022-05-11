import { Observable, Subject } from 'rxjs';
import { RoutNode, RoutLoader } from './rout';


/** Для проверки можно ли переходить к маршруту */
export const canActivate = { canActivate$: new Subject<RoutNode[]>(), canActivateResult$: new Subject<boolean>() };
/** Для проверки можно ли покинуть маршруту */
export const canDeactivate = { canDeactivate$: new Subject<RoutNode[]>(), canDeactivateResult$: new Subject<boolean>() };

//export const routLoaders = new Map<string, { component?: Type<any>, loadChildren?: LoadChildrenCallback }>();
export const routLoaders: RoutLoader[] = [];
//new Map<string, { component?: Type<any>, loadChildren?: LoadChildrenCallback }>();

/** Получить реальный маршрута из иерархии */
export function getRealPath(path: string, pathData?: RoutNode[]): { fullPath: string, params: any[] | undefined } | undefined
{
  const masPath = path?.split('/');
  if ((masPath?.length ?? 0) === 0) return undefined;

  let result: string | undefined = '';
  let params: any[] | undefined;

  masPath.reduce((ds, name) =>
  {
    const r = ds?.find(item => (item.name ?? '') === name);
    if (!r)
    {
      result = undefined;
      params = undefined;
      return [];
    }
    result += `/${(r?.path ?? '') + ((!!r?.name) ? `:${r.name}` : '')}`;
    params = r.params;
    return r?.children ?? []
  }, pathData)

  return (result === undefined)
    ? undefined
    : {
      fullPath: (result[0] === '/')
        ? result.substring(1)
        : result,
      params
    };
}
