import { SATRouterModule } from 'sat-router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabsComponent } from './tabs.component';
import { MatTabsModule } from '@angular/material/tabs';

@NgModule({
  declarations: [
    TabsComponent
  ],
  imports: [
    CommonModule,
    SATRouterModule,
    MatTabsModule
  ],
  providers: [],
  exports: [TabsComponent]
})
// Применение декоратора дочерних маршрутов
export class TabsModule
{

}
