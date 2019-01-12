import { DocumentFileType } from './uploader-item';

export class UploaderConfig {
    apiUrl: string;
    supportedFormats: DocumentFileType[];
    isDropAllowed?: boolean;
    isMulti?: false;
    isPreviewDisabled?: boolean;
    maxSize?: number;
    isAutoupload?: boolean;

    constructor(
        apiUrl: string,
        formats: DocumentFileType[] = [],
        isMulti: boolean = false,
        isDropAllowed: boolean = false,
        maxSize: number = 20,
        isAutoupload: boolean = false,
        isPreviewDisabled: boolean = false,
    ) {
        this.apiUrl = apiUrl;
        this.supportedFormats = formats;
        this.isPreviewDisabled = isPreviewDisabled;
        this.maxSize = maxSize;
        this.isAutoupload = isAutoupload;
        this.isMulti = this.isMulti;
        this.isDropAllowed = this.isAutoupload;
    }
}
