import { Observable, of } from 'rxjs';
import { SATStateNode, SATRouteLoader } from './model';

export type canActivateDeActivateResult = {
  canDeactivate: boolean,
  children: canActivateDeActivateResult[]
};

export interface ICanActivateDeActivate
{
  parent: ICanActivateDeActivate | undefined;
  childrenOutlet: ICanActivateDeActivate[],
  canDeActivateAsync(rs: SATStateNode[]): Promise<canActivateDeActivateResult>
  //canActivateAsync(rs: SATStateNode[]): Promise<canActivateDeActivateResult>
  restoreState(cdr: canActivateDeActivateResult, ds: SATStateNode[]): void
}


export const allCanActivateDeactivated: ICanActivateDeActivate[] = [];
/** Для проверки можно ли покинуть маршруту, с преобразование данных */
export async function canDeactivate(rs: SATStateNode[])
{
  const roots = [...allCanActivateDeactivated.filter(cd => !cd.parent)];

  for (const cd of roots)
  {
    const cdr = await cd.canDeActivateAsync(rs);
    cd.restoreState(cdr, rs);
  }
}

export const routeLoaders: SATRouteLoader[] = [];

export const translator = {

  stringify: (rs: SATStateNode[]): Observable<string> | undefined => of(`#sat-link:${window.btoa(encodeURI(encodeURIComponent(JSON.stringify(rs))))}`),

  parse: (link: string) =>
  {
    link = /sat-link:([a-z0-9==]+)/img.exec(link)?.[1] ?? '';
    if (!link) return undefined;
    return of(JSON.parse(decodeURIComponent(decodeURI(window.atob(link)))));
  }
};
