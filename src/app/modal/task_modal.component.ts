import { AfterViewInit, Component, ViewChild } from "@angular/core";
import { ModalDialogParams } from "nativescript-angular/modal-dialog";
import { TokenModel, AutoCompleteEventData } from "nativescript-ui-autocomplete";
import { ObservableArray } from "tns-core-modules/data/observable-array";
import { screen } from "tns-core-modules/platform";
import { Page } from "tns-core-modules/ui";
import { Task } from "../models/task.model";
import { RadAutoCompleteTextViewComponent } from "nativescript-ui-autocomplete/angular";
import { RadDataFormComponent } from "nativescript-ui-dataform/angular";

@Component({
    selector: "task-modal",
    template: `
		<GridLayout rows="auto,*,auto" [width]="getWidth()" [height]="getHeight()" backgroundColor="white">
            <StackLayout row="0">
                <GridLayout columns="*,50">
                    <StackLayout col="1" backgroundImage="~/fonts/close_modal.png" backgroundRepeat="no-repeat" backgroundPosition="center" backgroundSize="cover" height="30" (tap)="close()"></StackLayout>
                    <!--
                    <StackLayout col="0" backgroundColor="#3f8bff" height="30" (tap)="submit()"></StackLayout>
                    <Label col="0" [text]="action_text" horizontalAlignment="center" verticalAlignment="center" fontSize="19" fontWeight="500" color="white"></Label>-->
                </GridLayout>
                <StackLayout class="m-t-10" backgroundImage="~/fonts/stripe_line.png" backgroundRepeat="no-repeat" backgroundPosition="center" backgroundSize="cover" [width]="getWidth()" height="15"></StackLayout>
            </StackLayout>
            <StackLayout row="2">
                <StackLayout backgroundColor="#3f8bff" (tap)="submit()" class='m-b-10' horizontalAlignment="center" borderRadius="5" padding="5" [width]="getWidth()-50">
                    <Label [text]="action_text" horizontalAlignment="center" verticalAlignment="center" fontSize="19" fontWeight="500" color="white"></Label>
                </StackLayout>
                <StackLayout class="m-b-15" backgroundImage="~/fonts/stripe_line.png" backgroundRepeat="no-repeat" backgroundPosition="center" backgroundSize="cover" [width]="getWidth()" height="15"></StackLayout>
                <Image src="~/fonts/brand_seal.png" width="100" height="100" class="m-b-15"></Image>
            </StackLayout>
            <GridLayout rows="auto,auto,*" row="1">
                <RadDataForm row="0" [source]="task" #form>
                    <TKEntityProperty tkDataFormProperty name="title" displayName="Title:" required="true" index="0" hintText="A title for your task"></TKEntityProperty>
                    <TKEntityProperty tkDataFormProperty name="start" displayName="Start time:" required="true" index="1">
                        <TKPropertyEditor tkEntityPropertyEditor type="TimePicker"></TKPropertyEditor>
                    </TKEntityProperty>
                    <TKEntityProperty tkDataFormProperty name="end" displayName="End time:" required="true" index="2">
                        <TKPropertyEditor tkEntityPropertyEditor type="TimePicker"></TKPropertyEditor>
                    </TKEntityProperty>
                    <TKEntityProperty tkDataFormProperty name="notes" displayName="Notes (optional):" required="false" index="3" hintText="Some notes about the task..."></TKEntityProperty>
                </RadDataForm>
                <Label row="1" text="Participants (optional):" fontSize="12" color="black" class="m-l-10 m-t-20"></Label>
                <RadAutoCompleteTextView borderWidth="2" row="2" #participants class="m-t-5" id="participants" [items]="family_members" displayMode="Tokens" suggestMode="Append" layoutMode="Wrap" hint="@username" (loaded)="onRadAutoLoaded()" (tokenAdded)="onTokenAdded($event)" (tokenRemoved)="onTokenRemoved($event)">

                </RadAutoCompleteTextView>
            </GridLayout>
        </GridLayout>
	`
})
export class TaskModalComponent implements AfterViewInit {
    @ViewChild("form", { static: false }) form: RadDataFormComponent;
    @ViewChild("participants", { static: false }) participants_rad: RadAutoCompleteTextViewComponent;
    
