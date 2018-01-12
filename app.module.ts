import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {NgxPaginationModule} from "ngx-pagination";
import {SharedModule} from './shared/shared.module';
import {MainModule} from './main/main.module';
import {APP_BASE_HREF} from "@angular/common";

// routing
import { AppRouting } from './app.routing';

// components
import {AppComponent} from './app.component';
import {SidebarComponent} from './layout/components/sidebar/sidebar.component';

@NgModule({
    declarations: [
        AppComponent,
        SidebarComponent
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        FormsModule,
        NgxPaginationModule,
        SharedModule,
        MainModule,
        AppRouting
    ],
    providers: [
        [{provide: APP_BASE_HREF, useValue: '/home'}],
    ],
    bootstrap: [AppComponent],

})
export class AppModule {
}
