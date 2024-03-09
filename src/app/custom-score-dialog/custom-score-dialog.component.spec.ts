import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomScoreDialogComponent } from './custom-score-dialog.component';

describe('CustomScoreDialogComponent', () => {
  let component: CustomScoreDialogComponent;
  let fixture: ComponentFixture<CustomScoreDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomScoreDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CustomScoreDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
