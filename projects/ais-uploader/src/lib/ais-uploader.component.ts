import { Component, EventEmitter, Inject, OnDestroy, OnInit, Output, PLATFORM_ID, ViewChild, ViewEncapsulation } from '@angular/core';
import { UploaderConfig } from './models/uploader-config';
import { Subscription } from 'rxjs';
import { isPlatformServer } from '@angular/common';
import { DocumentFileType } from './models/uploader-item';
import { AisUploaderService } from './ais-uploader.service';
import { UploaderTypesPipe } from './pipes/uploader-enum.pipe';

@Component({
    selector: 'ais-uploader',
    templateUrl: './ais-uploader.component.html',
    styleUrls: ['./ais-uploader.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class AisUploaderComponent implements OnInit, OnDestroy {
    config: UploaderConfig;
    uploadingProgress: number;
    @Output() onChange: EventEmitter<any> = new EventEmitter();
    @Output() onProgress: EventEmitter<number> = new EventEmitter();
    @Output() onError: EventEmitter<string> = new EventEmitter();

    @ViewChild('fileSelector') fileSelector;
    private _file: File;
    private _files: File[];
    private _allowedExtensions: string[] = [];
    private _progressSub$: Subscription;
    private _uploaderSub$: Subscription;

    constructor(
        @Inject(PLATFORM_ID) platformId: string,
        private uploderService: AisUploaderService,
        private uploaderEnum: UploaderTypesPipe,
    ) {
        if (isPlatformServer(platformId) || typeof (<any>window).MouseEvent === 'function') {
            return;
        }

        function CustomEvent(event, params): any {
            params = params || {bubbles: false, cancelable: false, detail: undefined};
            const evt: any = document.createEvent('CustomEvent');
            evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
            return evt;
        }

        CustomEvent.prototype = (<any>window).Event.prototype;
        (<any>window).CustomEvent = CustomEvent;
    }

    ngOnInit(): void {
        this._generateAllowedExtensions();
    }

    ngOnDestroy(): void {
        if (this._progressSub$) {
            this._progressSub$.unsubscribe();
        }
        if (this._uploaderSub$) {
            this._uploaderSub$.unsubscribe();
        }
    }

    // return file name or arr file names if isMultiple: true
    get fileName(): string | string[] {
        if (this.config.isMultiple) {
            return this.filesNames;
        }
        if (!this._file) {
            return '';
        }
        return this._file.name;
    }

    // return arr file names if isMultiple: true
    get filesNames(): string[] {
        if (!this._files || !this._files.length) {
            return undefined;
        }
        return this._files.map(file => file.name);
    }

    // return info message
    get tooltipMessage(): string {
        if (!this.config.supportedFormats.length) {
            return `Max. size is ${this.config.maxSize ? this.config.maxSize : 'unlimited'} Mb`;
        }
        const formats = this.uploaderEnum.transform(this.config.supportedFormats);
        return `Supported formats are ${formats || 'All formats'}. Max. size is ${this.config.maxSize ?
            this.config.maxSize : 'unlimited'} Mb`;
    }

    // open selction window
    select(): void {
        let event: any;
        if (typeof (<any>window).MouseEvent === 'function') {
            event = new MouseEvent('click', {});
        } else {
            event = new CustomEvent('click');
        }
        this.fileSelector.nativeElement.dispatchEvent(event);
    }

    // remove file from files arr
    delete(i: number): void {
        this._files.splice(i, 1);
    }

    // remove file or all files
    clear(emit: boolean = true): void {
        this._file = undefined;
        this._files = undefined;
        this.fileSelector.nativeElement.value = '';
        if (emit) {
            this.onChange.emit('');
        }
    }

    async loadFile(event): Promise<any> {
        if (this.config.isMultiple) {
            const _files = event.target.files;
            for (const file of _files) {
                const isValid = this.validate(file);
                if (!isValid) {
                    return;
                }
            }
            this._files = [..._files];
        } else {
            const _file = event.target.files[0];
            const isValid = this.validate(_file);
            if (!isValid) {
                return;
            }
            this._file = _file;
        }
        if (this.config.isAutoupload) {
            try {
                const res = await this.upload();
                this.onChange.emit(res);
            } catch (e) {
                this.onError.emit(e);
            }
            return;
        }
        if (!this.config.isPreviewDisabled) {
            this._makePreview();
            return;
        }
        this.onChange.emit(this._file.name);
    }

    // upload to server
    upload(): Promise<any> {
        if (this._progressSub$) {
            this._progressSub$.unsubscribe();
        }
        this._onLoaderSub();
        if (!this.config.isMultiple) {
            return new Promise(resolve => {
                this._uploaderSub$ = this.uploderService.upload(this._file, this.config).subscribe(res => {
                    this.onProgress.emit(0);
                    this.uploadingProgress = 0;
                    resolve(res);
                }, err => {
                    this.onError.emit('Uploding error');
                    this.preventUploading();
                    resolve(undefined);
                });
            });
        } else {
            return new Promise(resolve => {
                this._uploaderSub$ = this.uploderService.uploadMultiple(this._files, this.config).subscribe(res => {
                    this.onProgress.emit(0);
                    this.uploadingProgress = 0;
                    resolve(res);
                }, err => {
                    this.onError.emit('Uploding error');
                    this.preventUploading();
                    resolve(undefined);
                });
            });
        }
    }

    // cancel current uploading
    preventUploading(): void {
        if (!this.uploadingProgress) {
            return;
        }
        if (this._progressSub$) {
            this._progressSub$.unsubscribe();
        }
        if (this._uploaderSub$) {
            this._uploaderSub$.unsubscribe();
        }
        this.onProgress.emit(0);
        this.uploadingProgress = 0;
        this.clear();
    }

    private validate(file): boolean {
        if (!file || !this.config) {
            this.throwError('Uploader error');
            return false;
        }
        if (this.config.maxSize &&
            file.size / 1024 / 1024 > this.config.maxSize) {
            this.throwError(`File size should be no more than ${this.config.maxSize}Mb`);
            return false;
        }
        if (this.config.supportedFormats.length && file.type &&
            !this.config.supportedFormats.includes(file.type)) {
            this.throwError(`Unsupported file format`);
            return false;
        }
        if (this.config.supportedFormats.length && !file.type &&
            !this._validateFormat(file.name)) {
            this.throwError(`Unsupported file format`);
            return false;
        }
        return true;
    }

    private _onLoaderSub(): void {
        this._progressSub$ = this.uploderService.uploadingProgress
            .subscribe(progress => {
                this.onProgress.emit(progress);
                this.uploadingProgress = progress;
            });
    }

    private _makePreview(): void {
        if (!this.config.isMultiple) {
            const reader = new FileReader();
            reader.onload = (event: any) => {
                this.onChange.emit(event.target.result);
            };
            reader.readAsDataURL(this._file);
        } else {
            const dataArr = [];
            for (let i = 0; i < this._files.length; i++) {
                const reader = new FileReader();
                reader.onload = (event: any) => {
                    dataArr[i] = (event.target.result);
                };
                reader.readAsDataURL(this._files[i]);
                if (i == this._files.length - 1) {
                    this.onChange.emit(dataArr);
                }
            }
        }
    }

    private _validateFormat(name: string): boolean {
        if (!this.config.supportedFormats.length) {
            return true;
        }
        const extension = name.split('.').pop().toLowerCase();
        return this._allowedExtensions.some(s => s === extension);
    }

    private throwError(message: string): void {
        this.onError.emit(message);
        this.fileSelector.nativeElement.value = '';
    }

    private _generateAllowedExtensions(): void {
        if (!this.config || !this.config.supportedFormats) {
            return;
        }
        for (const format of this.config.supportedFormats) {
            switch (format) {
                case DocumentFileType.DOC:
                    this._allowedExtensions.push('doc');
                    break;
                case DocumentFileType.DOCX:
                    this._allowedExtensions.push('docx');
                    break;
                case DocumentFileType.XLSX:
                    this._allowedExtensions.push('xlsx');
                    break;
                case DocumentFileType.XLS:
                    this._allowedExtensions.push('xls');
                    break;
                case DocumentFileType.PDF:
                    this._allowedExtensions.push('pdf');
                    break;
                case DocumentFileType.TXT:
                    this._allowedExtensions.push('txt');
                    break;
                case DocumentFileType.PPTX:
                    this._allowedExtensions.push('pptx');
                    break;
                case DocumentFileType.PPT:
                    this._allowedExtensions.push('ppt');
                    break;
                case DocumentFileType.AVI:
                    this._allowedExtensions.push('avi');
                    break;
                case DocumentFileType.FLV:
                    this._allowedExtensions.push('flv');
                    break;
                case DocumentFileType.MP4:
                    this._allowedExtensions.push('mp4');
                    break;
                case DocumentFileType.MPEG:
                    this._allowedExtensions.push('mpeg');
                    break;
                case DocumentFileType.OGG:
                    this._allowedExtensions.push('ogg');
                    break;
                case DocumentFileType.WEBM:
                    this._allowedExtensions.push('webm');
                    break;
                case DocumentFileType.JPEG:
                    this._allowedExtensions.push('jpeg');
                    break;
                case DocumentFileType.JPG:
                    this._allowedExtensions.push('jpg');
                    break;
                case DocumentFileType.PNG:
                    this._allowedExtensions.push('png');
                    break;
                case DocumentFileType.TIFF:
                    this._allowedExtensions.push('tiff');
                    break;
                case DocumentFileType.WBMP:
                    this._allowedExtensions.push('wbmp');
                    break;
                case DocumentFileType.WEBP:
                    this._allowedExtensions.push('webp');
                    break;
                case DocumentFileType.SVG:
                    this._allowedExtensions.push('svg');
                    break;
                case DocumentFileType.GIF:
                    this._allowedExtensions.push('gif');
                    break;
                case DocumentFileType.CSV:
                    this._allowedExtensions.push('csv');
                    break;
                case DocumentFileType.MSCSV:
                    this._allowedExtensions.push('csv');
                    break;
                default:
                    break;
            }
        }
    }
}
