import { Directive, EventEmitter, ElementRef, HostListener, Input, Output, Renderer2 } from '@angular/core';

@Directive({selector: '[ng2FileDrop]'})
export class FileDropDirective {
    @Input() uploader: any;
    @Output() fileOver: EventEmitter<any> = new EventEmitter();
    @Output() onFileDrop: EventEmitter<File[]> = new EventEmitter<File[]>();

    protected element: ElementRef;

    constructor(
        element: ElementRef,
        private renderer: Renderer2,
    ) {
        this.element = element;
    }

    @HostListener('window:dragenter', ['$event'])
    onDragEnter(e: any): void {
        this.renderer.addClass(this.element.nativeElement, 'blink');
    }

    @HostListener('drop', ['$event'])
    onDrop(e: any): void {
        e.stopPropagation();
        e.preventDefault();
        console.log('DROP');
        const transfer = this._getTransfer(e);
        if (!transfer) {
            return;
        }
        const event = {type: 'drop'};
        console.log(transfer.files);
    }

    @HostListener('dragover', ['$event'])
    onDragOver(event: any): void {
        console.log('DROP_OVER', event);
        const transfer = this._getTransfer(event);
        if (!this._haveFiles(transfer.types)) {
            return;
        }

        transfer.dropEffect = 'copy';
        this._preventAndStop(event);
        this.fileOver.emit(true);
    }

    @HostListener('dragleave', ['$event'])
    onDragLeave(event: any): any {
        console.log('DRAG_LEAVE', event);
        if ((this as any).element) {
            if (event.currentTarget === (this as any).element[0]) {
                return;
            }
        }

        this._preventAndStop(event);
        this.fileOver.emit(false);
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
}
