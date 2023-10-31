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

PlotlyModule.plotlyjs = PlotlyJS;

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ConsurfPlotComponent,
    SegmentFinderComponent,
    SegmentsViewerComponent,
    SegmentComponent
  ],
  imports: [
    BrowserModule,
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
    MatInputModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
