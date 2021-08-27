import { Component, AfterViewInit, ViewChild, ElementRef, ViewChildren, QueryList, ViewContainerRef, OnInit, ɵisListLikeIterable } from "@angular/core";
import { Http } from "tns-core-modules";
import { screen, isAndroid, isIOS } from 'tns-core-modules/platform';
import { GridLayout } from "tns-core-modules/ui/layouts/grid-layout";
import { PanGestureEventData, GestureStateTypes, GestureEventData, TouchGestureEventData, SwipeGestureEventData } from "tns-core-modules/ui/gestures";
import { AnimationCurve } from "tns-core-modules/ui/enums";
import { SelectedIndexChangedEventData } from "tns-core-modules/ui/tab-view";
import { ScrollView, ScrollEventData } from "tns-core-modules/ui/scroll-view";
import { DatePipe } from "@angular/common";
import { Color, EventData, View } from "tns-core-modules/ui/frame";
import { ActionBar } from "tns-core-modules/ui/action-bar";
import { StackLayout } from "tns-core-modules/ui/layouts/stack-layout";
import { confirm } from "tns-core-modules/ui/dialogs";
import { LayoutBase } from "tns-core-modules/ui/layouts/layout-base";
import { CubicBezierAnimationCurve } from "@nativescript/core/ui/animation";
import { Label } from "tns-core-modules/ui";
import { Page } from "tns-core-modules/ui";
import * as Clipboard from "nativescript-clipboard";
import { LoadingIndicator,Mode,OptionsCommon } from '@nstudio/nativescript-loading-indicator';
import { ModalDialogService, ModalDialogOptions } from "nativescript-angular/modal-dialog";
import {TaskModalComponent} from "../modal/task_modal.component";
import { CalendarEvent } from "nativescript-ui-calendar";
import { RadPieChart } from "nativescript-ui-chart";
import * as Gauge from "nativescript-ui-gauge";
import { ObservableArray } from "tns-core-modules/data/observable-array";
import { Task } from "../models/task.model";
import { BudgetItem } from "../models/budget_item.model";
import { animate, JsAnimationDefinition } from "../animation-helpers";
import { BudgetListComponent } from "../modal/budget_list.component";
import { Budget } from "../models/budget.model";
import { BudgetUsersComponent } from "../modal/budget_users.component";


@Component({
    selector: "Home",
    moduleId: module.id,
    templateUrl: "./home.component.html",
    styleUrls: ["./home.component.css"]
})
export class HomeComponent implements AfterViewInit {

    @ViewChild('tabs', { static: true }) tabs: ElementRef;
    @ViewChild('centerCircle', { static: true }) centerCircle: ElementRef;
    @ViewChild('dragCircle', { static: true }) dragCircle: ElementRef;
    @ViewChild('leftTabs', { static: true }) leftTabs: ElementRef;
    @ViewChild('rightTabs', { static: true }) rightTabs: ElementRef;
    @ViewChild('centerPatch', { static: true }) centerPatch: ElementRef;
    @ViewChild('tabBGContainer', { static: true }) tabBGContainer: ElementRef;

    @ViewChildren('tabContents', { read: ElementRef }) tabContents: QueryList<ElementRef>;




    // --------------------------------------------------------------------
    // View settings
    wait_time = 0;
    bell = {
        text: String.fromCharCode(0xf0f3)
    };

    settings = {
        text: String.fromCharCode(0xf013)
    };

    pen = String.fromCharCode(0xf303);

    user_greetings_text = "Welcome Homer!"; // User greetings text goes here
    username="@" + "homer_simpson";

    copyUserName() {
        const username_label = this.page.getViewById("username") as Label;
        console.log('username text: ' + username_label.text);
        Clipboard.setText(username_label.text).then(() => {
            const popup = new LoadingIndicator();
            const options: OptionsCommon = {
                message: '',
                details: '📋 Copied! ✅',
                //margin: 5,
                color: 'black',
                backgroundColor: '#bfbfbf',
                //userInteractionEnabled: false,
                //hideBezel: true,
                mode: Mode.CustomView,
            };
            popup.show(options);  
            setTimeout(() => {popup.hide()}, 1300); 
        });
    }

