import { Component, Inject, OnInit, Optional } from '@angular/core';
import { Observable, first, filter, firstValueFrom } from 'rxjs';
import { SATRouterService, SAT_ROUTE_ADDRESS } from 'sat-router';

@Component({
  selector: 'app-left-panel-top',
  templateUrl: './left-panel-top.component.html',
  styleUrls: ['./left-panel-top.component.scss']
})
export class LeftPanelTopComponent implements OnInit
{
  constructor(
    private s_router: SATRouterService,
    @Optional() @Inject(SAT_ROUTE_ADDRESS) private address: Observable<number[] | undefined> | undefined)
  {
  }

  ngOnInit(): void
  {

  }

  async onActivated(step: string)
  {
    if (!this.address) return;
    const address = await firstValueFrom(this.address.pipe(filter(_ => !!_)));

    if (!address) return;

    const cloned = this.s_router.cloneState([...address, 0]);

    if (!cloned.currentNode) return;
    cloned.currentNode.path = step;

    this.s_router.navigate(cloned.state);
  }
}
