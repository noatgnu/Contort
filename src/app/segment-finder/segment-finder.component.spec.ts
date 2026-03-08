import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { provideAnimations } from '@angular/platform-browser/animations';
import { Subject } from 'rxjs';

import { SegmentFinderComponent } from './segment-finder.component';
import { DataService } from '../data.service';

describe('SegmentFinderComponent', () => {
  let component: SegmentFinderComponent;
  let fixture: ComponentFixture<SegmentFinderComponent>;

  const mockDataService = {
    segments: [],
    segmentSelection: new Subject()
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SegmentFinderComponent],
      imports: [
        ReactiveFormsModule,
        MatCardModule,
        MatInputModule,
        MatButtonModule
      ],
      providers: [
        provideAnimations(),
        { provide: DataService, useValue: mockDataService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SegmentFinderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have sequence form', () => {
    expect(component.formSequence).toBeTruthy();
  });

  it('should have start/end form', () => {
    expect(component.formStartEnd).toBeTruthy();
  });

  it('should have empty sequence initially', () => {
    expect(component.sequence).toBe('');
  });
});
