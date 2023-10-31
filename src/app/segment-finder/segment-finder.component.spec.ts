import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SegmentFinderComponent } from './segment-finder.component';

describe('SegmentFinderComponent', () => {
  let component: SegmentFinderComponent;
  let fixture: ComponentFixture<SegmentFinderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SegmentFinderComponent]
    });
    fixture = TestBed.createComponent(SegmentFinderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
