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
        this._uploadingProgress$.next(0);
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post(`${config.apiUrl}`, formData, {
            responseType: 'text',
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
