import { Component, Inject, OnInit, Optional, OnDestroy, ViewChild } from '@angular/core';
import { Observable, map, Subscription, BehaviorSubject } from 'rxjs';
import { SATRouterOutletComponent, SATRouterService, SAT_ROUTE_ADDRESS, SAT_ROUTE_PATH } from 'sat-router';
import { MainService } from 'src/app/services/main.service';
import { IEditor } from './editor.component';


@Component({
  selector: 'app-editors',
  templateUrl: './editors.component.html',
  styleUrls: ['./editors.component.scss']
})
export class EditorsComponent implements OnInit, OnDestroy
{
  @ViewChild('outlet', { static: true }) outlet!: SATRouterOutletComponent;

  editors$ = new BehaviorSubject<IEditor[]>([]);

  private _address: number[] = [];
  private _subs: Subscription[] = [];

  constructor(
    private s_router: SATRouterService,
    private s_main: MainService,
    @Optional() @Inject(SAT_ROUTE_ADDRESS) address: Observable<number[] | undefined> | undefined,
    @Optional() @Inject(SAT_ROUTE_PATH) path: Observable<string | undefined> | undefined)
  {
    address?.subscribe({ next: d => this._address = d ?? [] });
  }


  ngOnInit(): void
  {
    this._subs.push(
      this.s_main.files$
        .pipe(map(fs => fs.map(f => ({ name: f }))))
        .subscribe({ next: eds => this.editors$.next(eds) })
    );

  }
  ngOnDestroy(): void
  {
    this._subs.forEach(s => s.unsubscribe());
  }

  onActivated(editor?: IEditor): void
  {
    if (this.isActive(editor)) return;

    this.s_main.stepFile(editor!.name);
  }

  onAddClick(): void
  {
    this.s_main.files$.next([...this.s_main.files$.value, this.s_main.files$.value.length.toString()]);
  }

  private isActive(editor?: IEditor): boolean
  {
    if (!editor) return true;
    const masPath = this.outlet.currentRoute$?.value?.routePath?.pathAddress?.fullPath?.split('/');
    return (!masPath || masPath[masPath?.length - 1] === editor?.name);
  }

}
