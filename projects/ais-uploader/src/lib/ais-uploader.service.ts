import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { last, map } from 'rxjs/operators';
import { UploaderConfig } from './models/uploader-config';

@Injectable()
export class AisUploaderService {
    private _uploadingProgress$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

    get uploadingProgress(): Observable<number> {
        return this._uploadingProgress$.asObservable();
    }

    constructor(
        private http: HttpClient,
    ) {
    }

    upload(file: File, config: UploaderConfig): Observable<any> {
        if (!file) return null;
        this._uploadingProgress$.next(0);
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post(`${config.apiUrl}`, formData, {
            headers: config.headers,
            responseType: config.responseType,
            reportProgress: true,
            observe: 'events',
        }).pipe(
            map(event => this.getEventMessage(event)),
            last(),
        );
    }

    uploadMultiple(files: File[], config: UploaderConfig): Observable<any> {
        if (!files || !files.length) return null;
        const formData = new FormData();
        for (const file of files) {
            formData.append('file', file);
        }
        return this.http.post(`${config.apiUrl}`, formData, {
            headers: config.headers,
            responseType: config.responseType,
            reportProgress: true,
            observe: 'events',
        }).pipe(
            map(event => this.getEventMessage(event)),
            last(),
        );
    }

    getEventMessage(event: any): number {
        if (event.type) {
            switch (event.type) {
                case HttpEventType.UploadProgress:
                    const percentDone = Math.round(100 * event.loaded / event.total);
                    this.showProgress(percentDone);
                    return;
                case HttpEventType.Response:
                    this.resetProgress();
                    return event.body;
                default:
                    return 0;
            }
        }
    }

    showProgress(persentage: number): void {
        this._uploadingProgress$.next(persentage);
    }

    resetProgress(): void {

    }
}
