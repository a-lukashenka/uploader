import { ModuleWithProviders, NgModule } from '@angular/core';
import { AisUploaderLibComponent } from './ais-uploader-lib.component';
import { UploaderDirective } from './directives/uploader.directive';
import { UploaderTypesPipe } from './pipes/uploader-enum.pipe';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AisUploaderLibService } from './ais-uploader-lib.service';

@NgModule({
    declarations: [
        AisUploaderLibComponent,
        UploaderDirective,
        UploaderTypesPipe,
    ],
    imports: [
        CommonModule,
        HttpClientModule,
    ],
    exports: [
        AisUploaderLibComponent,
        UploaderDirective,
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
