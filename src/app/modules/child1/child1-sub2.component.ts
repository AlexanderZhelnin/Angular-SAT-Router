import { Component, OnInit, Optional } from '@angular/core';
import { SATRouterOutletComponent } from 'sat-router';

@Component({
  selector: 'app-sub2child1',
  templateUrl: './child1-sub2.component.html',
  styleUrls: ['./child1-sub2.component.scss']
})
export class Child1Sub2Component implements OnInit
{

  private static _index = 0;
  index = ++Child1Sub2Component._index;

  constructor(public sro: SATRouterOutletComponent)
  {

  }


  ngOnInit(): void
  {
  }

}
