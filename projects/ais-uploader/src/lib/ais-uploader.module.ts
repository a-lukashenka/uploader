import { ModuleWithProviders, NgModule } from '@angular/core';
import { AisUploaderComponent } from './ais-uploader.component';
import { UploaderDirective } from './directives/uploader.directive';
import { UploaderTypesPipe } from './pipes/uploader-enum.pipe';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AisUploaderService } from './ais-uploader.service';

@NgModule({
    declarations: [
        AisUploaderComponent,
        UploaderDirective,
        UploaderTypesPipe,
    ],
    imports: [
        CommonModule,
        HttpClientModule,
    ],
    exports: [
        AisUploaderComponent,
        UploaderDirective,
    ],
    providers: [
        AisUploaderService,
    ],
    entryComponents: [
        AisUploaderComponent,
    ],
})
export class AisUploaderModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: AisUploaderModule,
            providers: [ ],
        };
    }
}
