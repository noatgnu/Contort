import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsurfJobComponent } from './consurf-job.component';

describe('ConsurfJobComponent', () => {
  let component: ConsurfJobComponent;
  let fixture: ComponentFixture<ConsurfJobComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsurfJobComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsurfJobComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
