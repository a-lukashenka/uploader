import { Injectable, Pipe, PipeTransform } from '@angular/core';
import { DocumentFileType } from '../models/uploader-item';

@Injectable({
    providedIn: 'root',
})
@Pipe({
  name: 'uploaderTypes',
})

export class UploaderTypesPipe implements PipeTransform {
  DocumentFileType = DocumentFileType;

  transform(value: DocumentFileType[], isAccept: boolean = false): string {
    if (!value) {
      return;
    }
    const keys: string[] = [];
    for (const key of value) {
      for (const i in this.DocumentFileType) {
        if (key === this.DocumentFileType[i]) {
          if (keys.includes(`.${i.toLowerCase()}`) || keys.includes(i.toLowerCase())) {
            continue;
          }
          keys.push(isAccept ? `.${i.toLowerCase()}` : i.toLowerCase());
        }
      }
    }
    return keys.join(', ');
  }
}
