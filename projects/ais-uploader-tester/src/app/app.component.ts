import { Component, ViewChild } from '@angular/core';
import { DocumentFileType, UploaderConfig, UploaderDirective } from 'ais-uploader';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    @ViewChild('uploaderTemplateVariable', {static: false}) uploader: UploaderDirective;
    data;
    config: UploaderConfig = new UploaderConfig(
        'http://jet-api.gml.aisnovations.com/api/uploader/public',
        [DocumentFileType.JPEG, DocumentFileType.JPG], true, true,
        0, false, false);

    constructor() {
        // this.config.headers = new HttpHeaders({
        //     Authorization: 'Bearer Token',
        // });
    }
    async upload(): Promise<void> {
        const path = await this.uploader.upload();
    }
}
