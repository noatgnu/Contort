import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MatDialog } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';

import { DashboardComponent } from './dashboard.component';
import { WebService } from '../web.service';
import { ConsurfJob, ConsurfJobQuery } from '../consurf-job';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let webServiceMock: jasmine.SpyObj<WebService>;
  let dialogMock: jasmine.SpyObj<MatDialog>;
  let router: Router;

  const createMockJob = (overrides: Partial<ConsurfJob> = {}): ConsurfJob => ({
    id: 1,
    user: 1,
    job_title: 'Test Job',
    query_sequence: '>test\nSEQUENCE',
    alignment_program: 'MAFFT',
    fasta_database: 1,
    created_at: new Date(),
    updated_at: new Date(),
    status: 'completed',
    log_data: '',
    error_data: '',
    process_cmd: '',
    max_homologs: 150,
    max_iterations: 1,
    substitution_model: 'BEST',
    maximum_likelihood: false,
    max_id: 95,
    min_id: 35,
    closest: false,
    cutoff: 0.0001,
    algorithm: 'HMMER',
    email_notification: false,
    structure_file: 0,
    msa: 0,
    chain: '',
    uniprot_accession: '',
    query_name: '',
    ...overrides
  });

  const mockJobQuery: ConsurfJobQuery = {
    count: 10,
    results: [
      createMockJob({ id: 1, status: 'completed', job_title: 'Job 1' }),
      createMockJob({ id: 2, status: 'running', job_title: 'Job 2' }),
      createMockJob({ id: 3, status: 'pending', job_title: 'Job 3' }),
      createMockJob({ id: 4, status: 'failed', job_title: 'Job 4' }),
      createMockJob({ id: 5, status: 'completed', job_title: 'Job 5' })
    ],
    next: null,
    previous: null
  };

  const emptyJobQuery: ConsurfJobQuery = {
    count: 0,
    results: [],
    next: null,
    previous: null
  };

  beforeEach(async () => {
    webServiceMock = jasmine.createSpyObj('WebService', ['getConsurfJobs']);
    webServiceMock.getConsurfJobs.and.callFake((limit: number, offset: number, search: string, status: string) => {
      switch (status) {
        case 'all':
          return of({ count: 10, results: [], next: null, previous: null });
        case 'running':
          return of({ count: 1, results: [], next: null, previous: null });
        case 'completed':
          return of({ count: 2, results: mockJobQuery.results.filter(j => j.status === 'completed'), next: null, previous: null });
        case 'failed':
          return of({ count: 1, results: [], next: null, previous: null });
        case 'pending':
          return of({ count: 1, results: [], next: null, previous: null });
        default:
          return of(mockJobQuery);
      }
    });

    dialogMock = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideAnimations(),
        { provide: WebService, useValue: webServiceMock },
        { provide: MatDialog, useValue: dialogMock }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should load dashboard data on init', () => {
      expect(webServiceMock.getConsurfJobs).toHaveBeenCalled();
    });

    it('should set loading to false after data loads', () => {
      expect(component.loading()).toBe(false);
    });

    it('should calculate stats correctly', () => {
      const stats = component.stats();
      expect(stats).not.toBeNull();
      expect(stats!.total).toBe(10);
    });
  });

  describe('stats calculation', () => {
    it('should count completed jobs', () => {
      const stats = component.stats();
      expect(stats).not.toBeNull();
      expect(stats!.completed).toBe(2);
    });

    it('should count running jobs', () => {
      const stats = component.stats();
      expect(stats).not.toBeNull();
      expect(stats!.running).toBe(1);
    });

    it('should count pending jobs', () => {
      const stats = component.stats();
      expect(stats).not.toBeNull();
      expect(stats!.pending).toBe(1);
    });

    it('should count failed jobs', () => {
      const stats = component.stats();
      expect(stats).not.toBeNull();
      expect(stats!.failed).toBe(1);
    });
  });

  describe('recent jobs', () => {
    it('should display recent jobs', () => {
      expect(component.recentJobs().length).toBeGreaterThan(0);
    });

    it('should limit recent jobs to 5', () => {
      expect(component.recentJobs().length).toBeLessThanOrEqual(5);
    });
  });

  describe('navigation', () => {
    it('should navigate to jobs page when navigateToJobs is called', fakeAsync(() => {
      const routerSpy = spyOn(router, 'navigate');
      component.navigateToJobs();
      tick();
      expect(routerSpy).toHaveBeenCalledWith(['/consurf-job']);
    }));

    it('should navigate to jobs with status filter', fakeAsync(() => {
      const routerSpy = spyOn(router, 'navigate');
      component.navigateToJobsByStatus('running');
      tick();
      expect(routerSpy).toHaveBeenCalledWith(['/consurf-job'], { queryParams: { status: 'running' } });
    }));

    it('should navigate to specific job', fakeAsync(() => {
      const routerSpy = spyOn(router, 'navigate');
      component.navigateToJob(123);
      tick();
      expect(routerSpy).toHaveBeenCalledWith(['/consurf-job', 123]);
    }));
  });

  describe('dialogs', () => {
    it('should open upload dialog when openUploadDialog is called', () => {
      component.openUploadDialog();
      expect(dialogMock.open).toHaveBeenCalled();
    });
  });

  describe('DOM rendering', () => {
    it('should render stats cards', () => {
      const statCards = fixture.debugElement.queryAll(By.css('.stat-card'));
      expect(statCards.length).toBe(4);
    });

    it('should render dashboard header', () => {
      const header = fixture.debugElement.query(By.css('.dashboard-header h1'));
      expect(header).toBeTruthy();
      expect(header.nativeElement.textContent).toContain('Dashboard');
    });

    it('should render quick actions section', () => {
      const quickActions = fixture.debugElement.query(By.css('.quick-actions'));
      expect(quickActions).toBeTruthy();
    });
  });

  describe('empty state', () => {
    beforeEach(() => {
      webServiceMock.getConsurfJobs.and.returnValue(of(emptyJobQuery));
      fixture = TestBed.createComponent(DashboardComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should show zero stats when no jobs', () => {
      const stats = component.stats();
      expect(stats).not.toBeNull();
      expect(stats!.total).toBe(0);
      expect(stats!.completed).toBe(0);
      expect(stats!.running).toBe(0);
      expect(stats!.failed).toBe(0);
    });

    it('should have empty recent jobs', () => {
      expect(component.recentJobs().length).toBe(0);
    });
  });
});
