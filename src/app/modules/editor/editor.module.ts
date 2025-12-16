import { BehaviorSubject, first, map, shareReplay, switchMap, delay } from 'rxjs';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditorComponent } from './editor.component';
import { EditorsComponent } from './editors.component';
import { SATRouterModule, SAT_ROUTE_RESOLVERS } from 'sat-router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient, HttpClientModule } from '@angular/common/http';
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
    SATRouterModule,
    HttpClientModule,
  ],
  // providers: [
  //   {
  //     provide: SAT_ROUTE_RESOLVERS, useFactory: (client: HttpClient) =>
  //     {
  //       return client.get<string[]>('тут адрес')
  //         .pipe(map(fs => [
  //           // Это корневой компонент
  //           { path: '', component: EditorsComponent },
  //           ...fs.map(f => ({
  //             path: f, component: EditorComponent, alwaysNew: true
  //             /* так как компонент не меняется, что бы была анимация указываем флаг alwaysNew */
  //           })),
  //         ]));
  //     }, deps: [HttpClient]
  //   }
  // ]
  providers: [
    {
      provide: SAT_ROUTE_RESOLVERS, useFactory: (s_files: MainService) =>
      {
        return s_files.files$
          .pipe(
            // delay(5000),
            first(),
            map(fs => [
              { path: '', component: EditorsComponent },
              ...fs.map(f => ({
                path: f, component: EditorComponent, alwaysNew: true
                /* так как компонент не меняется, что бы была анимация указываем флаг alwaysNew */
              })),
              { path: '*', redirectTo: 'source-code' }
            ]));

      }, deps: [MainService, HttpClient]
    }
  ]

})
export class EditorModule { }


