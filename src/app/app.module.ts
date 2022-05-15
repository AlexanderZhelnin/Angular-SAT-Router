import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { of } from 'rxjs';
import { SATRouterModule, RoutNode, SATROUT_LINK_PARSE, SATROUT_LINK_STRINGIFY } from 'sat-router';
import { AppComponent } from './app.component';
import { Root2Component } from './modules/root2.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TabsModule } from './tabs/tabs.module';

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
    Root2Component
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    TabsModule,
    SATRouterModule.forRoot(
      ...[0, 1, 2].map(index => ({ path: `root1:${index}`, loadChildren: () => import('./modules/root1.module').then(_ => _.Root1Module) })),
      ...[0, 1, 2].map(index => ({ path: `root2:${index}`, component: Root2Component })),
      // { path: 'root2', component: Root2Component },
      // { path: 'root1:rootRight', loadChildren: () => import('./modules/child1/child1.module').then(_ => _.Child1Module) },
      // { path: 'root1/1', loadChildren: () => import('./modules/child1/child1.module').then(_ => _.Child1Module) }
    )
  ],
  providers: [
    {
      provide: SATROUT_LINK_PARSE,
      useValue: (link: string) =>
      {
        link = /sat-link:([a-z0-9==%"]+)/img.exec(link)?.[1] ?? '';

        if (!link) return of(
          [0, 1, 2].map(index => ({
            path: 'root1',
            name: '' + index,
            params: { index },
            children: [
              {
                path: 'child1',
                children: [
                  { path: 'subChild1', name: '0' },
                  { path: 'subChild3', name: '1' }
                ]
              }
            ]
          }))
        );

        const s = unzip(decodeURIComponent(link));
        return of(JSON.parse(s));
        //return of();
      }
    },
    {
      provide: SATROUT_LINK_STRINGIFY,
      useValue: (rs: RoutNode[]) =>
      {
        const s = encodeURIComponent(zip(JSON.stringify(rs)));
        return of(`#sat-link:${s}`);
      }
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule
{


}
