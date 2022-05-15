import { Component, OnInit } from '@angular/core';
import { SATRouterOutletComponent } from 'sat-router';

@Component({
  selector: 'app-sub1child1',
  templateUrl: './child1-sub1.component.html',
  styleUrls: ['./child1-sub1.component.scss']
})
export class Child1Sub1Component implements OnInit
{

  private static _index = 0;
  index = ++Child1Sub1Component._index;

  constructor(public sro: SATRouterOutletComponent)
  {
  }

  ngOnInit(): void
  {
  }

}
