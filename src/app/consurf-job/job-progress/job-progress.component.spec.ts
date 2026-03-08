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

  it('should have 6 progress stages', () => {
    expect(component.stages.length).toBe(6);
  });

  describe('stages definition', () => {
    it('should have queued as first stage', () => {
      expect(component.stages[0].id).toBe('queued');
    });

    it('should have complete as last stage', () => {
      expect(component.stages[5].id).toBe('complete');
    });

    it('should have icons for all stages', () => {
      const allHaveIcons = component.stages.every(s => s.icon);
      expect(allHaveIcons).toBeTruthy();
    });

    it('should have descriptions for all stages', () => {
      const allHaveDescriptions = component.stages.every(s => s.description);
      expect(allHaveDescriptions).toBeTruthy();
    });
  });

  it('should return 0% progress for pending status', () => {
    component.status = 'pending';
    expect(component.progressPercent()).toBe(0);
  });

  it('should return 100% progress for completed status', () => {
    component.status = 'completed';
    expect(component.progressPercent()).toBe(100);
  });

  it('should detect searching stage from log data', () => {
    component.status = 'running';
    component.logData = 'Running HMMER search...';
    expect(component.currentStageIndex()).toBe(1);
  });

  it('should detect alignment stage from log data', () => {
    component.status = 'running';
    component.logData = 'Running MAFFT alignment...';
    expect(component.currentStageIndex()).toBe(2);
  });

  it('should detect computing stage from log data', () => {
    component.status = 'running';
    component.logData = 'Computing conservation scores...';
    expect(component.currentStageIndex()).toBe(3);
  });

  it('should detect output stage from log data', () => {
    component.status = 'running';
    component.logData = 'Generating output files...';
    expect(component.currentStageIndex()).toBe(4);
  });

  it('should return error index for failed status', () => {
    component.status = 'failed';
    expect(component.currentStageIndex()).toBe(-1);
  });

  it('should return cancelled index for cancelled status', () => {
    component.status = 'cancelled';
    expect(component.currentStageIndex()).toBe(-2);
  });

  it('should return correct stage status', () => {
    component.status = 'running';
    component.logData = 'Running MAFFT alignment...';

    expect(component.getStageStatus(0)).toBe('completed');
    expect(component.getStageStatus(1)).toBe('completed');
    expect(component.getStageStatus(2)).toBe('active');
    expect(component.getStageStatus(3)).toBe('pending');
  });

  it('should show error state correctly', () => {
    component.status = 'failed';
    expect(component.isError()).toBeTruthy();
    expect(component.isCancelled()).toBeFalsy();
  });

  it('should show cancelled state correctly', () => {
    component.status = 'cancelled';
    expect(component.isCancelled()).toBeTruthy();
    expect(component.isError()).toBeFalsy();
  });

  it('should return correct status label', () => {
    component.status = 'pending';
    expect(component.statusLabel()).toBe('Queued');

    component.status = 'running';
    expect(component.statusLabel()).toBe('Running');

    component.status = 'completed';
    expect(component.statusLabel()).toBe('Completed');

    component.status = 'failed';
    expect(component.statusLabel()).toBe('Failed');

    component.status = 'cancelled';
    expect(component.statusLabel()).toBe('Cancelled');
  });

  describe('DOM rendering timeline mode (default)', () => {
    it('should render timeline container by default', () => {
      const container = fixture.debugElement.query(By.css('.progress-timeline'));
      expect(container).toBeTruthy();
    });

    it('should render all stage icons', () => {
      component.status = 'pending';
      fixture.detectChanges();

      const icons = fixture.debugElement.queryAll(By.css('.stage-icon'));
      expect(icons.length).toBe(6);
    });

    it('should apply completed class to passed stages', () => {
      component.status = 'running';
      component.logData = 'Running MAFFT alignment...';
      fixture.detectChanges();

      const completedStages = fixture.debugElement.queryAll(By.css('.stage.completed'));
      expect(completedStages.length).toBeGreaterThan(0);
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

    it('should display progress percent', () => {
      component.status = 'running';
      component.logData = 'Running MAFFT alignment...';
      fixture.detectChanges();

      const percent = fixture.debugElement.query(By.css('.progress-percent'));
      expect(percent).toBeTruthy();
    });
  });

  describe('DOM rendering compact mode', () => {
    beforeEach(() => {
      component.compact = true;
      fixture.detectChanges();
    });

    it('should render compact progress container', () => {
      const container = fixture.debugElement.query(By.css('.compact-progress'));
      expect(container).toBeTruthy();
    });

    it('should render progress bar', () => {
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

    it('should apply error class to status badge when failed', () => {
      component.status = 'failed';
      fixture.detectChanges();

      const errorBadge = fixture.debugElement.query(By.css('.status-badge.error'));
      expect(errorBadge).toBeTruthy();
    });

    it('should apply cancelled class to status badge when cancelled', () => {
      component.status = 'cancelled';
      fixture.detectChanges();

      const cancelledBadge = fixture.debugElement.query(By.css('.status-badge.cancelled'));
      expect(cancelledBadge).toBeTruthy();
    });
  });

  describe('progress calculation', () => {
    it('should calculate 20% for searching stage', () => {
      component.status = 'running';
      component.logData = 'Running HMMER search...';
      expect(component.progressPercent()).toBe(20);
    });

    it('should calculate 40% for alignment stage', () => {
      component.status = 'running';
      component.logData = 'Running MAFFT alignment...';
      expect(component.progressPercent()).toBe(40);
    });

    it('should calculate 60% for computing stage', () => {
      component.status = 'running';
      component.logData = 'Computing conservation scores...';
      expect(component.progressPercent()).toBe(60);
    });

    it('should calculate 80% for output stage', () => {
      component.status = 'running';
      component.logData = 'Generating output files...';
      expect(component.progressPercent()).toBe(80);
    });
  });
});
