import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule } from "nativescript-angular/common";
import { NativeScriptUIAutoCompleteTextViewModule } from "nativescript-ui-autocomplete/angular";
import { NativeScriptUIListViewModule } from "nativescript-ui-listview/angular";
import { NativeScriptFormsModule } from "nativescript-angular/forms";
import { NativeScriptDateTimePickerModule } from "nativescript-datetimepicker/angular";

import { BudgetListComponent } from "./budget_list.component";

@NgModule({
    imports: [
        NativeScriptUIAutoCompleteTextViewModule,
        NativeScriptCommonModule,
        NativeScriptFormsModule,
        NativeScriptUIListViewModule,
        NativeScriptDateTimePickerModule
    ],
    declarations: [
        BudgetListComponent,
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ],
})
export class BudgetListModule { }