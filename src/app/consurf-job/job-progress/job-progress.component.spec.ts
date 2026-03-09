import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';

import { JobProgressComponent } from './job-progress.component';

describe('JobProgressComponent', () => {
  let component: JobProgressComponent;
  let fixture: ComponentFixture<JobProgressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobProgressComponent],
      providers: [provideAnimations()]
    }).compileComponents();

    fixture = TestBed.createComponent(JobProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('status icons', () => {
    it('should show hourglass for pending', () => {
      component.status = 'pending';
      expect(component.statusIcon()).toBe('hourglass_empty');
    });

    it('should show sync for running', () => {
      component.status = 'running';
      expect(component.statusIcon()).toBe('sync');
    });

    it('should show check_circle for completed', () => {
      component.status = 'completed';
      expect(component.statusIcon()).toBe('check_circle');
    });

    it('should show error for failed', () => {
      component.status = 'failed';
      expect(component.statusIcon()).toBe('error');
    });

    it('should show cancel for cancelled', () => {
      component.status = 'cancelled';
      expect(component.statusIcon()).toBe('cancel');
    });
  });

  describe('status labels', () => {
    it('should return Pending for pending status', () => {
      component.status = 'pending';
      expect(component.statusLabel()).toBe('Pending');
    });

    it('should return Running for running status', () => {
      component.status = 'running';
      expect(component.statusLabel()).toBe('Running');
    });

    it('should return Completed for completed status', () => {
      component.status = 'completed';
      expect(component.statusLabel()).toBe('Completed');
    });

    it('should return Failed for failed status', () => {
      component.status = 'failed';
      expect(component.statusLabel()).toBe('Failed');
    });

    it('should return Cancelled for cancelled status', () => {
      component.status = 'cancelled';
      expect(component.statusLabel()).toBe('Cancelled');
    });
  });

  describe('status checks', () => {
    it('should detect running state', () => {
      component.status = 'running';
      expect(component.isRunning()).toBeTruthy();
      expect(component.isError()).toBeFalsy();
      expect(component.isCancelled()).toBeFalsy();
      expect(component.isCompleted()).toBeFalsy();
    });

    it('should detect error state', () => {
      component.status = 'failed';
      expect(component.isError()).toBeTruthy();
      expect(component.isRunning()).toBeFalsy();
      expect(component.isCancelled()).toBeFalsy();
      expect(component.isCompleted()).toBeFalsy();
    });

    it('should detect cancelled state', () => {
      component.status = 'cancelled';
      expect(component.isCancelled()).toBeTruthy();
      expect(component.isRunning()).toBeFalsy();
      expect(component.isError()).toBeFalsy();
      expect(component.isCompleted()).toBeFalsy();
    });

    it('should detect completed state', () => {
      component.status = 'completed';
      expect(component.isCompleted()).toBeTruthy();
      expect(component.isRunning()).toBeFalsy();
      expect(component.isError()).toBeFalsy();
      expect(component.isCancelled()).toBeFalsy();
    });
  });

  describe('DOM rendering - default mode', () => {
    it('should render progress display container by default', () => {
      const container = fixture.debugElement.query(By.css('.progress-display'));
      expect(container).toBeTruthy();
    });

    it('should show progress bar when running', () => {
      component.status = 'running';
      fixture.detectChanges();

      const progressBar = fixture.debugElement.query(By.css('mat-progress-bar'));
      expect(progressBar).toBeTruthy();
    });

    it('should not show progress bar when not running', () => {
      component.status = 'pending';
      fixture.detectChanges();

      const progressBar = fixture.debugElement.query(By.css('mat-progress-bar'));
      expect(progressBar).toBeFalsy();
    });

    it('should show error banner when failed', () => {
      component.status = 'failed';
      fixture.detectChanges();

      const errorBanner = fixture.debugElement.query(By.css('.error-banner'));
      expect(errorBanner).toBeTruthy();
    });

    it('should show cancelled banner when cancelled', () => {
      component.status = 'cancelled';
      fixture.detectChanges();

      const cancelledBanner = fixture.debugElement.query(By.css('.cancelled-banner'));
      expect(cancelledBanner).toBeTruthy();
    });
  });

  describe('DOM rendering - compact mode', () => {
    beforeEach(() => {
      component.compact = true;
      fixture.detectChanges();
    });

    it('should render compact progress container', () => {
      const container = fixture.debugElement.query(By.css('.compact-progress'));
      expect(container).toBeTruthy();
    });

    it('should render progress bar when running', () => {
      component.status = 'running';
      fixture.detectChanges();

      const progressBar = fixture.debugElement.query(By.css('mat-progress-bar'));
      expect(progressBar).toBeTruthy();
    });

    it('should display status badge', () => {
      component.status = 'running';
      fixture.detectChanges();

      const badge = fixture.debugElement.query(By.css('.status-badge'));
      expect(badge).toBeTruthy();
      expect(badge.nativeElement.textContent).toContain('Running');
    });

    it('should apply failed class to status badge when failed', () => {
      component.status = 'failed';
      fixture.detectChanges();

      const badge = fixture.debugElement.query(By.css('.status-badge.failed'));
      expect(badge).toBeTruthy();
    });

    it('should apply cancelled class to status badge when cancelled', () => {
      component.status = 'cancelled';
      fixture.detectChanges();

      const badge = fixture.debugElement.query(By.css('.status-badge.cancelled'));
      expect(badge).toBeTruthy();
    });
  });
});
