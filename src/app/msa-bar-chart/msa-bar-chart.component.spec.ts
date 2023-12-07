import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MsaBarChartComponent } from './msa-bar-chart.component';

describe('MsaBarChartComponent', () => {
  let component: MsaBarChartComponent;
  let fixture: ComponentFixture<MsaBarChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MsaBarChartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MsaBarChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
