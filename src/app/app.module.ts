import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HomeComponent } from './home/home.component';
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {MatMenuModule} from "@angular/material/menu";
import { ConsurfPlotComponent } from './consurf-plot/consurf-plot.component';
import * as PlotlyJS from 'plotly.js-dist-min';
import { PlotlyModule } from 'angular-plotly.js';
import {MatCardModule} from "@angular/material/card";
import {NgxColorsModule} from "ngx-colors";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { SegmentFinderComponent } from './segment-finder/segment-finder.component';
import {MatInputModule} from "@angular/material/input";
import { SegmentsViewerComponent } from './segments-viewer/segments-viewer.component';
import { SegmentComponent } from './segment/segment.component';
import {provideHttpClient, withInterceptors, withInterceptorsFromDi} from "@angular/common/http";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import { SeqViewComponent } from './seq-view/seq-view.component';
import {MatTabsModule} from "@angular/material/tabs";
import {MsaBarChartComponent} from "./msa-bar-chart/msa-bar-chart.component";
import {ConsurfViewComponent} from "./consurf-view/consurf-view.component";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {authInterceptor} from "./auth.interceptor";
import {ConsurfJobComponent} from "./consurf-job/consurf-job.component";
import {MatSelect} from "@angular/material/select";
import {MatCheckbox} from "@angular/material/checkbox";
import {MatListOption, MatSelectionList} from "@angular/material/list";
import {MatPaginator} from "@angular/material/paginator";
import {JobTableComponent} from "./consurf-job/job-table/job-table.component";

PlotlyModule.plotlyjs = PlotlyJS;

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ConsurfPlotComponent,
    SegmentFinderComponent,
    SegmentsViewerComponent,
    SegmentComponent,
    SeqViewComponent,
    ConsurfViewComponent,
    ConsurfJobComponent
  ],
  bootstrap: [AppComponent], imports: [BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    PlotlyModule,
    MatCardModule,
    NgxColorsModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatAutocompleteModule,
    MatTabsModule,
    MsaBarChartComponent,
    MatProgressBarModule, MatSelect, MatCheckbox, MatListOption, MatPaginator, MatSelectionList, JobTableComponent],
  exports: [
    ConsurfViewComponent,

  ],
  providers: [provideHttpClient(
    withInterceptors([authInterceptor])
  ),]
})
export class AppModule { }
