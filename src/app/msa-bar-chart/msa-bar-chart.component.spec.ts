import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MsaBarChartComponent } from './msa-bar-chart.component';
import { DataService } from '../data.service';
import { PlotlyModule } from 'angular-plotly.js';
import * as PlotlyJS from 'plotly.js-dist-min';

describe('MsaBarChartComponent', () => {
  let component: MsaBarChartComponent;
  let fixture: ComponentFixture<MsaBarChartComponent>;

  const mockDataService = {
    aaColorMap: {
      'A': '#C8C8C8',
      'R': '#145AFF',
      'N': '#00DCDC',
      'D': '#E60A0A',
      'C': '#E6E600',
      'E': '#E60A0A',
      'Q': '#00DCDC',
      'G': '#EBEBEB',
      'H': '#8282D2',
      'I': '#0F820F',
      'L': '#0F820F',
      'K': '#145AFF',
      'M': '#E6E600',
      'F': '#3232AA',
      'P': '#DC9682',
      'S': '#FA9600',
      'T': '#FA9600',
      'W': '#B45AB4',
      'Y': '#3232AA',
      'V': '#0F820F'
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MsaBarChartComponent, PlotlyModule.forRoot(PlotlyJS)],
      providers: [
        { provide: DataService, useValue: mockDataService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MsaBarChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have graph data array', () => {
    expect(Array.isArray(component.graphData)).toBeTruthy();
  });

  it('should have graph layout', () => {
    expect(component.graphLayout).toBeTruthy();
  });
});
