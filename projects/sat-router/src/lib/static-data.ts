import { Observable, Subject } from 'rxjs';
import { SATStateNode, SATRoutLoader } from './model';


/** Для проверки можно ли переходить к маршруту */
export const canActivate = { canActivate$: new Subject<SATStateNode[]>(), canActivateResult$: new Subject<boolean>() };
/** Для проверки можно ли покинуть маршруту */
export const canDeactivate = { canDeactivate$: new Subject<SATStateNode[]>(), canDeactivateResult$: new Subject<boolean>() };

//export const routLoaders = new Map<string, { component?: Type<any>, loadChildren?: LoadChildrenCallback }>();
export const routLoaders: SATRoutLoader[] = [];
//new Map<string, { component?: Type<any>, loadChildren?: LoadChildrenCallback }>();

/** Получить реальный маршрута из иерархии */
export function getRealPath(path: string, pathData?: SATStateNode[]): { fullPath: string, params: any, currentPath: number[] } | undefined
{
  const masPath = path?.split('/');
  if ((masPath?.length ?? 0) === 0) return undefined;

  let result: string | undefined = '';
  let params: any;
  let currentPath: number[] = [];

  masPath.reduce((ds, name) =>
  {
    const index = ds?.findIndex(item => (item.outlet ?? '') === name) ?? -1;
    if (index < 0)
    {
      result += '/*';
      params = undefined;
      return [];
    }

    currentPath.push(index);
    const r = ds![index];

    result += `/${(r?.path ?? '') + ((!!r?.outlet) ? `:${r.outlet}` : '')}`;
    params = r.params;
    return r?.children ?? []
  }, pathData)

  return (result === undefined)
    ? undefined
    : {
      fullPath: (result[0] === '/')
        ? result.substring(1)
        : result,
      params,
      currentPath
    };
}
