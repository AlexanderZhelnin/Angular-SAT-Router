import { Component, Inject, OnInit, Optional } from '@angular/core';
import { Observable } from 'rxjs';
import { SATROUT_PARAMS } from 'sat-router';

@Component({
  selector: 'app-root1',
  templateUrl: './root1.component.html',
  styleUrls: ['./root1.component.scss']
})
export class Root1Component implements OnInit
{
  constructor(@Optional() @Inject(SATROUT_PARAMS) private params: Observable<any[] | undefined>)
  {
    this.params?.subscribe({
      next: ps =>
      {
        console.log(ps);
      }
    });
  }

  ngOnInit(): void
  {

  }

}
