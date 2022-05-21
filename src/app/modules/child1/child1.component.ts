import { RootService } from './../../root.service';
import { Component, Inject, OnInit, Optional } from '@angular/core';
import { Observable } from 'rxjs';
import { SATRouterOutletComponent, SATRouterService, SAT_ROUTE_PARAMS } from 'sat-router';

@Component({
  selector: 'app-child1',
  templateUrl: './child1.component.html',
  styleUrls: ['./child1.component.scss']
})
export class Child1Component implements OnInit
{
  static _index = 0;
  index = ++Child1Component._index;

  constructor(
    public sro: SATRouterOutletComponent,
    s_root: RootService,
    readonly s_router: SATRouterService,
    @Optional() @Inject(SAT_ROUTE_PARAMS) private readonly params: Observable<any[] | undefined>)
  {

    //console.log(s_root.index);

    this.params?.subscribe({
      next: ps =>
      {
        console.log('Child1Component_params', ps);
      }
    });
  }

  ngOnInit(): void
  {
  }

}
