import { AfterViewInit, Component, ElementRef, ViewChild } from "@angular/core";
import { Http } from "tns-core-modules";
import { DatePipe } from "@angular/common";
import { ModalDialogParams } from "nativescript-angular/modal-dialog";
import { ListViewEventData, ListViewItemSnapMode, RadListView } from "nativescript-ui-listview";
import { ObservableArray } from "tns-core-modules/data/observable-array";
import { screen } from "tns-core-modules/platform";
import { GridLayout, Label, Page, StackLayout, TextField } from "tns-core-modules/ui";
import { Color, EventData, View } from "tns-core-modules/ui/frame";
import { Budget } from "../models/budget.model";
import { BudgetItem } from "../models/budget_item.model";
import { confirm } from "tns-core-modules/ui/dialogs";


@Component({
    selector: "budget-list",
    template: `
        <GridLayout #pagen rows="*,auto" backgroundColor="black">
            <GridLayout rows="auto,auto,*" backgroundColor="white" paddingTop="30" paddingLeft="10" paddingRight="10" borderRadius="0 0 15 15">
                <GridLayout row="0" columns="*,auto,auto">
                    <StackLayout #delete col="2" width="35" height="35" backgroundColor="#d6d6d6" borderRadius="100" (tap)="deleteBudget($event)">
                        <Label [text]="trash" fontSize="20" horizontalAlignment="center" class="fa-solid m-t-5" color="#2b88d8"></Label>
                    </StackLayout>

                    <StackLayout #add col="1" width="35" height="35" backgroundColor="#d6d6d6" borderRadius="100" class="m-r-5" (tap)="addBudget($event)">
                        <Label [text]="plus" fontSize="22" horizontalAlignment="center" class="fa-solid" color="#2b88d8" marginTop="3"></Label>
                    </StackLayout>

                    <Label col="0" text="The budget list" fontSize="22" fontWeight="700" verticalAlignment="middle" horizontalAlignment="left" color="black"></Label>
                </GridLayout>

                <GridLayout row="1" columns="auto,*,auto" borderWidth="2" borderColor="#2b88d8" borderRadius="10" padding="5" class="m-t-10">
                    <Image col="0" width="20" height="20" src="~/fonts/search_icon.png" class="m-l-5" verticalAlignment="middle"></Image>
                    <Image col="2" width="30" height="30" borderRadius="100" borderWidth="2" [src]="'~/fonts/' + user" class="m-l-5" verticalAlignment="middle"></Image>
                    <TextField col="1" fontSize="16" hint="Seach for budget using title" autocorrect="false" autocapitalization="none" (textChange)="search($event)" class="m-b-5"></TextField>
                </GridLayout>

                <RadListView #budgetlist row="2" [items]="budget_list" pullToRefresh="true" [filteringFunction]="myFilteringFunc" multipleSelection="false" selectionBehavior="Press" (itemSelected)="commitSelection($event)" (pullToRefreshInitiated)="onPullToRefreshInitiated($event)" class="m-t-10">
                    <ng-template tkListItemTemplate let-item="item">
                        <GridLayout height="120" columns="auto,*,auto" borderWidth="0.7 0.7 1.5 0.7" borderRadius="10" class="m-t-10 m-b-10">
                            <StackLayout col="0" height="100%" width="8" backgroundColor="#9dc88d" borderRadius="12 0 0 12"></StackLayout>
                            <StackLayout col="2" height="100%" width="8" backgroundColor="#9dc88d" borderRadius="0 12 12 0"></StackLayout>
                            <GridLayout col="1" width="100%" rows="*,auto" columns="*,auto" class="p-l-5 p-r-5 p-b-5">
                                <ScrollView orientation="horizontal" height="50" row="1" col="0" (tap)="tapOnScroll(item)">
                                    <StackLayout orientation="horizontal">
                                        <Image width="30" height="30" borderRadius="100" borderWidth="2" [src]="'~/fonts/' + item.owner"></Image>
                                        <Image width="30" height="30" borderRadius="100" borderWidth="2" [src]="'~/fonts/' + member" *ngFor="let member of item.members" class="m-l-5"></Image>
                                    </StackLayout>
                                </ScrollView>
                                <Image col="1" row="0" rowSpan="2" verticalAlignment="bottom" width="25" height="25" [src]="action_icon" (tap)="commitDelete(item)" class="m-l-15"></Image>
                                <Label row="0" col="0" colSpan="2" verticalAlignment="middle">
                                    <FormattedString>
                                        <Span [text]="item.name+' '" fontSize="18" fontWeight="bold" color="black"></Span>
                                        <Span [text]="' (' + item.startDate + ' - ' + item.endDate + ')'" color="gray"></Span>
                                    </FormattedString>
                                </Label>
                            </GridLayout>
                        </GridLayout>
                    </ng-template>
                    <ng-template tkListViewFooter>
                        <GridLayout #addtemplate visibility="collapse" height="140" columns="auto,*,auto" borderWidth="0.7 0.7 1.5 0.7" borderRadius="10" class="m-t-10" marginBottom="200">
                            <StackLayout col="0" height="100%" width="8" backgroundColor="#0da2ff" borderRadius="12 0 0 12"></StackLayout>
                            <StackLayout col="2" height="100%" width="8" backgroundColor="#0da2ff" borderRadius="0 12 12 0"></StackLayout>
                            <GridLayout col="1" width="100%" rows="*,auto" columns="*,auto" class="p-l-5 p-r-5 p-b-5">
                                <TextField #addtemplatename fontSize="18" row="0" col="0" colSpan="2" hint="Name your budget" autocorrect="false" autocapitalization="none" verticalAlignment="middle"></TextField>
                                <GridLayout row="1" col="0" colSpan="2" columns="auto,*,auto,*" height="50">
                                    <Label col="0" text="From" fontSize="15" fontWeight="500" color="black"></Label>
                                    <Label col="2" text="To" fontSize="15" fontWeight="500" color="black"></Label>
                                    <TextField #addtemplatestart col="1" fontSize="15" hint="mm/dd/yyyy" autocorrect="false" autocapitalization="none" keyboardType="datetime" maxLength="10"></TextField>
                                    <TextField #addtemplateend col="3" fontSize="15" hint="mm/dd/yyyy" autocorrect="false" autocapitalization="none" keyboardType="datetime" maxLength="10"></TextField>
                                </GridLayout>
                            </GridLayout>
                        </GridLayout>
                    </ng-template>

                    <ListViewLinearLayout tkListViewLayout itemHeight="140" scrollDirection="Vertical" itemInsertAnimation="Fade" itemDeleteAnimation="Fade"></ListViewLinearLayout>
                </RadListView>
            </GridLayout>

            <GridLayout row="1" [width]="getCloseWidth()" borderRadius="5" backgroundColor="red" verticalAlignment="bottom" horizontalAlignment="center" class="m-b-15 m-t-10" (tap)="close()">
                <Label text="Close" color="white" verticalAlignment="middle" horizontalAlignment="center" fontSize="20" fontWeight="700"></Label>
            </GridLayout>
            <GridLayout #addbutton visibility="collapsed" columns="*,*" row="1" [width]="getCloseWidth()" borderRadius="5" verticalAlignment="bottom" horizontalAlignment="center" class="m-b-15 m-t-10">
                <StackLayout col="0" width="100%" backgroundColor="#71afe5" (tap)="commitAdd()" borderRadius="5 0 0 5">
                    <Label text="Add" color="white" verticalAlignment="middle" horizontalAlignment="center" fontSize="20" fontWeight="700"></Label>
                </StackLayout>
                <StackLayout col="1" width="100%" backgroundColor="#ff7b7b" (tap)="exitAddMode()" borderRadius="0 5 5 0">
                    <Label text="Cancel" color="white" verticalAlignment="middle" horizontalAlignment="center" fontSize="20" fontWeight="700"></Label>
                </StackLayout>
            </GridLayout>
            <GridLayout #cancelbutton visibility="collapsed" row="1" [width]="getCloseWidth()" borderRadius="5" backgroundColor="#ff7b7b" verticalAlignment="bottom" horizontalAlignment="center" class="m-b-15 m-t-10" (tap)="exitDeleteMode()">
                <Label text="Cancel" color="white" verticalAlignment="middle" horizontalAlignment="center" fontSize="20" fontWeight="700"></Label>
            </GridLayout>
        </GridLayout>
    `
})

