import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({ name: 'safestyle' })
export class SafeStylePipe implements PipeTransform
{
  constructor(private sanitizer: DomSanitizer) { }
  transform(url: string)
  {
    return this.sanitizer.bypassSecurityTrustStyle(url);
  }
}
