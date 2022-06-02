import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { of } from 'rxjs';
import { SATRouterModule, ISATStateNode, SAT_LINK_PARSE, SAT_ROUTE_CONFIGURATION, SAT_STATE_STRINGIFY } from 'sat-router';
import { AppComponent } from './app.component';
import { Root2Component } from './modules/root2.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthComponent } from './modules/auth/auth.component';
import { MatButtonModule } from '@angular/material/button';

export function zip(s: string): string
{
  try
  {
    const dict: { [key: string]: number } = {};
    const data = (s + '').split('');
    const out: number[] = [];
    let currChar: string;
    let phrase = data[0];
    let code = 256
    for (let i = 1; i < data.length; i++)
    {
      currChar = data[i]
      if (dict[phrase + currChar] !== undefined)
        phrase += currChar
      else
      {
        out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0))
        dict[phrase + currChar] = code
        code++
        phrase = currChar
      }
    }
    out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0))

    return out.map(ch => String.fromCharCode(ch)).join('');
  } catch (e)
  {
    console.log('Failed to zip string return empty string', e)
    return ''
  }
}

export function unzip(s: string)
{
  try
  {
    const dict: { [key: string]: string } = {};
    const data = (s + '').split('')
    let currChar = data[0]
    let oldPhrase = currChar
    let out: string[] = [currChar]
    let code = 256
    let phrase: string;
    for (let i = 1; i < data.length; i++)
    {
      var currCode = data[i].charCodeAt(0)
      if (currCode < 256)
        phrase = data[i];
      else
        phrase = dict[currCode] ? dict[currCode] : oldPhrase + currChar;

      out.push(phrase);
      currChar = phrase.charAt(0);
      dict[code] = oldPhrase + currChar;
      code++;
      oldPhrase = phrase;
    }
    return out.join('');
  } catch (e)
  {
    console.log('Failed to unzip string return empty string', e);
    return '';
  }
}

@NgModule({
  declarations: [
    AppComponent,
    AuthComponent,
    Root2Component
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatButtonModule,
    SATRouterModule.create([
      { path: 'auth', component: AuthComponent },
      { path: 'main', loadChildren: () => import('./modules/main/main.module').then(_ => _.MainModule) },
    ])
  ],
  providers: [
    {
      provide: SAT_LINK_PARSE,
      useValue: (link: string) =>
      {
        link = /sat-link:([a-z0-9==%_\.\-"]+)/img.exec(link)?.[1] ?? '';

        if (!link) return of<ISATStateNode[]>([
          {
            path: 'main',
            children: [
              {
                path: 'panel-left',
                outlet: 'left',
                children: [
                  {
                    path: 'top',
                    outlet: 'top',
                    children: [
                      { path: 'files' }
                    ]
                  },
                  { path: 'bottom', outlet: 'bottom', }
                ]
              },

              {
                path: 'editor',
                outlet: 'center',
                children: [
                  { path: 'Program.cs', params: { name: 'Program.cs' } }
                ]
              },

              {
                path: 'root1',
                outlet: '2',
                params: { index: 2 },
                children: [
                  {
                    path: 'child1',
                    children: [
                      { path: 'subChild1', outlet: '0' },
                      { path: 'subChild3', outlet: '1' }
                    ]
                  }
                ]
              }
            ]
          }]
        );

        const s = unzip(decodeURIComponent(link));
        return of(JSON.parse(s));
      }
    },
    {
      provide: SAT_STATE_STRINGIFY,
      useValue: (rs: ISATStateNode[]) =>
      {
        const s = encodeURIComponent(zip(JSON.stringify(rs)));
        return of(`#sat-link:${s}`);
      }
    },
    //{ provide: SAT_ROUTE_CONFIGURATION, useValue: { debug: true } }

  ],
  bootstrap: [AppComponent]
})
export class AppModule
{


}
