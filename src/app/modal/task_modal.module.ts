import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule } from "nativescript-angular/common";
import { NativeScriptUIDataFormModule } from "nativescript-ui-dataform/angular";
import { NativeScriptUIAutoCompleteTextViewModule } from "nativescript-ui-autocomplete/angular";
import { NativeScriptFormsModule } from "nativescript-angular/forms";

import { TaskModalComponent } from "./task_modal.component";

@NgModule({
    imports: [
        NativeScriptUIDataFormModule,
        NativeScriptUIAutoCompleteTextViewModule,
        NativeScriptCommonModule,
        NativeScriptFormsModule
    ],
    declarations: [
        TaskModalComponent
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ],
})
export class TaskModalModule { }