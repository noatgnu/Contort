import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsurfViewComponent } from './consurf-view.component';

describe('ConsurfViewComponent', () => {
  let component: ConsurfViewComponent;
  let fixture: ComponentFixture<ConsurfViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsurfViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConsurfViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
