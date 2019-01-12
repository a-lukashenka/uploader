import {
    ComponentFactoryResolver, Directive,
    ElementRef, HostListener, Input, OnDestroy, OnInit, Renderer2, ViewContainerRef,
} from '@angular/core';
import { UploaderConfig } from '../models/uploader-config';
import { Subscription } from 'rxjs';
import { Output, EventEmitter } from '@angular/core';
import { AisUploaderComponent } from '../ais-uploader.component';

@Directive({
    selector: '[uploader]',
    exportAs: 'uploader',
})
export class UploaderDirective implements OnInit, OnDestroy {
    @Input('uploader')
    get config(): UploaderConfig {
        return this._config;
    }

    set config(config: UploaderConfig) {
        if (config === this._config) {
            return;
        }
        this._config = config;
    }

    @Output() onChange: EventEmitter<any> = new EventEmitter();
    @Output() onProgress: EventEmitter<number> = new EventEmitter();
    @Output() onError: EventEmitter<string> = new EventEmitter();

    private _clickFn: Function;
    private _btnContainer: any;
    private _config: UploaderConfig;
    private _sub$: Subscription = new Subscription();

    constructor(
        private factory: ComponentFactoryResolver,
        private ref: ElementRef,
        private viewContainerRef: ViewContainerRef,
        private renderer: Renderer2,
    ) {
    }

    ngOnInit(): void {
        if (
            !this.config.apiUrl ||
            !this.config.supportedFormats
        ) {
            this.onError.emit('Incorrect config!');
            return;
        }
        this._setBtnContainer();
    }

    ngOnDestroy(): void {
        this.viewContainerRef.clear();
        if (this._clickFn) {
            this._clickFn();
        }
    }

    // uploader instance
    get instance(): AisUploaderComponent {
        if (!this._btnContainer) return;
        return this._btnContainer.instance;
    }

    // selected file name
    get fileName(): string {
        if (!this.instance) return;
        return this.instance.fileName;
    }

    // info message
    get tooltipMessage(): string {
        if (!this.instance) return;
        return this.instance.tooltipMessage;
    }

    // get progress
    get progress(): number {
        if (!this.instance) return;
        return this.instance.uploadingProgress;
    }

    // remove file from uploader
    clear(emit: boolean = true): void {
        if (!this.instance) return;
        this.instance.clear(emit);
    }

    // cancel uploading
    preventUploading(): void {
        if (!this.instance) return;
        this.instance.preventUploading();
    }

    // DROP
    @HostListener('dragover', ['$event'])
    onDragOver(event: any): void {
        const transfer = this._getTransfer(event);
        if (!this._haveFiles(transfer.types)) {
            return;
        }
        transfer.dropEffect = 'copy';
        this._preventAndStop(event);
    }

    @HostListener('dragleave', ['$event'])
    onDragLeave(event: any): any {
        if ((this as any).element) {
            if (event.currentTarget === (this as any).element[0]) {
                return;
            }
        }
        this._preventAndStop(event);
    }

    @HostListener('drop', ['$event'])
    onDrop(event: any): void {
        if (!this.config.isDropAllowed) return;
        const transfer = this._getTransfer(event);
        if (!transfer) {
            return;
        }
        this._preventAndStop(event);
        this.instance.loadFile({target: {files: transfer.files}});
    }

    protected _getTransfer(event: any): any {
        return event.dataTransfer ? event.dataTransfer : event.originalEvent.dataTransfer; // jQuery fix;
    }

    protected _preventAndStop(event: any): any {
        event.preventDefault();
        event.stopPropagation();
    }

    protected _haveFiles(types: any): any {
        if (!types) {
            return false;
        }
        if (types.indexOf) {
            return types.indexOf('Files') !== -1;
        } else if (types.contains) {
            return types.contains('Files');
        } else {
            return false;
        }
    }

    // DROP END

    private _setBtnContainer(): void {
        const componentFactory = this.factory.resolveComponentFactory(AisUploaderComponent);
        this._btnContainer = this.viewContainerRef.createComponent(componentFactory);
        this._btnContainer.instance.config = this.config;
        this._clickFn = this.renderer.listen(this.ref.nativeElement, 'click', (e) => this._handleClick(e));
        this._sub$.add(this._btnContainer.instance.onChange.subscribe(data => this.onChange.emit(data)));
        this._sub$.add(this._btnContainer.instance.onError.subscribe(err => this.onError.emit(err)));
        this._sub$.add(this._btnContainer.instance.onProgress.subscribe(progress => this.onProgress.emit(progress)));
    }

    private _handleClick(event): void {
        const attributes = Object.values(event.target.attributes).map(el => el['name']);
        if (!!attributes.find(attr => attr == 'clear') &&
            this.fileName && !this.instance.uploadingProgress) {
            this.clear();
            return;
        }
        if (!!attributes.find(attr => attr == 'stop') &&
            this.fileName && this.instance.uploadingProgress) {
            this.preventUploading();
            return;
        }
        this._btnContainer.instance.select();
    }

}