export class BudgetListComponent implements AfterViewInit{
    @ViewChild("add", {static: false}) add: ElementRef;
    @ViewChild("addbutton", {static: false}) addbutton: ElementRef;
    @ViewChild("addtemplate", {static: false}) addtemplate: ElementRef;
    @ViewChild("addtemplatename", {static: false}) addtemplatename: ElementRef;
    @ViewChild("addtemplatestart", {static: false}) addtemplatestart: ElementRef;
    @ViewChild("addtemplateend", {static: false}) addtemplateend: ElementRef;

    @ViewChild("delete", {static: false}) delete: ElementRef;
    @ViewChild("cancelbutton", {static: false}) cancelbutton: ElementRef;
    @ViewChild("budgetlist", {static: false}) budgetlist: ElementRef;
    @ViewChild("pagen", {static: false}) pagen: ElementRef;

    ngAfterViewInit() { }

    trash = String.fromCharCode(0xf2ed);
    plus = String.fromCharCode(0xf067);
    action_icon = "~/fonts/tap_icon.png";
    datepipe: DatePipe = new DatePipe('en-US');


    budget_list: ObservableArray<Budget>;
    _myFilteringFunc: (item: any) => any;
    user: string;

    tapOnScroll(args: Budget) {
        if(this.action_icon === '~/fonts/tap_icon.png') {
            this.passThroughToListView(args);
            return;
        }
        this.commitDelete(args);
    }
    getCloseWidth(): number {
        return screen.mainScreen.widthDIPs / 2 ;
    }
    passThroughToListView(args: Budget) {
        const listview = this.budgetlist.nativeElement as RadListView;
        listview.selectItemAt(this.budget_list.indexOf(args));
    }

