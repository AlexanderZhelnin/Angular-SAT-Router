import { Component, Inject, OnInit, Optional } from '@angular/core';
import { Observable } from 'rxjs';
import { SatRouterService, SATROUT_PARAMS } from 'sat-router';

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
    readonly s_router: SatRouterService,
    @Optional() @Inject(SATROUT_PARAMS) private readonly params: Observable<any[] | undefined>)
  {
    this.params?.subscribe({
      next: ps => console.log(ps)
    })
  }

  ngOnInit(): void
  {
  }

}
