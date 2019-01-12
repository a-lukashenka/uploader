# Uploader Button

[![AbstruseCI](https://ci.bleenco.io/badge/11)](https://ci.bleenco.io/repo/11)

Angular 2 - 7  File Uploader

## Installation

1. Add `ais-uploader` module as dependency to your project.

```console
npm install ais-uploader --save
```

2. Include `AisUploaderModule` into your main AppModule or in module where you will use it.

```ts
// app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AisUploaderModule } from 'ais-uploader';

@NgModule({
  imports: [
    BrowserModule,
    AisUploaderModule
  ],
  declarations: [ AppComponent ]
})
export class AppModule {}
```

**or** include `AisUploaderModule` into your SharedModule. This could be usefull if your project has nested Modules.

```ts
// shared.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AisUploaderModule } from 'ais-uploader';
...

@NgModule({
  imports: [
    CommonModule,
    AisUploaderModule,
    ...
  ],
  exports: [
    CommonModule,
    AisUploaderModule,
    ...
  ],
  ...
})
export class SharedModule {
}
```

```ts
// app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { SharedModule } from './shared.module';

@NgModule({
  imports: [
    BrowserModule,
    SharedModule
  ],
  declarations: [ AppComponent ]
})
export class AppModule {}

````


## Data Structures of Events

```ts
export interface UploaderConfig {    you can import { UploaderConfig } from 'ais-uploader';
      apiUrl: string; - url for upload
      supportedFormats: DocumentFileType[];  supported formats you can import { DocumentFileType } from 'ais-uploader';
      isDropAllowed?: boolean; - allow drop
      isMultiple?: boolean; - TODO
      isPreviewDisabled?: boolean; - creating preview data for img
      maxSize?: number;
      isAutoupload?: boolean;
}

// Methods
clear(emit: boolean: true): void - clear uploader;
preventUploading(): void - stop uploading

// output events emitted by ais-uploader
    onChange: EventEmitter<any> = emit uploaded file or preview data
    onProgress: EventEmitter<number> = emit progress
    onError: EventEmitter<string> emit errors from uploader

// getters
instance - uploader instance
fileName - selected file name
progress - uploading progress
```

## Upload Restrictions

```ts
onUploadOutput(output: UploadOutput): void {
....
} else if (output.type === 'rejected' && typeof output.file !== 'undefined') {
  // console.log(output.file.name + ' rejected');
}
...
```

## Example

**You can always run working example by cloning this repository, building project with `yarn build:prod` and running server with `node ./dist-app/api/index.js`.**

### Component Code

```ts
import { Component } from '@angular/core';
import { UploaderDirective, UploaderConfig, DocumentFileType } from 'ais-uploader';

@Component({
  selector: 'app-home',
  templateUrl: 'app-home.component.html'
})
export class AppHomeComponent {
  config: UploaderConfig = new UploaderConfig(
        'http://api.com/upload',
        [DocumentFileType.PNG],
        ...);
  @ViewChild('uploader') uploader: UploaderDirective; if you want upload manualy

  constructor() {
  }

  async upload(): Promise<void> {
    const path = await this.uploader.instant.upload(); - use .instant to manualy functionality
  }

  cancelUpload(): void {
    this.uploader.instant.clear()
  }

  removeFile(id: string): void {
    this.uploader.instant.clear()
  }
}
```

### Template Code


```html
<div [uploader]="config" #uploader="uploader" (onChange)="" (onProgress)="" (onError)="">
<!--inside upoader directive use clear atribute for remove file or stop for prevent uploading-->
  <button clear>clear</button>
  <button stop>prevent upload</button>
</div>
<p>File Name {{uploader.fileName}}</p>
<p>Progress {{uploader.progress}}</p>
<button type="button" class="start-upload-btn" (click)="uploader.preventUploading()">
  Clear
</button>
<button type="button" class="start-upload-btn" (click)="uploader.clear()">
  Stop Upload
</button>
```

### LICENCE

MIT
