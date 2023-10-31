import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsurfPlotComponent } from './consurf-plot.component';

describe('ConsurfPlotComponent', () => {
  let component: ConsurfPlotComponent;
  let fixture: ComponentFixture<ConsurfPlotComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConsurfPlotComponent]
    });
    fixture = TestBed.createComponent(ConsurfPlotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
