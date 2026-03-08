import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';

import { SegmentComponent } from './segment.component';
import { DataService } from '../data.service';
import { PlotlyModule } from 'angular-plotly.js';
import * as PlotlyJS from 'plotly.js-dist-min';

describe('SegmentComponent', () => {
  let component: SegmentComponent;
  let fixture: ComponentFixture<SegmentComponent>;

  const mockDataService = {
    redrawSubject: new Subject(),
    segmentSettings: {
      'margin-bottom': 20,
      'margin-top': 0,
      'cell-size': 50
    },
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
    customScore: {},
    selectionMap: {},
    segmentColorMap: {}
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SegmentComponent],
      imports: [PlotlyModule.forRoot(PlotlyJS)],
      providers: [
        { provide: DataService, useValue: mockDataService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SegmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default segment values', () => {
    expect(component.segment.start).toBe(0);
    expect(component.segment.end).toBe(0);
  });

  it('should have graph data array', () => {
    expect(Array.isArray(component.graphData)).toBeTruthy();
  });
});
