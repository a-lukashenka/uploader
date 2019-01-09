import { Component, OnInit } from '@angular/core';
import { UploaderConfig } from 'ais-uploader-lib';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { log } from 'util';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
    config: UploaderConfig = new UploaderConfig('http://jet-api.gml.aisnovations.com/api/uploader/public');

    async ngOnInit(): Promise<any> {
        console.log(await this.upload());
    }

    upload(): Promise<any> {
        const cancel = new Promise(cancel => this.cancel = cancel);
        return Promise.resolve()
            .then(() => {
                const p = cancel.then((() => Promise.reject(this.stop())));
                return Promise.race([of('test').pipe(delay(3000)).toPromise(),
                    p]);
            })
            .catch(e => console.log(e));
    }

    stop(): string {
        return 'The operation was canceled.';
    }

    cancel = function (): void {
    };

}