    commitSelection(args: ListViewEventData) {
        if(this.action_icon !== '~/fonts/tap_icon.png') {
            this.commitDelete(this.budget_list.getItem(args.index));
            return;
        }
        const listview = args.object as RadListView;

        confirm({
            title: 'Select budget "' + this.budget_list.getItem(args.index).name + '"?',
            message: "You will be able to edit this budget",
            okButtonText: "Confirm",
            cancelButtonText: "Cancel"
        }).then((result)=>{
            if(result) 
                this.params.closeCallback({value: true, selectedBudget: this.budget_list.getItem(args.index)});
            
            listview.deselectAll();
        });
    }

    commitAdd() {
        var error = false;
        var error_msg = "Encounter these errors:\n";
        var name = (<TextField>this.addtemplatename.nativeElement).text;
        var start = (<TextField>this.addtemplatestart.nativeElement).text;
        var end = (<TextField>this.addtemplateend.nativeElement).text;

        try{
            var monthStart = Number(start.split('/',3)[0])-1;
            var dayStart = Number(start.split('/',3)[1]);
            var yearStart = Number(start.split('/',3)[2]);
            var monthEnd = Number(end.split('/',3)[0])-1;
            var dayEnd = Number(end.split('/',3)[1]);
            var yearEnd = Number(end.split('/',3)[2]);
            var startDate = new Date(yearStart,monthStart,dayStart);
            var endDate = new Date(yearEnd,monthEnd,dayEnd);
            if(startDate.toString() == 'Invalid Date' || endDate.toString() == 'Invalid Date') {
                error=true;
                error_msg +="> Date format is not correct.\n";
            }
            if(startDate > endDate) {
                error = true;
                error_msg += "> End date cannot be before start date.\n";
            }
        } catch (e) {
            error = true;
            error_msg += "> Date format is not correct.\n";
        }
        
        if(name.trim() === "") {
            error = true;
            error_msg += "> Budget's name cannot be empty.\n";
        }
        if(error) {
            alert(error_msg);
            return;
        }
        confirm({
            title: 'Adding budget "' + name.trim() + '"?\n',
            message: "from " + this.datepipe.transform(startDate, 'mediumDate') + " to " + this.datepipe.transform(endDate, 'mediumDate'),
            okButtonText: "Confirm",
            cancelButtonText: "Cancel"
        }).then((result)=> {
            if(result) {
                this.budget_list.push(new Budget(name, this.datepipe.transform(startDate, 'mediumDate'), this.datepipe.transform(endDate, 'mediumDate'), [], this.user, []));
                this.exitAddMode(false);
                // <<< Call API to add

                // >>> Call API to add
            }
        });
    }

