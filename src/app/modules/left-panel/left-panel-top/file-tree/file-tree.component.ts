import { filter, Subscription } from 'rxjs';
import { Component, OnInit, OnDestroy, ViewChild, ViewChildren, QueryList, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { MatListOption, MatSelectionList, MatSelectionListChange } from '@angular/material/list';
import { MainService } from 'src/app/services/main.service';
import { SATRouterService } from 'sat-router';

@Component({
  selector: 'app-file-tree',
  templateUrl: './file-tree.component.html',
  styleUrls: ['./file-tree.component.scss']
})
export class FileTreeComponent implements OnInit, OnDestroy, AfterViewInit
{
  @ViewChild('list', { static: true }) list!: MatSelectionList;
  @ViewChildren(MatListOption) listItems!: QueryList<MatListOption>;

  private _subs: Subscription[] = [];
  constructor(
    public s_main: MainService,
    private s_router: SATRouterService,
    private cdr: ChangeDetectorRef
  ) { }


  ngOnInit(): void
  {
    this._subs.push(
      this.s_router
        .changed$
        .subscribe({ next: () => this.select() }));
  }

  ngAfterViewInit(): void
  {
    this.select();
  }

  ngOnDestroy(): void
  {
    this._subs.forEach(s => s.unsubscribe());
  }

  onSelected(s: MatSelectionListChange)
  {
    this.s_main.stepFile(s.options[0].value);
  }

  /** Выбор элемента списка */
  private select(): void
  {
    const selectedFile = this.s_main.currentFile;
    const sli = this.listItems.find(li => li.value === selectedFile);
    if (!!sli)
      this.list.selectedOptions.select(sli);

    this.cdr.detectChanges();
  }

}
