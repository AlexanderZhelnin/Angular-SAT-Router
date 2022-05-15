import { Observable } from 'rxjs';
import { Component, OnInit, ChangeDetectionStrategy, Input, Optional, Inject } from '@angular/core';
import { RoutNode, SATRouterOutletComponent, SATRouterService, SATROUT_DIRECTION } from 'sat-router';

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

  #saveState?: RoutNode;
  #currentPath: number[] = [];

  constructor(
    @Optional() private sro: SATRouterOutletComponent,
    private readonly s_rout: SATRouterService,
    @Optional() @Inject(SATROUT_DIRECTION) currentPath: Observable<number[] | undefined>
  )
  {
    currentPath?.subscribe({ next: cp => this.#currentPath = cp ?? [] });
  }

  ngOnInit(): void
  {
  }

  get path1() { return `${this.path}${this.start}` }
  get path2() { return `${this.path}${this.start + 1}` }

  get isVertical() { return this.path === 'subChild'; }

  #cloneData(): { cloneData: RoutNode[]; currentNodes: RoutNode[]; }
  {
    const cloneData = JSON.parse(JSON.stringify(this.s_rout.pathData ?? [])) as RoutNode[];
    let currentNodes: RoutNode[] = cloneData;
    this.#currentPath.forEach(i => { currentNodes = currentNodes[i].children ?? []; });
    return { cloneData, currentNodes }
  }

  onClick1(): void
  {
    const cloned = this.#cloneData();
    if (cloned.currentNodes[this.index].path === this.path1) return;

    if (!!this.sro)
      cloned.currentNodes[this.index] = {
        path: this.path1,
        name: '' + this.index,
        params: { index: this.index },
      };
    else if (!!this.#saveState)
      cloned.currentNodes[this.index] = this.#saveState;
    else
      cloned.currentNodes[this.index] = {
        path: this.path1,
        name: '' + this.index,
        params: { index: this.index },
        children: [
          {
            path: 'child1',
            children: [
              { path: 'subChild1', name: '0' },
              { path: 'subChild3', name: '1' }
            ]
          }
        ]
      };

    this.s_rout.navigate(cloned.cloneData);
  }

  onClick2(): void
  {
    const cloned = this.#cloneData();
    if (cloned.currentNodes[this.index].path === this.path2) return;

    this.#saveState = cloned.currentNodes[this.index];

    cloned.currentNodes[this.index] = {
      path: this.path2,
      name: '' + this.index,
      params: { index: this.index },
    }

    this.s_rout.navigate(cloned.cloneData);
  }
}
