import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { SaveStructureFileDialogComponent } from './save-structure-file-dialog.component';

describe('SaveStructureFileDialogComponent', () => {
  let component: SaveStructureFileDialogComponent;
  let fixture: ComponentFixture<SaveStructureFileDialogComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<SaveStructureFileDialogComponent>>;

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [SaveStructureFileDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: { suggestedName: 'test.pdb', chains: ['A', 'B'] } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SaveStructureFileDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with suggested name', () => {
    expect(component.form.value.name).toBe('test.pdb');
  });

  it('should initialize with chains', () => {
    expect(component.chains).toEqual(['A', 'B']);
  });

  it('should close dialog with name on save', () => {
    component.form.patchValue({ name: 'new-name.pdb' });
    component.save();
    expect(dialogRefSpy.close).toHaveBeenCalledWith('new-name.pdb');
  });

  it('should close dialog without value on cancel', () => {
    component.cancel();
    expect(dialogRefSpy.close).toHaveBeenCalledWith();
  });
});