    commitDelete(args: Budget) {
        if(this.action_icon === '~/fonts/tap_icon.png') {
            this.passThroughToListView(args);
            return;
        }
        confirm({
            title: 'Deleting budget "' + args.name + '"?\n',
            message: "from " + args.startDate + " to " + args.endDate,
            okButtonText: "Confirm",
            cancelButtonText: "Cancel"
        }).then((result)=> {
            if(result) {
                this.budget_list.splice(this.budget_list.indexOf(args),1);
                // <<< Call API to delete

                // >>> Call API to delete
            }
            const listview = this.budgetlist.nativeElement as RadListView;
            listview.deselectAll();
        });
    }

    onPullToRefreshInitiated(args: ListViewEventData) {
        // <<< Refresh the budget list data

        // >>> Refresh the budget list data
        console.log('pulled to refresh!');
        const listview = args.object as RadListView;
        this.budget_list = new ObservableArray<Budget>();
        Http.getJSON('https://teamhomely.azurewebsites.net/budgets?UserID=5').then((result: any) => {
            console.log(result);
            result.forEach(element => {
                let items: BudgetItem[] = [];
                element.incomes.forEach(element2 => {
                    items.push(new BudgetItem(element2.name, element2.amount, this.datepipe.transform(new Date(element2.dateAdded.substring(0,10)), 'mediumDate'), "homer_simpson.png"));
                });
                element.categories.forEach(element3 => {
                    element3.expenses.forEach(element4 => {
                        items.push(new BudgetItem(element4.name, -1*element4.amount, this.datepipe.transform(new Date(element4.dateAdded.substring(0,10)), 'mediumDate'), "homer_simpson.png", element3.name, element3.idealPercentage/100));
                    });
                });
                
                this.budget_list.push(new Budget(element.name, this.datepipe.transform(new Date(element.startDate.substring(0,10)), 'mediumDate'), this.datepipe.transform(new Date(element.endDate.substring(0,10)), 'mediumDate'), items, "homer_simpson.png", []));
            });
            listview.notifyPullToRefreshFinished();
        },
        e => {
            console.log(e);
        });
    }

