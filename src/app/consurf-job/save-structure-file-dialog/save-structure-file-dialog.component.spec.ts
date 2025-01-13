import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveStructureFileDialogComponent } from './save-structure-file-dialog.component';

describe('SaveStructureFileDialogComponent', () => {
  let component: SaveStructureFileDialogComponent;
  let fixture: ComponentFixture<SaveStructureFileDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaveStructureFileDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SaveStructureFileDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