    shadeColor(color, amount) {
        return '#' + color.replace(/^#/, '').replace(/../g, color => ('0'+Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
    }






    animateToModal(view: View) {
        var top = view.getLocationOnScreen().y;
        var left = view.getLocationOnScreen().x;
        const ani1: JsAnimationDefinition = {
            curve: t=> t,
            getRange: () => {return {from: left, to: 20};},
            step: (v) => view.marginRight = v
        };
        const ani2: JsAnimationDefinition = {
            curve: t=> t,
            getRange: () => {return {from: top-350, to: 10};},
            step: (v) => view.marginBottom = v
        };

        animate(3000, [ani1,ani2]);
    }
    animateFab(args: SwipeGestureEventData) {
        const fab = this.page.getViewById("fab_add_task") as GridLayout;
        var width = fab.width.valueOf() as number;
        if(args.direction == 4) {
            const ani: JsAnimationDefinition = {
                curve: t=> t,
                getRange: () => {return {from: width, to: 50};},
                step: (v) => fab.width = v
            };
            animate(0, [ani]);
        }
        else {
            const ani: JsAnimationDefinition = {
                curve: t=> t,
                getRange: () => {return {from: width, to: 130};},
                step: (v) => fab.width = v
            };
            animate(0, [ani]);
        }
    }






    now = new Date();
    datepipe: DatePipe = new DatePipe('en-US');
    today = this.datepipe.transform(this.now, 'longDate');
    hourHeight:number = 128;
    hour:number = parseInt(this.datepipe.transform(this.now, 'H')) * this.hourHeight;
    first_time_loaded = 0;

    scrollToCurrentHour(args: EventData) {
        setTimeout(() => {
            const scroll = <ScrollView>args.object;
            if(this.hour>scroll.scrollableHeight)
                this.hour=scroll.scrollableHeight;
            if(this.first_time_loaded == 0) {
                scroll.scrollToVerticalOffset(this.hour, false);
                this.first_time_loaded = 1;
            }
        }, this.wait_time);
        
        //console.log("Contents height: " + (this.content_height+70));
    }





    // --------------------------------------------------------------------
    // Task

    backgroundColorsForCards: string[] = [ 
        "#ffc5b7",
        "#fdff92",
        "#b3c7ff"
        //"#f93c3c",
        //"368eff",
        //"f1b24a"
    ];
    membersInFamily: {name: string, username: string, image: string}[] = [
        {name: 'Homer Simpson', username:'@homer_simpson', image: 'homer_simpson.png'},
        {name: 'Marge Simpson', username: '@marge_simpson', image: 'marge_simpson.png'},
        {name: 'Bart Simpson', username: '@bart_simpson', image: 'bart_simpson.png'},
        {name: 'Lisa Simpson', username: '@lisa_simpson', image: 'lisa_simpson.png'}
    ];
    taskList: Task[] = [];

    getRandomBackgroundColor(): string {
        return this.backgroundColorsForCards[Math.floor(Math.random() * this.backgroundColorsForCards.length)];
    }

    getDuration(start: string, end: string):string {
        var result = "";
        var startTime = start.split(':', 2);
        var endTime = end.split(':', 2);
        var minuteStart = parseInt(startTime[0]) * 60 + parseInt(startTime[1]);
        var minuteEnd = parseInt(endTime[0]) * 60 + parseInt(endTime[1]);
        var duration = minuteEnd - minuteStart;
        var hourDuration = Math.floor(duration/60).toString();
        var minuteDuration = (duration%60).toString(); 
        if(hourDuration !== "0")
            result += hourDuration + "h";
        if(minuteDuration !== "0")
            result += " " + minuteDuration + "m";
        //console.log('Result of duration: ' + result);
        return result;
    }

    convertStartToRow(start: string): number{
        //console.log("Input start time: " + start);
        var result = 0;
        var time = start.split(':', 2);
        var hour = time[0];
        var minute = time[1];
        //console.log("Time: " + hour + ":" + minute);

        result+= (parseInt(hour)*4);
        var minute_num = parseInt(minute);
        if(minute_num == 0) {
            result+=1;
        }
        else if(minute_num > 0 && minute_num <= 15) {
            result+= 2;
        }
        else if(minute_num > 15 && minute_num <= 30) {
            result+= 3;
        }
        else if(minute_num > 30 && minute_num <= 45) {
            result+= 4;
        }
        //console.log("Result of convertStartToRow: " + result);
        return result;
    }

    convertDurationToSpan(start: string, end: string): number{
        return this.convertStartToRow(end) - this.convertStartToRow(start);
    }

    /* CRUD methods */
    testTap() {
        this.animateToModal(this.page.getViewById("fab_add_task"));
        //alert('Tapped!');
        const fab = this.page.getViewById("fab_add_task") as GridLayout;
        const user = this.page.getViewById("username") as Label;
        console.log('Screen width: ' + user.getLocationOnScreen().x);
        console.log('Screen height: ' +user.getLocationOnScreen().y);
        console.log('X loc: ' + fab.getLocationOnScreen().x);
        console.log('Y loc: ' + fab.getLocationOnScreen().y);
    }

    getIsCompletedTask(task: Task): string[] {
        if (task.isCompleted) 
            return ["line-through", "~/fonts/completed_checkbox.png"];
        else
            return ["none", "~/fonts/incompleted_checkbox.png"];
    }

    setIsCompleted(task: Task) {
        task.isCompleted = !task.isCompleted;
        // <<< Call API to set completed/incompleted

        // >>> Call API to set completed/incompleted
    }

    editTask(index: number) {
        console.log("editTask() from " + index);
    }

    deleteTask(index: number) {
        //console.log("deleteTask() from " + index);
        var task_title = this.taskList[index].title;
        var task_start = this.taskList[index].start;
        var task_end = this.taskList[index].end;
        confirm({
            title: "Deleting task \"" + task_title + "\"\n",
            message: "from " + task_start + " to " + task_end,
            okButtonText: "Confirm",
            cancelButtonText: "Cancel"
        }).then((result)=> {
            if(result) {
                this.taskList.splice(index, 1);
                /// <<< Call API to delete

                /// >>> Call API to delete
            }
        });
        
    }

    showTaskModal(idx: number) {
        const options: ModalDialogOptions = {
            viewContainerRef: this.viewContainerRef,
            fullscreen: false,
            context: {
                members: this.membersInFamily,
                task_list: this.taskList,
                index: idx,
                randomBackgroundColor: this.getRandomBackgroundColor()
            },
            animated: true
        };
        this.modalService.showModal(TaskModalComponent, options);
    }








    // --------------------------------------------------------------------
    // Calendar
    calendar_events: CalendarEvent[]= [
        new CalendarEvent('Something', new Date(2021,4,10), new Date(2021,4,12), false, new Color('black')),
        new CalendarEvent('Another something', new Date(2021,4,8), new Date(2021,4,15), false, new Color('pink')),
        new CalendarEvent('Something particular', new Date(2021,4,5), new Date(2021,4,16), false, new Color('red')),
        new CalendarEvent('Something not really particular', new Date(2021,4,1), new Date(2021,4,2), false, new Color('blue')),
        new CalendarEvent('Something specific', new Date(2021,4,19), new Date(2021,4,20), false, new Color('purple')),
        new CalendarEvent('Something really', new Date(2021,5,1), new Date(2021,5,5), false, new Color('cyan')),
    ];


































    // --------------------------------------------------------------------
    // Budget
    budget_chart_mode: number = 0;
    chart_palette: Color[] = [];
    chart_palette_string: string[] = [ // CHART PALETTE AND CHART PALETTE STRING COME TOGETHER
        '#5ebd3e',
        '#ffb900',
        '#f78200',
        '#e23838',
        '#973999',
        '#009cdf',
        '#ff7f50',
        '#ff00ff',
        '#1e90ff',
        '#f0e68c',
        '#90ee90',
        '#add8e6',
        '#ff1493',
        '#ee82ee',
        '#ffc0cb',
        '#696969',
        '#556b2f',
        '#8b4513',
        '#228b22',
        '#483d8b',
        '#b8860b',
        '#008b8b',
        '#9acd32',
        '#8fbc8f'
    ];
    getChartPalette(): Color[] {
        this.chart_palette= [];
        this.chart_palette_string.forEach((value)=>{
            this.chart_palette.push(new Color(value));
        });
        return this.chart_palette;
    }
    createGauge() {
        const layout = this.page.getViewById("budget_chart_layout") as GridLayout;
        if(isIOS) {
            var info_label = new Label();
            info_label.textWrap=true;
            info_label.text="Not yet supported on iOS!";
            info_label.horizontalAlignment="center";
            info_label.verticalAlignment="middle";
            info_label.fontSize=20;
            info_label.className="h2 m-r-20 m-l-20";
            info_label.id="info_label";
            layout.addChildAtCell(info_label,1,0);
            return;
        }
        
        //const round = this.page.getViewById("barstyle") as Gauge.BarIndicatorStyle;
        
        var gauge = new Gauge.RadRadialGauge();
        gauge.id="expenses_gauge";
        gauge.row=1;
        gauge.col=0;
        gauge.className="m-r-30 m-t-5 m-b-5";
        var scale = new Gauge.RadialScale();
        scale.startAngle=0;
        scale.sweepAngle=360;
        scale.minimum=0;
        scale.maximum=100;
        scale.radius=1;
        var scaleStyle = new Gauge.ScaleStyle();
        scaleStyle.ticksVisible=false;
        scaleStyle.labelsVisible=false;
        scaleStyle.lineThickness=0;
        scale.scaleStyle=scaleStyle;
        scale.indicators = new ObservableArray<Gauge.GaugeIndicator>();
        for (let i = 0; i < this.personal_expenses.length; i++) {
            var location = this.getExpenseLocationInGauge(i);
            var color = this.getColorTag(this.personal_expenses[i]);
            var barwidth = this.getGaugeBarWidth();

            var radialBarIndicator = new Gauge.RadialBarIndicator();
            radialBarIndicator.minimum=0;
            radialBarIndicator.maximum=100;
            radialBarIndicator.location=location;
            var indicatorStyle = new Gauge.BarIndicatorStyle();
            indicatorStyle.fillColor= new Color(this.shadeColor(color,90));
            indicatorStyle.barWidth= barwidth;
            radialBarIndicator.indicatorStyle=indicatorStyle;

            var radialBarIndicator2 = new Gauge.RadialBarIndicator();
            radialBarIndicator2.minimum=0;
            radialBarIndicator2.maximum=this.getGaugeValue(this.personal_expenses[i]);
            radialBarIndicator2.location=location;
            radialBarIndicator2.isAnimated=true;
            var indicatorStyle2 = new Gauge.BarIndicatorStyle();
            //indicatorStyle2.cap = "Round";
            indicatorStyle2.fillColor= new Color(color);
            indicatorStyle2.barWidth= barwidth;
            radialBarIndicator2.indicatorStyle=indicatorStyle2;

            scale.indicators.push(radialBarIndicator);
            scale.indicators.push(radialBarIndicator2);
        }
        gauge.scales = new ObservableArray<Gauge.GaugeScale>();
        gauge.scales.push(scale);
        layout.addChildAtCell(gauge,1,0);
    }
    removeGauge() {
        const layout = this.page.getViewById("budget_chart_layout") as GridLayout;
        if(isIOS) {
            layout.removeChild(this.page.getViewById("info_label"));
            return;
        }
        layout.removeChild(this.page.getViewById("expenses_gauge"));
    }

    budget: Budget = new Budget("Some budget title", this.datepipe.transform(new Date(),'mediumDate'), this.datepipe.transform(new Date(2021,6,1),'mediumDate'), [
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
    ], "marge_simpson.png", ["homer_simpson.png"]);

    personal_budget: BudgetItem[] = this.budget.budgetItems;

    onToggleLoaded(args: EventData) {
        const lb = args.object as LayoutBase;
        const toggler = lb.getViewById("toggler") as View;
    
        lb.eachChildView((v: View) => {
            if(v.className === "toggler") {
                return;
            }
            v.on("tap", (a: EventData) => {
                const lbl = a.object as Label;
                const loc = lbl.getLocationRelativeTo(lb);
    
                toggler.animate({
                    translate: {x: loc.x, y:0},
                    duration: 500,
                    curve: new CubicBezierAnimationCurve(0.6, 0.72, 0, 1)
                });
                if(this.budget_chart_mode !== parseInt(lbl.id)) {
                    this.budget_chart_mode = parseInt(lbl.id);
                    console.log('Chart mode is: "' + this.budget_chart_mode + '"');
                }
                const chart = this.page.getViewById("expenses_chart") as RadPieChart;
                const stat1 = this.page.getViewById("chart_stat_1") as Label;
                const stat2 = this.page.getViewById("chart_stat_2") as Label;
                const stat3 = this.page.getViewById("chart_stat_3") as Label;
                const stat4 = this.page.getViewById("chart_stat_4") as Label;
                if(this.budget_chart_mode === 1) {
                    // Gauge
                    this.createGauge();

                    // Chart
                    chart.opacity = 0;
                    stat1.opacity = 0;
                    stat2.opacity = 0;
                    stat3.opacity = 0;
                    stat4.opacity = 0;
                }
                if(this.budget_chart_mode === 0) {
                    // Gauge
                    this.removeGauge();

                    // Chart
                    chart.opacity = 1;
                    stat1.opacity = 1;
                    stat2.opacity = 1;
                    stat3.opacity = 1;
                    stat4.opacity = 1;
                }
            });
            return true;
        });
    }

    personal_expenses:{category: string, amount: number, desiredPercentage: number} [] = [];
    //debug = 0;

    getPersonalExpenses(): any {
        this.personal_expenses = [];
        if(this.personal_budget.length === 0)
            return;
        this.personal_budget.forEach((value) => {
            var is_new_category = true;
            var category = value.category;
            this.personal_expenses.forEach((value1) => {
                if(category == null && value.amount > 0) 
                    is_new_category = is_new_category && false;
                else if(value.amount < 0 && value1.category === category) {
                    value1.amount += value.amount;
                    is_new_category = is_new_category && false;
                }
            });
            if(is_new_category)
                this.personal_expenses.push({category: category, amount: value.amount, desiredPercentage: value.desiredPercentage});
        });
        if(this.personal_expenses[0].amount >= 0)
            this.personal_expenses.splice(0,1);
        this.personal_expenses.forEach((expense) => {
            expense.amount = Math.abs(expense.amount);
        });
        //if(this.debug==0) {
        //console.log('\n\n');
        //console.log(this.personal_expenses);
        //console.log('\n\n');
        //this.debug=1;}
        return this.personal_expenses;
    }

    getExpenseLocationInGauge(index: number): number {
        //console.log('Expense location in gauge: ' + (index*(this.getGaugeBarWidth()+0.05) + 0.2));
        return index*(this.getGaugeBarWidth()+0.05) + 0.1 + this.getGaugeBarWidth(); // 0.1 is the minimum location to draw; 0.05 is the spacing between rings.
    }

    getGaugeValue(expense: any): number {
        var spending_goal = this.getTotalIncomeNumber() * expense.desiredPercentage;
        //console.log('Gauge value: ' + ((expense.amount / spending_goal)*100));
        return ((expense.amount / spending_goal)*100)>100 ? 100 : ((expense.amount / spending_goal)*100);
    }

    getGaugeBarWidth(): number {
        var total_steps=this.personal_expenses.length-1;
        //console.log('Gauge bar width: ' + ((0.8 - 0.05 * total_steps) / (total_steps+1)));
        return (0.9 - 0.05 * total_steps) / (total_steps+1); // 0.05 is the spacing between rings.
    }

    getAmount(budget_item: any): string{
        var result = "";
        if(budget_item.amount < 0) 
            result += "-$ " + Math.abs((Math.round(budget_item.amount * 100) / 100)).toFixed(2);
        else 
            result += "+$ " + Math.abs((Math.round(budget_item.amount * 100) / 100)).toFixed(2);
        
        return result;
    }

    getBudgetItemTitle(budget_item: any): string[]{
        if(budget_item.category == null)
            return [budget_item.name, ''];
        //if(budget_item.category === budget_item.name)
        //    return [budget_item.category, ''];
        return [budget_item.category, budget_item.name];
    }

    getBudgetBackground(budget_item: any): string {
        if(budget_item.amount < 0) 
            return "~/fonts/neg_budget.png";
        else
            return "~/fonts/pos_budget.png";
    }

    getBudgetColor(budget_item: any): string {
        if(budget_item.amount < 0) 
            return "black";
        else
            return "white";
    }

    getBudgetClass(budget_item: any): string {
        if(budget_item.amount < 0) 
            return "dark_display";
        else
            return "light_display";
    }

    getColorTag(budget_item: any): string {
        if(budget_item.category == null) // income doesn't have a category, so #5a895c will blend in with the background color.
            return '#5a895c';
         return this.getLegendColor(this.getPersonalExpenses().findIndex(x=>x.category===budget_item.category));
    }

    getLegendColor(index: number) : string {
        return this.chart_palette_string[index % this.chart_palette_string.length];
    }

    getTotalIncome(): string {
        var total = 0;
        this.personal_budget.forEach((value)=> {
            if(value.amount > 0)
                total+=value.amount;
        });
        return "    $ " + Math.abs((Math.round(total * 100) / 100)).toFixed(2);
    }

    getTotalIncomeNumber(): number {
        var total = 0;
        this.personal_budget.forEach((value)=> {
            if(value.amount > 0)
                total+=value.amount;
        });
        return Math.abs((Math.round(total * 100) / 100));
    }

    getNet(): string {
        var net = 0;
        this.personal_budget.forEach((value) => {
            net+=value.amount;
        });
        if(net < 0)
            return "    -$ " + Math.abs((Math.round(net * 100) / 100)).toFixed(2);
        return "    $ " + Math.abs((Math.round(net * 100) / 100)).toFixed(2);
    }

    // CRUD budget
    selectBudget() {
        const options: ModalDialogOptions = {
            viewContainerRef: this.viewContainerRef,
            fullscreen: true,
            context: {
                budget: this.budget,
                user: "homer_simpson.png"
            },
            animated: true
        };
        this.modalService.showModal(BudgetListComponent, options).then(response => {
            if(response.value) {
                this.budget = response.selectedBudget;
                this.personal_budget = response.selectedBudget.budgetItems;
                this.personal_expenses = this.getPersonalExpenses();
            }
        });
    }

    manageBudgetAccess() {
        const options: ModalDialogOptions = {
            viewContainerRef: this.viewContainerRef,
            fullscreen: false,
            context: {
                owner: this.budget.owner,
                members: this.budget.members
            },
            animated: true
        };
        this.modalService.showModal(BudgetUsersComponent, options);
    }

    addBudget() {
        this.personal_budget.push(new BudgetItem("Anything", -100.00, this.datepipe.transform(new Date(),'mediumDate'), 'homer_simpson.png', 'Something', 0.1));
        this.personal_budget.push(new BudgetItem("Anything", -100.00, this.datepipe.transform(new Date(),'mediumDate'), 'homer_simpson.png', 'Something2', 0.1));
        this.removeGauge();
        this.createGauge();
    }

    deleteBudget(index: number) {
        var budget_type = this.personal_budget[index].name;
        var budget_category = this.personal_budget[index].category == null? '' : 'from category ' + this.personal_budget[index].category + ' ';
        var date = this.personal_budget[index].date;
        var amount = "";
        if(this.personal_budget[index].amount < 0)
            amount="-$ " +Math.abs((Math.round(this.personal_budget[index].amount * 100) / 100)).toFixed(2);
        else
            amount="$ " +Math.abs((Math.round(this.personal_budget[index].amount * 100) / 100)).toFixed(2);
        confirm({
            title: 'Deleting budget item"' + budget_type + '"\n',
            message: budget_category + "on " + date + " with the amount:\n" + amount,
            okButtonText: "Confirm",
            cancelButtonText: "Cancel"
        }).then((result)=> {
            if(result) {
                this.personal_budget.splice(index, 1);
                this.removeGauge();
                this.createGauge();
            }
        });
    }





    // --------------------------------------------------------------------
    // Pan Helper
    prevDeltaX: number = 0;

    animationCurve = AnimationCurve.cubicBezier(.38, .47, 0, 1);

    // --------------------------------------------------------------------
    // Tab Contents and Properties
    tabContainer = {
        backgroundColor: '#fff',
        focusColor: '#9dc88d'
    };
    tabList: { text: string, icon?: string, color?: string, backgroundColor: string, fadeColor?: string }[] = [
        { text: String.fromCharCode(0xf46d), backgroundColor: '#e7e7e7', color: '#000' }, // tasks
        { text: String.fromCharCode(0xf073), backgroundColor: '#e7e7e7', color: '#000' }, // calendar
        { text: String.fromCharCode(0xf015), backgroundColor: '#e7e7e7', color: '#000' }, // home
        { text: String.fromCharCode(0xf578), backgroundColor: '#e7e7e7', color: '#000' }, // meals
        { text: String.fromCharCode(0xf53d), backgroundColor: '#e7e7e7', color: '#000' } // bill
    ];

    currentTabIndex: number = 2;
    defaultSelected: number = 2;

    constructor(private page: Page, private modalService: ModalDialogService, private viewContainerRef: ViewContainerRef) {
        // <<< Call APIs to fetch data async in promises.
        // User
        Http.getJSON('https://teamhomely.azurewebsites.net/user?Username=bobross99').then((result: any)=> {
            console.log(result);
            this.username = "@" + result.username;
            this.user_greetings_text = "Welcome " + result.firstName + " " + result.lastName + "!";
        },
        e=> {

        });

        // Task
        Http.getJSON('https://teamhomely.azurewebsites.net/todos?UserID=5').then((result: any)=> {
            console.log(result);
            result.forEach(element => {
                this.taskList.push(new Task(element.todoName, "17:00", "18:00", ["homer_simpson.png"], "#ffc5b7", element.completed, element.todoDescription));
            });
        },
        e => {
            console.log(e);
        });
        //this.taskList.push(new Task("CS4000 Weekly Team Meeting", "16:15", "16:45", ["homer_simpson.png"], this.getRandomBackgroundColor(), false, ""));
        //this.taskList.push(new Task("Breakfast", "08:15", "08:45", ["homer_simpson.png","bart_simpson.png","lisa_simpson.png","marge_simpson.png"], this.getRandomBackgroundColor(), true, "Eggs, Bacons, Steaks"));
        //this.taskList.push(new Task("Dinner", "18:30", "19:00", ["homer_simpson.png","bart_simpson.png","lisa_simpson.png","marge_simpson.png"], this.getRandomBackgroundColor(), false, ""));
        //this.taskList.push(new Task("With the boys", "20:00", "21:30", ["homer_simpson.png", "bart_simpson.png"], this.getRandomBackgroundColor(), true, "Call of Duty"));
        // >>> Call APIs to fetch data async in promises.
    }

    // --------------------------------------------------------------------
    // Hooks

    ngAfterViewInit(): void {
        this.initializeTabBar();
    }

    // --------------------------------------------------------------------
    // User Interaction

    // Tabs selected index is changed (e.g. when swipe to navigate).
    onSelectedIndexChanged(args: SelectedIndexChangedEventData): void {
        if (args.newIndex !== this.currentTabIndex) {
            this.onBottomNavTap(args.newIndex);
        }
    }

    // Tap on a one of the tabs
    onBottomNavTap(index: number, duration: number = 300): void {
        if (this.currentTabIndex !== index) {
            const tabContentsArr = this.tabContents.toArray();

            // set unfocus to previous index
            tabContentsArr[this.currentTabIndex].nativeElement.animate(this.getUnfocusAnimation(this.currentTabIndex, duration));

            // set focus to current index
            tabContentsArr[index].nativeElement.animate(this.getFocusAnimation(index, duration));
        }

        // Change the selected index of Tabs when tap on tab strip
        if (this.tabs.nativeElement.selectedIndex !== index) {
            this.tabs.nativeElement.selectedIndex = index;
        }

        this.centerCircle.nativeElement.animate(this.getSlideAnimation(index, duration));
        this.leftTabs.nativeElement.animate(this.getSlideAnimation(index, duration));
        this.rightTabs.nativeElement.animate(this.getSlideAnimation(index, duration));
        this.centerPatch.nativeElement.animate(this.getSlideAnimation(index, duration));
        this.dragCircle.nativeElement.animate(this.getSlideAnimation(index, duration));

        // set current index to new index
        this.currentTabIndex = index;
    }

    // Drag the focus circle to one of the tabs
    onCenterCirclePan(args: PanGestureEventData): void {
        let grdLayout: GridLayout = <GridLayout>args.object;
        let newX: number = grdLayout.translateX + args.deltaX - this.prevDeltaX;

        if (args.state === 0) {
            // finger down
            this.prevDeltaX = 0;
        } else if (args.state === 2) {
            // finger moving
            grdLayout.translateX = newX;
            this.leftTabs.nativeElement.translateX = newX;
            this.rightTabs.nativeElement.translateX = newX;
            this.centerPatch.nativeElement.translateX = newX;
            this.centerCircle.nativeElement.translateX = newX;

            this.prevDeltaX = args.deltaX;
        } else if (args.state === 3) {
            // finger up
            this.prevDeltaX = 0;
            const tabWidth = screen.mainScreen.widthDIPs / this.tabList.length;
            const tabSelected: number = Math.round(Math.abs(newX / tabWidth));
            const translateX: number = tabSelected * tabWidth;
            if (newX < 0) {
                // pan left
                this.onBottomNavTap(this.defaultSelected - tabSelected, 50);
                // MY: Change the selected index of Tabs when pan left
                this.tabs.nativeElement.selectedIndex = this.defaultSelected - tabSelected;
            } else {
                // pan right
                this.onBottomNavTap(this.defaultSelected + tabSelected, 50);
                // MY: Change the selected index of Tabs when pan right
                this.tabs.nativeElement.selectedIndex = this.defaultSelected + tabSelected;
            }
        }
    }

    // --------------------------------------------------------------------
    // Tab bar helpers

    initializeTabBar(): void {
        // set up base layer
        this.leftTabs.nativeElement.width = screen.mainScreen.widthDIPs;
        this.rightTabs.nativeElement.width = screen.mainScreen.widthDIPs;
        this.centerPatch.nativeElement.width = 100;

        this.tabBGContainer.nativeElement.translateX = - (screen.mainScreen.widthDIPs / 2) - (80 / 2);

        // set default selected tab
        const tabContentsArr = this.tabContents.toArray();
        tabContentsArr[this.defaultSelected].nativeElement.scaleX = 1.7;
        tabContentsArr[this.defaultSelected].nativeElement.scaleY = 1.7;
        tabContentsArr[this.defaultSelected].nativeElement.translateY = - 15;
        this.currentTabIndex = this.defaultSelected;
    }

    getSlideAnimation(index: number, duration: number) {
        return {
            translate: { x: this.getTabTranslateX(index), y: 0 },
            curve: this.animationCurve,
            duration: duration
        };
    }

    getFocusAnimation(index: number, duration: number) {
        return {
            scale: { x: 1.7, y: 1.7 },
            translate: { x: 0, y: -15 },
            duration: duration
        };
    }

    getUnfocusAnimation(index: number, duration: number) {
        return {
            scale: { x: 1, y: 1 },
            translate: { x: 0, y: 0 },
            duration: duration
        };
    }

    getTabTranslateX(index: number): number {
        return index * screen.mainScreen.widthDIPs / this.tabList.length - (screen.mainScreen.widthDIPs / 2) + (80 / 2)
    }
}









// ------------------------------------------------------------------
// Old stuff

/*
onToggleLoaded(args: EventData) {
    const lb = args.object as LayoutBase;
    const toggler = lb.getViewById("toggler") as View;

    lb.eachChildView((v: View) => {
        if(v.className === "toggler") {
            return;
        }
        v.on("tap", (a: EventData) => {
            const lbl = a.object as Label;
            const loc = lbl.getLocationRelativeTo(lb);
            this.budget_type = lbl.text;
            console.log('Budget type is: "' + this.budget_type + '"');

            toggler.animate({
                translate: {x: loc.x, y:0},
                duration: 500,
                curve: new CubicBezierAnimationCurve(0.6, 0.72, 0, 1)
            });
        });
        return true;
    });
}*/