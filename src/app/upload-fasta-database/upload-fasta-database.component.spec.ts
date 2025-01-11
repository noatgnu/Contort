import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadFastaDatabaseComponent } from './upload-fasta-database.component';

describe('UploadFastaDatabaseComponent', () => {
  let component: UploadFastaDatabaseComponent;
  let fixture: ComponentFixture<UploadFastaDatabaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadFastaDatabaseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadFastaDatabaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
