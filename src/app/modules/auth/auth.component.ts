import { Component, OnInit } from '@angular/core';
import { SATRouterService } from 'sat-router';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit
{

  constructor(private s_router: SATRouterService) { }

  ngOnInit(): void
  {
  }

  onClick(): void
  {

    this.s_router.navigate('');
  }
}
