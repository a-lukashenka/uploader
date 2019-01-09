import { DocumentFileType } from './uploader-item';

export class UploaderConfig {
    supportedFormats: DocumentFileType[];
    isMakePreview: boolean;
    maxSize: number;
    isAutoupload: boolean;
    apiUrl: string;

    constructor(
        apiUrl: string,
        formats: DocumentFileType[] = [],
        maxSize: number = 20,
        isAutoupload: boolean = false,
        isMakePreview: boolean = true,
    ) {
        this.apiUrl = apiUrl;
        this.supportedFormats = formats;
        this.isMakePreview = isMakePreview;
        this.maxSize = maxSize;
        this.isAutoupload = isAutoupload;
    }
}