    constructor(private params: ModalDialogParams, private page: Page) {
        this.user = params.context.user;
        this.myFilteringFunc = (item: Budget) => {
            return item && item.name.includes("");
        };
        this.budget_list = new ObservableArray<Budget>();

        // <<< Call API to get the budget list
        Http.getJSON('https://teamhomely.azurewebsites.net/budgets?UserID=5').then((result: any) => {
            console.log(result);
            result.forEach(element => {
                let items: BudgetItem[] = [];
                element.incomes.forEach(element2 => {
                    items.push(new BudgetItem(element2.name, element2.amount, this.datepipe.transform(new Date(element2.dateAdded.substring(0,10)), 'mediumDate'), "homer_simpson.png"));
                });
                element.categories.forEach(element3 => {
                    element3.expenses.forEach(element4 => {
                        items.push(new BudgetItem(element4.name, -1*element4.amount, this.datepipe.transform(new Date(element4.dateAdded.substring(0,10)), 'mediumDate'), "homer_simpson.png", element3.name, element3.idealPercentage/100));
                    });
                });
                
                this.budget_list.push(new Budget(element.name, this.datepipe.transform(new Date(element.startDate.substring(0,10)), 'mediumDate'), this.datepipe.transform(new Date(element.endDate.substring(0,10)), 'mediumDate'), items, "homer_simpson.png", []));
            });
        },
        e => {
            console.log(e);
        });
        // >>> Call API to get the budget list

        this.budget_list.push(this.params.context.budget);
        this.budget_list.push(new Budget("Some budget title", this.datepipe.transform(new Date(),'mediumDate'), this.datepipe.transform(new Date(2021,6,1),'mediumDate'), [
            new BudgetItem("Paycheck", 1785.15, this.datepipe.transform(new Date(2021,2,18),'mediumDate'), 'homer_simpson.png'),
            new BudgetItem("Groceries", -85.15, this.datepipe.transform(new Date(2021,2,27),'mediumDate'), 'marge_simpson.png', 'Food', 0.1),
            new BudgetItem("Netflix", -15.07, this.datepipe.transform(new Date(2021,2,14),'mediumDate'), 'bart_simpson.png', 'Entertainment', 0.05),
            new BudgetItem("Hulu", -14.93, this.datepipe.transform(new Date(2021,2,14),'mediumDate'), 'lisa_simpson.png', 'Entertainment', 0.05),
            new BudgetItem("Phones", -85.15, this.datepipe.transform(new Date(2021,2,21),'mediumDate'), 'bart_simpson.png', 'Utilities', 0.1),
            new BudgetItem("Paycheck", 1785.15, this.datepipe.transform(new Date(2021,3,4),'mediumDate'), 'marge_simpson.png'),
            new BudgetItem("Internet", -163.02, this.datepipe.transform(new Date(2021,2,15),'mediumDate'), 'lisa_simpson.png', 'Utilities', 0.1),
            new BudgetItem("Paycheck", 1785.15, this.datepipe.transform(new Date(2021,3,18),'mediumDate'), 'marge_simpson.png'),
            new BudgetItem("Rent", -925.00, this.datepipe.transform(new Date(2021,2,27),'mediumDate'), 'marge_simpson.png', 'Rent', 0.2),
            new BudgetItem("Tuition", -1523.15, this.datepipe.transform(new Date(2021,2,25),'mediumDate'), 'homer_simpson.png', 'School', 0.2),
            new BudgetItem("Groceries", -17.15, this.datepipe.transform(new Date(2021,2,12),'mediumDate'), 'homer_simpson.png', 'Food', 0.1),
            new BudgetItem("Paycheck", 1785.15, this.datepipe.transform(new Date(2021,4,1),'mediumDate'), 'homer_simpson.png'),
        ], "marge_simpson.png", ["homer_simpson.png"]));
        this.budget_list.push(new Budget("Another budget", this.datepipe.transform(new Date(), 'mediumDate'), this.datepipe.transform(new Date(2021,7,10), 'mediumDate'), [], "homer_simpson.png", ["marge_simpson.png","bart_simpson.png","lisa_simpson.png"]));
        this.budget_list.push(new Budget("Private budget", this.datepipe.transform(new Date(), 'mediumDate'), this.datepipe.transform(new Date(2021,5,15), 'mediumDate'), [
            new BudgetItem("Paycheck", 1000.00, this.datepipe.transform(new Date(2021,2,18),'mediumDate'), 'homer_simpson.png'),
            new BudgetItem("Stuff", -85.15, this.datepipe.transform(new Date(2021,2,27),'mediumDate'), 'homer_simpson.png', 'Private', 0.1),
            new BudgetItem("Netflix", -15.07, this.datepipe.transform(new Date(2021,2,14),'mediumDate'), 'homer_simpson.png', 'Entertainment', 0.05),
            new BudgetItem("Hulu", -14.93, this.datepipe.transform(new Date(2021,2,14),'mediumDate'), 'homer_simpson.png', 'Entertainment', 0.05),
            new BudgetItem("Stuff2", -75.65, this.datepipe.transform(new Date(2021,2,21),'mediumDate'), 'homer_simpson.png', 'Private', 0.1),
        ], "homer_simpson.png", []));
    }

