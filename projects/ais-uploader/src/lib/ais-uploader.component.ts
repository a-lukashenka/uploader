import {
    Component, EventEmitter, Inject,
    OnDestroy, OnInit, Output, PLATFORM_ID,
    ViewChild, ViewEncapsulation,
} from '@angular/core';
import { UploaderConfig } from './models/uploader-config';
import { of, Subscription } from 'rxjs';
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

    get fileName(): string {
        if (!this._file) {
            return '';
        }
        return this._file.name;
    }

    get tooltipMessage(): string {
        if (!this.config.supportedFormats.length) {
            return `Max. size is ${this.config.maxSize ? this.config.maxSize : 'unlimited'}Mb`;
        }
        const formats = this.uploaderEnum.transform(this.config.supportedFormats);
        return `Supported formats are ${formats || 'All formats'}. Max. size is ${this.config.maxSize ?
            this.config.maxSize : 'unlimited'}Mb`;
    }

    select(): void {
        let event: any;
        if (typeof (<any>window).MouseEvent === 'function') {
            event = new MouseEvent('click', {});
        } else {
            event = new CustomEvent('click');
        }
        this.fileSelector.nativeElement.dispatchEvent(event);
    }

    clear(emit: boolean = true): void {
        this._file = undefined;
        this.fileSelector.nativeElement.value = '';
        if (emit) {
            this.onChange.emit('');
        }
    }

    async loadFile(event): Promise<any> {
        console.log(event);
        const _file = event.target.files[0];
        if (!_file || !this.config) {
            this.throwError('Uploader error');
            return;
        }
        if (this.config.maxSize &&
            _file.size / 1024 / 1024 > this.config.maxSize) {
            this.throwError(`File size should be no more than ${this.config.maxSize}Mb`);
            return;
        }
        if (this.config.supportedFormats.length && _file.type &&
            !this.config.supportedFormats.includes(_file.type)) {
            this.throwError(`Unsupported file format`);
            return;
        }
        if (this.config.supportedFormats.length && !_file.type &&
            !this._validateFormat(_file.name)) {
            this.throwError(`Unsupported file format`);
            return;
        }
        this._file = _file;
        if (this.config.isAutoupload) {
            try {
                const path = await this.upload();
                this.onChange.emit(path);
            } catch (e) {
                this.onError.emit(e);
            }
            return;
        }
        if (!this.config.isPreviewDisabled) {
            this._makePreview(event.target.files[0]);
        }
    }

    // upload to server
    upload(): Promise<any> {
        if (this._progressSub$) {
            this._progressSub$.unsubscribe();
        }
        this._onLoaderSub();
        return new Promise(resolve => {
            this._uploaderSub$ = this.uploderService.upload(this._file, this.config).subscribe(res => {
                resolve(res);
            }, err => {
                this.onError.emit('Uploding error');
                this.preventUploading();
                resolve(undefined);
            });
        });
    }

    // cancel current uploading
    preventUploading(): void {
        if (!this.uploadingProgress) return;
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

    private _onLoaderSub(): void {
        this._progressSub$ = this.uploderService.uploadingProgress
            .subscribe(progress => {
                this.onProgress.emit(progress);
                this.uploadingProgress = progress;
            });
    }

    private _makePreview(_file: File): void {
        const reader = new FileReader();
        reader.onload = (event: any) => {
            this.onChange.emit(event.target.result);
        };
        reader.readAsDataURL(_file);
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
        this._file = undefined;
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
                default:
                    break;
            }
        }
    }
}
