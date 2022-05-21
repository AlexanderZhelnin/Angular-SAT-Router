import { filter, first, firstValueFrom, Observable } from 'rxjs';
import { Component, OnInit, ChangeDetectionStrategy, Input, Optional, Inject } from '@angular/core';
import { SATStateNode, SATRouterOutletComponent, SATRouterService, SAT_ROUTE_ADDRESS } from 'sat-router';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabsComponent implements OnInit
{
  @Input() start: number = 1;
  @Input() index: number = 0;
  @Input() level: number = 0;
  @Input() path: string = 'root';

  private saveState?: SATStateNode;

  constructor(
    private readonly s_router: SATRouterService,
    @Optional() @Inject(SAT_ROUTE_ADDRESS) private address: Observable<number[] | undefined> | undefined,
  )
  {
  }

  ngOnInit(): void
  {
  }

  get path1() { return `${this.path}${this.start}` }
  get path2() { return `${this.path}${this.start + 1}` }

  get isVertical() { return this.path === 'subChild'; }

  async onClick1()
  {
    if (!this.address) return;
    const address = await firstValueFrom(this.address.pipe(first(), filter(_ => !!_)));

    if (!address) return;

    const cloned = this.s_router.cloneState(address);

    if (!cloned.currentNode?.children) return;

    if (cloned.currentNode?.children?.[this.index]?.path === this.path1) return;

    if (this.path !== 'root')
      cloned.currentNode.children[this.index] = {
        path: this.path1,
        outlet: '' + this.index,
        params: { index: this.index },
      };
    // else if (!!this.saveState)
    //   cloned.currentNode.children[this.index] = this.saveState;
    else
      cloned.currentNode.children[this.index] = {
        path: this.path1,
        outlet: '' + this.index,
        params: { index: this.index },
        children: [
          {
            path: 'child1',
            children: [
              { path: 'subChild1', outlet: '0' },
              { path: 'subChild3', outlet: '1' }
            ]
          }
        ]
      };

    this.s_router.navigate(cloned.state);
  }

  async onClick2()
  {
    if (!this.address) return;
    const address = await firstValueFrom(this.address.pipe(first(), filter(_ => !!_)));

    if (!address) return;

    const cloned = this.s_router.cloneState(address);

    if (!cloned.currentNode?.children) return;

    if (cloned.currentNode?.children?.[this.index]?.path === this.path2) return;

    this.saveState = cloned.currentNode.children[this.index];

    cloned.currentNode.children[this.index] = {
      path: this.path2,
      outlet: '' + this.index,
      params: { index: this.index },
    }
    this.s_router.navigate(cloned.state);
  }
}
