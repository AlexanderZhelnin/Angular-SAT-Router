import { BehaviorSubject, first, map, shareReplay, switchMap } from 'rxjs';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditorComponent } from './editor.component';
import { EditorsComponent } from './editors.component';
import { SATRouterModule, SAT_ROUTE_LOADERS } from 'sat-router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { HttpClientModule } from '@angular/common/http';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { MainService } from 'src/app/services/main.service';

@NgModule({
  declarations: [
    EditorComponent,
    EditorsComponent
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    MatTabsModule,
    HttpClientModule,
    NgScrollbarModule,
    SATRouterModule
  ],
  providers: [
    {
      provide: SAT_ROUTE_LOADERS, useFactory: (s_files: MainService) =>
      {
        return s_files.files$
          .pipe(
            first(),
            map(fs => [
              { path: '', component: EditorsComponent },
              ...fs.map(f => ({
                path: f, component: EditorComponent, alwaysNew: true
                /* так как компонент не меняется, что бы была анимация указываем флаг alwaysNew */
              })),
              { path: '*', redirectTo: 'source-code' }
            ]));

      }, deps: [MainService]
    }
  ]
})
export class EditorModule { }
