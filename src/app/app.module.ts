import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideAnimations } from '@angular/platform-browser/animations';
import { HomeComponent } from './home/home.component';
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatMenuModule } from "@angular/material/menu";
import * as PlotlyJS from 'plotly.js-dist-min';
import { PlotlyModule } from 'angular-plotly.js';
import { MatCardModule } from "@angular/material/card";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatTabsModule } from "@angular/material/tabs";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { authInterceptor } from "./auth.interceptor";
import { errorInterceptor } from "./error.interceptor";
import { ConsurfJobComponent } from "./consurf-job/consurf-job.component";
import { MatSelect } from "@angular/material/select";
import { MatCheckbox } from "@angular/material/checkbox";
import { MatListOption, MatSelectionList } from "@angular/material/list";
import { MatPaginator } from "@angular/material/paginator";
import { JobTableComponent } from "./consurf-job/job-table/job-table.component";
import { MatTooltipModule } from "@angular/material/tooltip";
import { VisualizationModule } from "./visualization/visualization.module";
import { MatStepperModule } from "@angular/material/stepper";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatDividerModule } from "@angular/material/divider";
import { BreadcrumbComponent } from "./shared/breadcrumb/breadcrumb.component";

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ConsurfJobComponent
  ],
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    PlotlyModule.forRoot(PlotlyJS),
    MatCardModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatAutocompleteModule,
    MatTabsModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSelect,
    MatCheckbox,
    MatListOption,
    MatPaginator,
    MatSelectionList,
    JobTableComponent,
    MatTooltipModule,
    VisualizationModule,
    MatStepperModule,
    MatExpansionModule,
    MatDividerModule,
    BreadcrumbComponent
  ],
  providers: [
    provideAnimations(),
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor])
    )
  ]
})
export class AppModule { }
