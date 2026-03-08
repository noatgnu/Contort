import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';

import { JobTableComponent } from './job-table.component';
import { WebService } from '../../web.service';
import { WebsocketService } from '../../websocket.service';
import { BatchJobService } from '../../batch-job.service';
import { ConsurfJob } from '../../consurf-job';

describe('JobTableComponent', () => {
  let component: JobTableComponent;
  let fixture: ComponentFixture<JobTableComponent>;
  let webServiceMock: jasmine.SpyObj<WebService>;
  let websocketServiceMock: jasmine.SpyObj<WebsocketService>;
  let dialogMock: jasmine.SpyObj<MatDialog>;
  let snackBarMock: jasmine.SpyObj<MatSnackBar>;

  const mockJob: ConsurfJob = {
    id: 1,
    user: 1,
    job_title: 'Test Job',
    query_sequence: '',
    alignment_program: 'mafft',
    fasta_database: 1,
    created_at: new Date(),
    status: 'pending',
    updated_at: new Date(),
    log_data: '',
    error_data: '',
    process_cmd: '',
    max_homologs: 150,
    max_iterations: 1,
    substitution_model: 'JTT',
    maximum_likelihood: false,
    max_id: 95,
    min_id: 35,
    closest: true,
    cutoff: 0.001,
    algorithm: 'bayesian',
    email_notification: false,
    structure_file: 1,
    msa: 1,
    chain: 'A',
    uniprot_accession: 'P00000',
    query_name: 'Test'
  };

  beforeEach(async () => {
    webServiceMock = jasmine.createSpyObj('WebService', ['getConsurfJobs', 'getConsurfJob', 'cancelConsurfJob']);
    webServiceMock.getConsurfJobs.and.returnValue(of({ count: 0, results: [], next: null, previous: null }));
    webServiceMock.getConsurfJob.and.returnValue(of(mockJob));

    websocketServiceMock = jasmine.createSpyObj('WebsocketService', [], {
      jobMessage: of()
    });

    dialogMock = jasmine.createSpyObj('MatDialog', ['open']);
    snackBarMock = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [JobTableComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: WebService, useValue: webServiceMock },
        { provide: WebsocketService, useValue: websocketServiceMock },
        { provide: MatDialog, useValue: dialogMock },
        { provide: MatSnackBar, useValue: snackBarMock },
        BatchJobService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(JobTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load jobs on init', () => {
    expect(webServiceMock.getConsurfJobs).toHaveBeenCalled();
  });

  it('should open confirm dialog when cancelling a job', () => {
    const mockEvent = jasmine.createSpyObj('Event', ['stopPropagation']);
    dialogMock.open.and.returnValue({
      afterClosed: () => of(false)
    } as any);

    component.cancelJob(mockEvent, 1);

    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect(dialogMock.open).toHaveBeenCalled();
  });

  it('should return true for canCancelJob when status is pending', () => {
    expect(component.canCancelJob('pending')).toBe(true);
  });

  it('should return true for canCancelJob when status is running', () => {
    expect(component.canCancelJob('running')).toBe(true);
  });

  it('should return false for canCancelJob when status is completed', () => {
    expect(component.canCancelJob('completed')).toBe(false);
  });

  describe('row expansion', () => {
    it('should have no expanded row initially', () => {
      expect(component.expandedElement).toBeNull();
    });

    it('should toggle row expansion via toggleExpand', () => {
      const mockEvent = jasmine.createSpyObj('Event', ['stopPropagation']);
      component.toggleExpand(mockEvent, mockJob);
      expect(component.expandedElement).toBe(mockJob);
    });

    it('should collapse row when toggling same job', () => {
      const mockEvent = jasmine.createSpyObj('Event', ['stopPropagation']);
      component.toggleExpand(mockEvent, mockJob);
      component.toggleExpand(mockEvent, mockJob);
      expect(component.expandedElement).toBeNull();
    });

    it('should switch to different row when toggling different job', () => {
      const anotherJob = { ...mockJob, id: 2 };
      const mockEvent = jasmine.createSpyObj('Event', ['stopPropagation']);
      component.toggleExpand(mockEvent, mockJob);
      component.toggleExpand(mockEvent, anotherJob);
      expect(component.expandedElement).toBe(anotherJob);
    });

    it('should return true for isExpanded when job is expanded', () => {
      const mockEvent = jasmine.createSpyObj('Event', ['stopPropagation']);
      component.toggleExpand(mockEvent, mockJob);
      expect(component.isExpanded(mockJob)).toBe(true);
    });

    it('should return false for isExpanded when job is not expanded', () => {
      expect(component.isExpanded(mockJob)).toBe(false);
    });

    it('should stop propagation when toggling', () => {
      const mockEvent = jasmine.createSpyObj('Event', ['stopPropagation']);
      component.toggleExpand(mockEvent, mockJob);
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });
  });

  describe('selection', () => {
    it('should have no selection initially', () => {
      expect(component.selection.isEmpty()).toBe(true);
    });

    it('should toggle selection', () => {
      component.selection.toggle(mockJob);
      expect(component.selection.isSelected(mockJob)).toBe(true);
    });

    it('should clear selection', () => {
      component.selection.toggle(mockJob);
      component.selection.clear();
      expect(component.selection.isEmpty()).toBe(true);
    });

    it('should clear selection via clearSelection method', () => {
      component.selection.toggle(mockJob);
      component.clearSelection();
      expect(component.selection.isEmpty()).toBe(true);
    });
  });

  describe('filters form', () => {
    it('should have empty search term initially', () => {
      expect(component.form.value.searchTerm).toBe('');
    });

    it('should have all as default status filter', () => {
      expect(component.form.value.status).toBe('all');
    });

    it('should update search term via form control', () => {
      component.form.controls.searchTerm.setValue('test');
      expect(component.form.value.searchTerm).toBe('test');
    });

    it('should update status filter via form control', () => {
      component.form.controls.status.setValue('completed');
      expect(component.form.value.status).toBe('completed');
    });
  });

  describe('status helpers', () => {
    it('should return true for canCancelJob when status is pending', () => {
      expect(component.canCancelJob('pending')).toBe(true);
    });

    it('should return true for canCancelJob when status is running', () => {
      expect(component.canCancelJob('running')).toBe(true);
    });

    it('should return false for canCancelJob when status is failed', () => {
      expect(component.canCancelJob('failed')).toBe(false);
    });

    it('should return false for canCancelJob when status is cancelled', () => {
      expect(component.canCancelJob('cancelled')).toBe(false);
    });
  });

  describe('getSelectedCancellableJobs', () => {
    it('should return empty array when no selection', () => {
      expect(component.getSelectedCancellableJobs().length).toBe(0);
    });

    it('should filter only cancellable jobs', () => {
      const runningJob = { ...mockJob, id: 1, status: 'running' };
      const completedJob = { ...mockJob, id: 2, status: 'completed' };
      component.selection.select(runningJob, completedJob);
      const cancellable = component.getSelectedCancellableJobs();
      expect(cancellable.length).toBe(1);
      expect(cancellable[0].id).toBe(1);
    });
  });
});
