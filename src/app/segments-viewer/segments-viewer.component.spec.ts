import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SegmentsViewerComponent } from './segments-viewer.component';

describe('SegmentsViewerComponent', () => {
  let component: SegmentsViewerComponent;
  let fixture: ComponentFixture<SegmentsViewerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SegmentsViewerComponent]
    });
    fixture = TestBed.createComponent(SegmentsViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
