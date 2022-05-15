import { Component, Inject, OnInit, Optional } from '@angular/core';
import { Observable } from 'rxjs';
import { SATRouterOutletComponent, SATROUT_PARAMS } from 'sat-router';

@Component({
  selector: 'app-root1',
  templateUrl: './root1.component.html',
  styleUrls: ['./root1.component.scss']
})
export class Root1Component implements OnInit
{
  options: { index: number } = { index: 0 };

  constructor(
    public sro: SATRouterOutletComponent,
    @Optional() @Inject(SATROUT_PARAMS) private params: Observable<any | undefined>)
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
