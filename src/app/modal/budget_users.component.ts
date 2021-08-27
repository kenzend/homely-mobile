import { AfterViewInit, Component, ElementRef, ViewChild } from "@angular/core";
import { ModalDialogParams } from "nativescript-angular/modal-dialog";
import { screen } from "tns-core-modules/platform";
import { Page } from "tns-core-modules/ui";



@Component({
    selector: "budget-users",
    template: `
        <GridLayout [width]="getWidth()" [height]="getHeight()" rows="auto,auto,auto,*" backgroundColor="silver" class="p-l-10">
            <Label row="0" text="Creator:" fontSize="17" fontWeight="500"></Label>
            <Image row="1" width="30" height="30" [src]="'~/fonts/'+owner" borderRadius="100" horizontalAlignment="left"></Image>
            <Label row="2" text="Members:" fontSize="17" fontWeight="500"></Label>
            <WrapLayout row="3" width="100%">
                <Image *ngFor="let member of members;" row="1" width="30" height="30" [src]="'~/fonts/'+member" borderRadius="100" class="m-r-5"></Image>
            </WrapLayout>
            <Image row="0" height="30" src="~/fonts/close_modal.png" horizontalAlignment="right" (tap)="close()"></Image>
        </GridLayout>
    `
})

export class BudgetUsersComponent implements AfterViewInit{
    owner :string = "";
    members :string[] = [];

    getWidth(): number{
        return screen.mainScreen.widthDIPs-50;
    }
    getHeight(): number{
        return screen.mainScreen.heightDIPs-400;
    }

    ngAfterViewInit() { }

    constructor(private params: ModalDialogParams, private page: Page) {
        this.owner = params.context.owner;
        this,this.members = params.context.members;
    }

    close() {
        this.params.closeCallback();
    }
}
