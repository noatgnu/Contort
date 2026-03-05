import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';

import { PlotlyModule } from 'angular-plotly.js';

import { VisualizationRoutingModule } from './visualization-routing.module';
import { ConsurfViewComponent } from '../consurf-view/consurf-view.component';
import { ConsurfPlotComponent } from '../consurf-plot/consurf-plot.component';
import { SegmentFinderComponent } from '../segment-finder/segment-finder.component';
import { SegmentsViewerComponent } from '../segments-viewer/segments-viewer.component';
import { SegmentComponent } from '../segment/segment.component';
import { SeqViewComponent } from '../seq-view/seq-view.component';
import { MsaBarChartComponent } from '../msa-bar-chart/msa-bar-chart.component';

@NgModule({
  declarations: [
    ConsurfViewComponent,
    ConsurfPlotComponent,
    SegmentFinderComponent,
    SegmentsViewerComponent,
    SegmentComponent,
    SeqViewComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ScrollingModule,
    VisualizationRoutingModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatIconModule,
    PlotlyModule,
    MsaBarChartComponent
  ],
  exports: [
    ConsurfViewComponent
  ]
})
export class VisualizationModule { }
