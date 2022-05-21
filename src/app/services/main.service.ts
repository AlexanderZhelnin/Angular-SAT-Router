import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SATRouterService } from 'sat-router';

@Injectable({ providedIn: 'root' })
export class MainService
{
  files$ = new BehaviorSubject<string[]>([
    'Program.cs',
    'Startup.cs',
    'LongPollingQuery.cs',
    'AuthorsController.cs'
  ]);

  constructor(private s_router: SATRouterService) { }


  get currentFile(): string | undefined
  {
    return this.s_router.getNode(this.s_router.state ?? [], [0, 1, 0])?.path;
  }

  stepFile(name: string)
  {
    const cloned = this.s_router.cloneState([0, 1, 0]);

    if (!cloned.currentNode) return;

    cloned.currentNode.path = name;
    cloned.currentNode.params = { name };

    this.s_router.navigate(cloned.state);
  }
}
