import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatStepperModule } from '@angular/material/stepper';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';

import { ConsurfJobComponent } from './consurf-job.component';
import { WebsocketService } from '../websocket.service';
import { AccountService } from '../account.service';
import { of, Subject } from 'rxjs';

describe('ConsurfJobComponent', () => {
  let component: ConsurfJobComponent;
  let fixture: ComponentFixture<ConsurfJobComponent>;

  const mockWebsocketService = {
    jobMessage: new Subject()
  };

  const mockAccountService = {
    user: null
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConsurfJobComponent],
      imports: [
        ReactiveFormsModule,
        MatTabsModule,
        MatInputModule,
        MatSelectModule,
        MatCheckboxModule,
        MatButtonModule,
        MatCardModule,
        MatStepperModule,
        MatExpansionModule,
        MatListModule,
        MatProgressBarModule,
        MatDividerModule,
        MatTooltipModule,
        MatIconModule
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideAnimations(),
        { provide: WebsocketService, useValue: mockWebsocketService },
        { provide: AccountService, useValue: mockAccountService },
        { provide: MatDialog, useValue: { open: () => ({ afterClosed: () => of(null) }) } },
        { provide: MatSnackBar, useValue: { open: jasmine.createSpy('open') } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ConsurfJobComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have form controls', () => {
    expect(component.form.get('job_title')).toBeTruthy();
    expect(component.form.get('uniprot_id')).toBeTruthy();
    expect(component.form.get('query_sequence')).toBeTruthy();
  });

  it('should validate UniProt accession format', () => {
    const control = component.form.get('uniprot_id');
    control?.setValue('invalid');
    expect(control?.hasError('invalidUniprot')).toBeTruthy();

    control?.setValue('P12345');
    expect(control?.valid).toBeTruthy();

    control?.setValue('Q9Y6K9');
    expect(control?.valid).toBeTruthy();
  });

  it('should validate FASTA format', () => {
    const control = component.form.get('query_sequence');
    control?.setValue('no header');
    expect(control?.hasError('fastaNoHeader')).toBeTruthy();

    control?.setValue('>header\nSEQUENCE');
    expect(control?.valid).toBeTruthy();
  });

  it('should validate job title max length', () => {
    const control = component.form.get('job_title');
    control?.setValue('a'.repeat(101));
    expect(control?.hasError('maxlength')).toBeTruthy();

    control?.setValue('Valid Job Title');
    expect(control?.valid).toBeTruthy();
  });

  it('should validate iterations range', () => {
    const control = component.form.get('iterations');
    control?.setValue(0);
    expect(control?.hasError('min')).toBeTruthy();

    control?.setValue(11);
    expect(control?.hasError('max')).toBeTruthy();

    control?.setValue(5);
    expect(control?.valid).toBeTruthy();
  });

  it('should return correct error messages', () => {
    component.form.get('uniprot_id')?.setValue('invalid');
    expect(component.getUniprotErrorMessage()).toBe('Invalid UniProt accession format (e.g., P12345, Q9Y6K9)');

    component.form.get('job_title')?.markAsTouched();
    expect(component.getJobTitleErrorMessage()).toBe('Job name is required');

    component.form.get('query_sequence')?.setValue('no header');
    expect(component.getSequenceErrorMessage()).toBe('Sequence must start with a ">" header line');
  });
});