    task: {title: string, start: string, end: string, backgroundColor?: string, notes?: string} = {
        title: '',
        start: '',
        end: '',
        notes: ''
    };
    family_members: ObservableArray<TokenModel>;
    participants: string[] = [];
    task_list: Task[] = [];
    random_background_color: string;
    action_text: string;
    

    
    ngAfterViewInit() { }
    onRadAutoLoaded() {
        var radauto = this.participants_rad.autoCompleteTextView;
        if(this.params.context.index !== -1) {
            this.task_list[this.params.context.index].members.forEach((value)=>{
                radauto.addToken(new TokenModel(this.getUsernameFromImage(value), undefined));
            });
        }
    }

    

    getWidth(): number {
        return screen.mainScreen.widthDIPs-(screen.mainScreen.widthDIPs*0.15);
    }

    getHeight(): number {
        return screen.mainScreen.heightDIPs-(screen.mainScreen.heightDIPs*0.15);
    }

    onTokenAdded(args: AutoCompleteEventData) {
        this.participants.push(args.token.text);
    }

    onTokenRemoved(args: AutoCompleteEventData) {
        this.participants.splice(this.participants.indexOf(args.token.text), 1);
    }

    getImageFromName(username: string): string {
        return this.params.context.members[this.params.context.members.findIndex(x=>x.username===username)].image;
    }

    getUsernameFromImage(image: string): string {
        return this.params.context.members[this.params.context.members.findIndex(x=>x.image===image)].username;
    }


    
    constructor(private params: ModalDialogParams, private page: Page) {
        //this.task = params.context.task_list[params.context.index];
        this.task_list = params.context.task_list;
        this.random_background_color = params.context.randomBackgroundColor;
        if(params.context.index !== -1) {
            this.action_text = "Submit Change(s)";
            this.task.title = this.task_list[params.context.index].title;
            this.task.start = this.task_list[params.context.index].start;
            this.task.end = this.task_list[params.context.index].end;
            this.task.notes = this.task_list[params.context.index].notes;
        }
        else
            this.action_text = "Add Task";
        this.family_members = new ObservableArray<TokenModel>();
        for(let i=0; i<params.context.members.length; i++) {
            this.family_members.push(new TokenModel(params.context.members[i].username, undefined));
        }
    }

    

    submit() {
        // <<< Validate form
        var title = this.form.dataForm.getPropertyByName("title");
        var start = this.form.dataForm.getPropertyByName("start");
        var end = this.form.dataForm.getPropertyByName("end");
        var error = false;
        var isStartNullEmpty = (start.value == null || start.value.trim() === '');
        var isEndNullEmpty = (end.value == null || end.value.trim() === '');
        if(title.value == null || title.value.trim() === '') {
            error = true;
            title.errorMessage = "Please name your task 📋!";
            this.form.dataForm.notifyValidated("title", false);
        }
        if(isStartNullEmpty) {
            error = true;
            start.errorMessage = "Please choose a start time! 🕛";
            this.form.dataForm.notifyValidated("start", false);
        } 
        if(isEndNullEmpty) {
            error = true;
            end.errorMessage = "Please choose an end time! 🕝";
            this.form.dataForm.notifyValidated("end", false);
        } 
        if(!isStartNullEmpty && !isEndNullEmpty) {
            var hourOfStart = start.value.split(':',2)[0];
            var minuteOfStart = start.value.split(':',2)[1];
            var hourOfEnd = end.value.split(':',2)[0];
            var minuteOfEnd = end.value.split(':',2)[1];
            if(hourOfStart > hourOfEnd || (hourOfStart === hourOfEnd && minuteOfStart > minuteOfEnd)){
                error = true;
                end.errorMessage = "End time can't be before start time 😠";
                this.form.dataForm.notifyValidated("end", false);
            } 
        }
        if(error) 
            return;
        // >>> Validate form


        // <<< Submitting data and close modal
        var participants_images: {username: string, image: string}[] = [];
        this.participants.forEach((value) => {
            if(participants_images.findIndex(x=>x.username===value) == -1)
                participants_images.push({username: value, image: this.getImageFromName(value)});
        });
        var final: string[] = [];
        participants_images.forEach((value) => {
            final.push(value.image);
        });
        if(this.params.context.index === -1)
            this.task_list.push(new Task(this.task.title, this.task.start, this.task.end, final, this.random_background_color, false, this.task.notes));
        else {
            this.task_list[this.params.context.index].title = this.task.title;
            this.task_list[this.params.context.index].start = this.task.start;
            this.task_list[this.params.context.index].end = this.task.end;
            this.task_list[this.params.context.index].notes = this.task.notes;
            this.task_list[this.params.context.index].members = final;
        }
        this.params.closeCallback();
        // >>> Submitting data and close modal
    }

    close() {
        this.params.closeCallback();
    }
}

