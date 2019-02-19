import { DocumentFileType } from './uploader-item';
import { HttpHeaders } from '@angular/common/http';

export class UploaderConfig {
    apiUrl: string;
    supportedFormats: DocumentFileType[];
    isDropAllowed?: boolean;
    isMultiple?: boolean;
    isPreviewDisabled?: boolean;
    maxSize?: number;
    isAutoupload?: boolean;
    headers?: HttpHeaders;
    responseType?: any | string;

    constructor(
        apiUrl: string,
        formats: DocumentFileType[] = [],
        isMultiple: boolean = false,
        isDropAllowed: boolean = false,
        maxSize: number = 0,
        isAutoupload: boolean = false,
        isPreviewDisabled: boolean = false,
    ) {
        this.apiUrl = apiUrl;
        this.supportedFormats = formats;
        this.isPreviewDisabled = isPreviewDisabled;
        this.maxSize = maxSize;
        this.isAutoupload = isAutoupload;
        this.isMultiple = isMultiple;
        this.isDropAllowed = isDropAllowed;
    }
}

export namespace UploaderResponseType {
    export const JSON = 'json' as 'json';
    export const BUFFER = 'arraybuffer' as 'arraybuffer';
    export const BLOB = 'blob' as 'blob';
    export const TEXT = 'text' as 'text';
}
