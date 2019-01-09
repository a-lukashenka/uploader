import {
    ComponentFactoryResolver, Directive,
    ElementRef, Input, OnDestroy, OnInit, Renderer2, ViewContainerRef,
} from '@angular/core';
import { UploaderConfig } from '../models/uploader-config';
import { Subscription } from 'rxjs';
import { Output, EventEmitter } from '@angular/core';
import { AisUploaderLibComponent } from '../ais-uploader-lib.component';

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
        this._setBtnContainer();
    }

    ngOnDestroy(): void {
        this.viewContainerRef.clear();
        if (this._clickFn) {
            this._clickFn();
        }
    }

    get instance(): AisUploaderLibComponent {
        return this._btnContainer.instance;
    }

    private _setBtnContainer(): void {
        const componentFactory = this.factory.resolveComponentFactory(AisUploaderLibComponent);
        this._btnContainer = this.viewContainerRef.createComponent(componentFactory);
        this._btnContainer.instance.config = this.config;
        this._clickFn = this.renderer.listen(this.ref.nativeElement, 'click', (e) => this._handleClick(e));
        this._sub$.add(this._btnContainer.instance.onChange.subscribe(data => this.onChange.emit(data)));
        this._sub$.add(this._btnContainer.instance.onError.subscribe(err => this.onError.emit(err)));
        this._sub$.add(this._btnContainer.instance.onProgress.subscribe(progress => this.onProgress.emit(progress)));
    }

    private _handleClick(event): void {
        const attributes = Object.values(event.target.attributes).map(el => el['name']);
        console.log(this._btnContainer.instance.fileName);
        if (!!attributes.find(attr => attr == 'clearuloader') &&
            this._btnContainer.instance.fileName) {
            this._btnContainer.instance.clear();
            return;
        }
        this._btnContainer.instance.select();
    }

}
