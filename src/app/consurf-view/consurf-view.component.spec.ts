import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { Subject } from 'rxjs';

import { ConsurfViewComponent } from './consurf-view.component';
import { DataService } from '../data.service';
import { PlotlyModule } from 'angular-plotly.js';
import * as PlotlyJS from 'plotly.js-dist-min';

describe('ConsurfViewComponent', () => {
  let component: ConsurfViewComponent;
  let fixture: ComponentFixture<ConsurfViewComponent>;

  const mockDataService = {
    color_map: {
      '1': 'rgb(16, 200, 209)',
      '2': 'rgb(140, 255, 255)',
      '3': 'rgb(215, 255, 255)',
      '4': 'rgb(253, 255, 255)',
      '5': 'rgb(255, 255, 255)',
      '6': 'rgb(252, 237, 244)',
      '7': 'rgb(250, 201, 222)',
      '8': 'rgb(240, 125, 171)',
      '9': 'rgb(160, 37, 96)'
    },
    segmentSettings: {
      'margin-bottom': 20,
      'margin-top': 0,
      'cell-size': 50
    },
    customScore: {},
    segments: [],
    segmentSelection: new Subject(),
    selectionMap: {},
    segmentColorMap: {},
    redrawSubject: new Subject(),
    aaPerRowSubject: new Subject()
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConsurfViewComponent],
      imports: [
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatAutocompleteModule,
        MatProgressBarModule,
        MatTabsModule,
        MatIconModule,
        ScrollingModule,
        PlotlyModule.forRoot(PlotlyJS)
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideAnimations(),
        { provide: DataService, useValue: mockDataService },
        { provide: MatSnackBar, useValue: { open: jasmine.createSpy('open') } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ConsurfViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have form control', () => {
    expect(component.form).toBeTruthy();
  });

  it('should convert RGB to Hex', () => {
    expect(component.rgbToHex('rgb(255, 0, 0)')).toBe('#ff0000');
  });

  it('should convert Hex to RGB', () => {
    expect(component.hexToRgb('#ff0000')).toBe('rgb(255, 0, 0)');
  });
});
