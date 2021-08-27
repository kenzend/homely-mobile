import { Component, ElementRef, ViewChild, OnInit } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { screen } from 'tns-core-modules/platform';
import { LayoutBase } from "tns-core-modules/ui/layouts/layout-base";
import { StackLayout } from "tns-core-modules/ui/layouts/stack-layout";
import { View } from "tns-core-modules/ui/page";
import { ITnsOAuthTokenResult } from "nativescript-oauth2";
import { AuthService } from "../auth.service";
import { Page } from "tns-core-modules/ui/page";

@Component({
    selector: "ns-login",
    moduleId: module.id,
    templateUrl: "./login.component.html",
    styleUrls: ["./login.component.css"]
})

export class LoginComponent implements OnInit{
    constructor(private page: Page, private authService: AuthService, private routerExtensions: RouterExtensions) { }

    ngOnInit(): void {
        this.page.actionBarHidden=true;
        //this.page.backgroundImage="~/fonts/background.png";
    }

    //padding_to_center = (screen.mainScreen.widthDIPs-300)/2;
    //never=false;

    login() { 
        this.routerExtensions.navigate(['home'], { clearHistory: true });
    }
    
    /*
    login() {
        this.authService
            .tnsOauthLogin("identityServer")
            .then((result: ITnsOAuthTokenResult) => {
                console.log(
                    "back to login component with token " + result.accessToken
                );
                this.routerExtensions
                    .navigate(['home'], { clearHistory: true })
                    .then(() => console.log("navigated to /home"))
                    .catch((err) =>
                        console.log(
                            "error navigating to /home: " + err
                        )
                    );
            })
            .catch((e) => console.log("Error: " + e));
    }
    */
}