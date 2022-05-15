import { Root1Component } from './modules/root1.component';
import { BehaviorSubject, Observable } from 'rxjs';
import { Component, Inject, OnInit } from '@angular/core';
import { RoutNode, SATRouterService, SATROUT_LINK_STRINGIFY } from 'sat-router';
import { RootService } from './root.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit
{
  constructor(
    //@Inject(SATROUT_LINK_STRINGIFY) stringify: (link: string)=>Observable<Rout[]>,
    s_root: RootService,
    private readonly s_rout: SATRouterService)
  {
    console.log(s_root.index);

  }
  ngOnInit(): void
  {
    // const json = JSON.stringify([
    //   {
    //     path: 'root1',
    //     params: ['', 2],
    //     children: [
    //       {
    //         path: '1', params: ['1', 2],
    //         children: [
    //           { name: 'left', params: ['left', 3] },
    //           { name: 'right', params: ['right2', 4] },
    //         ]
    //       }
    //     ]
    //   },
    //   {
    //     path: 'root1',
    //     name: 'rootRight',
    //     params: ['', 2,],
    //     children: [
    //       { name: 'left', params: ['left', 5] },
    //       { name: 'right', params: ['right2', 6] },
    //     ]
    //   }]);
    // const l1 = window.btoa(encodeURI(encodeURIComponent(json)));
    // const l1unz = JSON.parse(decodeURIComponent(decodeURI(window.atob(l1))));
    // const l2 = zip(json);
    // const jsonunz = unzip(l2);

    //const link = window.btoa(encodeURI(encodeURIComponent(json)));

    // setTimeout(() =>
    // {
    //   this.s_rout.navigate(`#sat-link:${link}`)

    // }, 5000);

  }


  // onClickRoot1()
  // {
  //   this.s_rout.navigate([
  //     {
  //       path: 'root1',
  //       params: ['', 2],
  //       children: [
  //         {
  //           path: '1', params: ['1', 2],
  //           children: [
  //             { name: 'left', params: ['left', 3] },
  //             { name: 'right', params: ['right2', 4] },
  //           ]
  //         }
  //       ]
  //     },
  //     {
  //       path: 'root1',
  //       name: 'rootRight',
  //       params: ['', 2,],
  //       children: [
  //         { name: 'left', params: ['left', 5] },
  //         { name: 'right', params: ['right2', 6] },
  //       ]
  //     }
  //   ]);

  // }
  // onClickRoot2()
  // {
  //   this.s_rout.navigate([
  //     {
  //       path: 'root2',
  //       params: ['', 2],
  //     }]);

  // }

}
