import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeqViewComponent } from './seq-view.component';

describe('SeqViewComponent', () => {
  let component: SeqViewComponent;
  let fixture: ComponentFixture<SeqViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SeqViewComponent]
    });
    fixture = TestBed.createComponent(SeqViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
