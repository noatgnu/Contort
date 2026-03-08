import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';

import { BreadcrumbComponent } from './breadcrumb.component';
import { BreadcrumbService } from '../../breadcrumb.service';

describe('BreadcrumbComponent', () => {
  let component: BreadcrumbComponent;
  let fixture: ComponentFixture<BreadcrumbComponent>;
  let breadcrumbService: BreadcrumbService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BreadcrumbComponent],
      providers: [
        provideRouter([]),
        BreadcrumbService
      ]
    }).compileComponents();

    breadcrumbService = TestBed.inject(BreadcrumbService);
    fixture = TestBed.createComponent(BreadcrumbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have breadcrumb service injected', () => {
    expect(component.breadcrumbService).toBeTruthy();
  });

  describe('DOM rendering', () => {
    it('should render breadcrumbs nav container', () => {
      const container = fixture.debugElement.query(By.css('nav.breadcrumb'));
      expect(container).toBeTruthy();
    });

    it('should render breadcrumb links for non-last items', () => {
      breadcrumbService.setBreadcrumbs([
        { label: 'Home', url: '/dashboard' },
        { label: 'Jobs', url: '/consurf-job' }
      ]);
      fixture.detectChanges();

      const links = fixture.debugElement.queryAll(By.css('.breadcrumb-link'));
      expect(links.length).toBe(1);
    });

    it('should render current breadcrumb as span', () => {
      breadcrumbService.setBreadcrumbs([
        { label: 'Home', url: '/dashboard' },
        { label: 'Current', url: '/current' }
      ]);
      fixture.detectChanges();

      const current = fixture.debugElement.query(By.css('.breadcrumb-current'));
      expect(current).toBeTruthy();
      expect(current.nativeElement.textContent.trim()).toBe('Current');
    });

    it('should render separators between items', () => {
      breadcrumbService.setBreadcrumbs([
        { label: 'Home', url: '/dashboard' },
        { label: 'Jobs', url: '/jobs' },
        { label: 'Details', url: '/details' }
      ]);
      fixture.detectChanges();

      const separators = fixture.debugElement.queryAll(By.css('.breadcrumb-separator'));
      expect(separators.length).toBe(2);
    });

    it('should not render links when only one breadcrumb', () => {
      breadcrumbService.setBreadcrumbs([
        { label: 'Home', url: '/dashboard' }
      ]);
      fixture.detectChanges();

      const links = fixture.debugElement.queryAll(By.css('.breadcrumb-link'));
      expect(links.length).toBe(0);

      const current = fixture.debugElement.query(By.css('.breadcrumb-current'));
      expect(current).toBeTruthy();
    });

    it('should not render anything when no breadcrumbs', () => {
      breadcrumbService.setBreadcrumbs([]);
      fixture.detectChanges();

      const links = fixture.debugElement.queryAll(By.css('.breadcrumb-link'));
      const current = fixture.debugElement.queryAll(By.css('.breadcrumb-current'));
      expect(links.length).toBe(0);
      expect(current.length).toBe(0);
    });
  });
});
