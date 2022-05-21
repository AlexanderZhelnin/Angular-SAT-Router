import { Component, Inject, OnInit, Optional } from '@angular/core';
import { Observable } from 'rxjs';
import { SATRouterOutletComponent, SAT_ROUTE_PARAMS } from 'sat-router';

@Component({
  selector: 'app-root1',
  templateUrl: './root1.component.html',
  styleUrls: ['./root1.component.scss']
})
export class Root1Component implements OnInit
{
  private static _index = 0;
  index = ++Root1Component._index;

  options: { index: number } = { index: 0 };

  constructor(
    public sro: SATRouterOutletComponent,
    @Optional() @Inject(SAT_ROUTE_PARAMS) private params: Observable<any | undefined>)
  {
    this.params?.subscribe({
      next: ps =>
      {
        if (!!ps) this.options = ps;
      }
    });
  }

  ngOnInit(): void
  {

  }

}
