import { Component } from '@angular/core';
import { UploaderConfig } from 'ais-uploader';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    config: UploaderConfig = new UploaderConfig(
        'http://jet-api.gml.aisnovations.com/api/uploader/public',
        [], false, false,
        50, false, false);
}
