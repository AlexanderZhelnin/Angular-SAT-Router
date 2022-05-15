import { Component, Inject, OnInit, Optional } from '@angular/core';
import { Observable } from 'rxjs';
import { SATROUT_PARAMS } from 'sat-router';

@Component({
  selector: 'app-root2',
  templateUrl: './root2.component.html',
  styleUrls: ['./root2.component.scss']
})
export class Root2Component implements OnInit
{

  options: { level: number, index: number } = { level: 0, index: 0 };

  constructor(@Optional() @Inject(SATROUT_PARAMS) private params: Observable<any>)
  {
    this.params?.subscribe({
      next: ps =>
      {
        if (!!ps) this.options = ps;
        //this.name=ps[1];
        //console.log(ps);
      }
    });
  }

  ngOnInit(): void
  {
  }

}
