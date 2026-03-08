import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';

import { CustomScoreDialogComponent } from './custom-score-dialog.component';
import { DataService } from '../data.service';

describe('CustomScoreDialogComponent', () => {
  let component: CustomScoreDialogComponent;
  let fixture: ComponentFixture<CustomScoreDialogComponent>;

  const mockDataService = {
    customScore: {},
    aaPerRowSubject: { next: jasmine.createSpy('next') }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomScoreDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: { close: jasmine.createSpy('close') } },
        { provide: DataService, useValue: mockDataService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CustomScoreDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have empty form array initially', () => {
    expect(component.form.length).toBe(0);
  });

  it('should add a form when addForm is called', () => {
    component.addForm();
    expect(component.form.length).toBe(1);
  });
});
