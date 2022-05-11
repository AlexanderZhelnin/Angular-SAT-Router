import { Root1Component } from './modules/root1/root1.component';
import { BehaviorSubject, Observable } from 'rxjs';
import { Component, Inject, OnInit } from '@angular/core';
import { RoutNode, SatRouterService, SATROUT_LINK_STRINGIFY } from 'sat-router';

// Apply LZW-compression to a string and return base64 compressed string.
export function zip(s: string): string
{
  try
  {
    const dict: { [key: string]: number } = {};
    const data = (s + '').split('');
    const out: any[] = [];
    let currChar: string;
    let phrase = data[0];
    let code = 256
    for (var i = 1; i < data.length; i++)
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
    for (let j = 0; j < out.length; j++)
    {
      out[j] = String.fromCharCode(out[j])
    }
    return encodeURIComponent(out.join(''));
  } catch (e)
  {
    console.log('Failed to zip string return empty string', e)
    return ''
  }
}

// Decompress an LZW-encoded base64 string
export function unzip(base64ZippedString: string)
{
  try
  {
    //const s = decodeURIComponent(decodeURI(window.atob(base64ZippedString)));
    const s = decodeURIComponent(base64ZippedString);
    const dict: { [key: string]: string } = {};
    const data = (s + '').split('')
    let currChar = data[0]
    let oldPhrase = currChar
    let out: any[] = [currChar]
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

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit
{
  constructor(
    //@Inject(SATROUT_LINK_STRINGIFY) stringify: (link: string)=>Observable<Rout[]>,
    private readonly s_rout: SatRouterService)
  {

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


  onClickRoot1()
  {
    this.s_rout.navigate([
      {
        path: 'root1',
        params: ['', 2],
        children: [
          {
            path: '1', params: ['1', 2],
            children: [
              { name: 'left', params: ['left', 3] },
              { name: 'right', params: ['right2', 4] },
            ]
          }
        ]
      }]);

  }
  onClickRoot2()
  {
    this.s_rout.navigate([
      {
        path: 'root2',
        params: ['', 2],
      }]);

  }

}
