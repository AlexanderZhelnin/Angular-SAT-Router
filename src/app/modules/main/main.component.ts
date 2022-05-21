import { Component, OnInit } from '@angular/core';
import { SATRouterService } from 'sat-router';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit
{

  constructor(private s_router: SATRouterService)
  {
    console.log('MainComponent');

   }

  ngOnInit(): void
  {
  }

  onAuthClick(): void
  {
    this.s_router.navigate([{ path: 'auth' }]);

  }

}
