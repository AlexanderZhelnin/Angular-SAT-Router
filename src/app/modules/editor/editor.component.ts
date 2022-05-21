import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, HostBinding, Inject } from '@angular/core';
import hljs from 'highlight.js';
import { Observable } from 'rxjs';
import { SAT_ROUTE_PARAMS, SAT_ROUTE_PATH } from 'sat-router';

function GetCursorPosition(context: any): number
{
  const selection = window.getSelection();
  if (!selection) return 0;
  const range = selection.getRangeAt(0);
  range.setStart(context, 0);
  return range.toString().length;
}

function setCursorPosition(context: any, len: number): void
{
  const selection = window.getSelection();
  if (!selection) return;
  const pos = getTextNodeAtPosition(context, len);
  selection.removeAllRanges();
  const r = new Range();
  r.setStart(pos.node, pos.position);
  selection.addRange(r);
}

function getTextNodeAtPosition(root: any, index: number): { node: any, position: number }
{
  const treeWalker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT,
    {
      acceptNode: (elem: Node): number =>
      {
        const l = elem?.textContent?.length ?? 0;
        if (index > l)
        {
          index -= l;
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });

  return { node: treeWalker.nextNode() ?? root, position: index };
}

export interface IEditor
{
  name: string;
  position?: number;
}

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit
{
  @ViewChild('code', { static: true }) public codeEditor!: ElementRef

  public code: string = '';
  constructor(
    private http: HttpClient,
    @Inject(SAT_ROUTE_PARAMS) private params: Observable<any | undefined>)
  {

  }

  ngOnInit(): void
  {
    this.params.subscribe({
      next: (editor: IEditor) =>
      {
        this.http.get(`assets/source-code/${editor.name}`, { responseType: 'text' }).subscribe(
          {
            next: (data: any) =>
            {
              this.code = data;
              this.codeEditor.nativeElement.innerHTML = hljs.highlight(this.code, { language: 'csharp', ignoreIllegals: true }).value;
            }
          }
        );
      }
    });

  }
  // ngAfterViewInit(): void
  // {
  //   this.codeEditor.nativeElement.innerHTML = hljs.highlight(this.code, { language: 'csharp', ignoreIllegals: true }).value;
  // }

  onInput(e: any): void
  {
    if (this.code === this.codeEditor.nativeElement.textContent) return;

    this.code = this.codeEditor.nativeElement.textContent;

    const position = GetCursorPosition(this.codeEditor.nativeElement);
    this.codeEditor.nativeElement.innerHTML = hljs.highlight(this.code, { language: 'csharp', ignoreIllegals: true }).value;
    setCursorPosition(this.codeEditor.nativeElement, position);

  }

  onKeyDown(e: KeyboardEvent): void
  {
    if (e.key !== 'Tab') return;

    e.preventDefault();
    const s = GetCursorPosition(this.codeEditor.nativeElement);
    let txt = this.codeEditor.nativeElement.textContent as string;
    txt = txt.slice(0, s) + '    ' + txt.slice(s);
    this.codeEditor.nativeElement.innerHTML = hljs.highlight(txt, { language: 'csharp', ignoreIllegals: true }).value;
    setCursorPosition(this.codeEditor.nativeElement, s + 4);

  }
}