    addBudget(args: EventData) {
        this.exitDeleteMode();
        const layout = args.object as StackLayout;
        if(layout.backgroundColor == '#9DC88D') {
            this.exitAddMode();
        }
        else {
            this.enterAddMode();
        }
    }

    deleteBudget(args: EventData) {
        this.exitAddMode();
        const layout = args.object as StackLayout;
        if(layout.backgroundColor == '#9DC88D') {
            this.exitDeleteMode();
        }
        else {
            this.enterDeleteMode();
        }
    }

    search(args: EventData) {
        const textfield = args.object as TextField;
        this.myFilteringFunc = (item: Budget) => {
            return item && item.name.toLowerCase().includes(textfield.text.toLowerCase());
        };
    }

    enterAddMode() {
        var layout = this.add.nativeElement as StackLayout;
        layout.backgroundColor = '#9DC88D';
        layout.eachChildView((view: View) => {
            view.color = new Color('#000000');
            return true;
        });
        var button = this.addbutton.nativeElement as GridLayout;
        button.visibility="visible";
        var listview = this.budgetlist.nativeElement as RadListView;
        listview.scrollToIndex(this.budget_list.length-1,true,ListViewItemSnapMode.Start);
        listview.scrollWithAmount(300,true);
        var template = this.addtemplate.nativeElement as GridLayout;
        template.visibility="visible";
    }

    exitAddMode(scroll:boolean = true) {
        var layout = this.add.nativeElement as StackLayout;
        layout.backgroundColor = '#D6D6D6';
        layout.eachChildView((view: View) => {
            view.color = new Color('#2B88D8');
            return true;
        });
        var button = this.addbutton.nativeElement as GridLayout;
        button.visibility="collapse";
        var name = this.addtemplatename.nativeElement as TextField;
        name.text="";
        var start = this.addtemplatestart.nativeElement as TextField;
        start.text="";
        var end = this.addtemplateend.nativeElement as TextField;
        end.text="";
        if(scroll) {
            var listview = this.budgetlist.nativeElement as RadListView;
            listview.scrollWithAmount(-listview.getScrollOffset(),true);
        }
        var template = this.addtemplate.nativeElement as GridLayout;
        template.visibility="collapse";
    }

    enterDeleteMode() {
        var layout = this.delete.nativeElement as StackLayout;
        layout.backgroundColor = '#9DC88D';
        layout.eachChildView((view: View) => {
            view.color = new Color('#000000');
            return true;
        });
        this.action_icon = "~/fonts/delete_icon.png";
        var button = this.cancelbutton.nativeElement as GridLayout;
        button.visibility="visible";
    }

    exitDeleteMode() {
        var layout = this.delete.nativeElement as StackLayout;
        layout.backgroundColor = '#D6D6D6';
        layout.eachChildView((view: View) => {
            view.color = new Color('#2B88D8');
            return true;
        });
        this.action_icon = "~/fonts/tap_icon.png";
        var button = this.cancelbutton.nativeElement as GridLayout;
        button.visibility="collapse";
    }

    get myFilteringFunc(): (item: any) => any {
        return this._myFilteringFunc;
    }

    set myFilteringFunc(value: (item: any) => any) {
        this._myFilteringFunc = value;
    }

    close() {
        this.params.closeCallback({value: false});
    }
}
