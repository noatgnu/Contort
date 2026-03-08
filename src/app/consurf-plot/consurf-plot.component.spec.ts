import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';

import { ConsurfPlotComponent } from './consurf-plot.component';
import { DataService } from '../data.service';
import { PlotlyModule } from 'angular-plotly.js';
import * as PlotlyJS from 'plotly.js-dist-min';

describe('ConsurfPlotComponent', () => {
  let component: ConsurfPlotComponent;
  let fixture: ComponentFixture<ConsurfPlotComponent>;

  const mockDataService = {
    color_map: {
      '1': '#10C8D1',
      '2': '#8CFFFF',
      '3': '#D7FFFF',
      '4': '#FDFFFF',
      '5': '#FFFFFF',
      '6': '#FCEDF4',
      '7': '#FAC9DE',
      '8': '#F07DAB',
      '9': '#A02560'
    },
    redrawSubject: new Subject()
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConsurfPlotComponent],
      imports: [PlotlyModule.forRoot(PlotlyJS)],
      providers: [
        { provide: DataService, useValue: mockDataService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ConsurfPlotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have empty graph data initially', () => {
    expect(component.graphData.length).toBe(0);
  });

  it('should have graph layout', () => {
    expect(component.graphLayout).toBeTruthy();
  });
});
