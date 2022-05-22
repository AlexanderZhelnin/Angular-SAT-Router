import { Observable, of } from 'rxjs';
import { ISATStateNode, ISATRouteResolver } from './model';

export type canActivateDeActivateResult = {
  canDeactivate: boolean,
  children: canActivateDeActivateResult[]
};

export interface ICanActivateDeActivate
{
  parentOutlet: ICanActivateDeActivate | undefined;
  childrenOutlet: ReadonlyArray<ICanActivateDeActivate>,
  canDeActivateAsync(rs: ISATStateNode[]): Promise<canActivateDeActivateResult>
  //canActivateAsync(rs: SATStateNode[]): Promise<canActivateDeActivateResult>
  restoreState(cdr: canActivateDeActivateResult, ds: ISATStateNode[]): void
}


export const allCanActivateDeactivated: ICanActivateDeActivate[] = [];
/** Для проверки можно ли покинуть маршруту, с преобразование данных */
export async function canDeactivate(rs: ISATStateNode[])
{
  const roots = [...allCanActivateDeactivated.filter(cd => !cd.parentOutlet)];

  for (const cd of roots)
  {
    const cdr = await cd.canDeActivateAsync(rs);
    cd.restoreState(cdr, rs);
  }
}

export const routeResolvers: ISATRouteResolver[] = [];

export const translator = {

  stringify: (rs: ISATStateNode[]): Observable<string> | undefined => of(`#sat-link:${window.btoa(encodeURI(encodeURIComponent(JSON.stringify(rs))))}`),

  parse: (link: string) =>
  {
    link = /sat-link:([a-z0-9==]+)/img.exec(link)?.[1] ?? '';
    if (!link) return undefined;
    return of(JSON.parse(decodeURIComponent(decodeURI(window.atob(link)))));
  }
};
