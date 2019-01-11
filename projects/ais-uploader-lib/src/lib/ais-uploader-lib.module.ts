import { ModuleWithProviders, NgModule } from '@angular/core';
import { AisUploaderLibComponent } from './ais-uploader-lib.component';
import { UploaderDirective } from './directives/uploader.directive';
import { UploaderTypesPipe } from './pipes/uploader-enum.pipe';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AisUploaderLibService } from './ais-uploader-lib.service';
import { FileDropDirective } from './directives/file-drop.directive';

@NgModule({
    declarations: [
        AisUploaderLibComponent,
        UploaderDirective,
        FileDropDirective,
        UploaderTypesPipe,
    ],
    imports: [
        CommonModule,
        HttpClientModule,
    ],
    exports: [
        AisUploaderLibComponent,
        UploaderDirective,
        FileDropDirective,
    ],
    providers: [
        AisUploaderLibService,
    ],
    entryComponents: [
        AisUploaderLibComponent,
    ],
})
export class AisUploaderLibModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: AisUploaderLibModule,
            providers: [ ],
        };
    }
}
