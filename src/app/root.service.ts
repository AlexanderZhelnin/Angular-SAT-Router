import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class RootService
{
  private static _index = 0;
  index = ++RootService._index;
  constructor() { }
}
