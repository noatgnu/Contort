import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { BreadcrumbService, Breadcrumb } from './breadcrumb.service';

describe('BreadcrumbService', () => {
  let service: BreadcrumbService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])]
    });
    service = TestBed.inject(BreadcrumbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initialization', () => {
    it('should have initial breadcrumbs as empty array', () => {
      expect(service.breadcrumbs()).toBeDefined();
      expect(Array.isArray(service.breadcrumbs())).toBeTruthy();
    });
  });

  describe('setBreadcrumbs', () => {
    it('should set breadcrumbs', () => {
      const breadcrumbs: Breadcrumb[] = [
        { label: 'Home', url: '/dashboard' },
        { label: 'Jobs', url: '/consurf-job' }
      ];
      service.setBreadcrumbs(breadcrumbs);
      expect(service.breadcrumbs()).toEqual(breadcrumbs);
    });

    it('should replace existing breadcrumbs', () => {
      service.setBreadcrumbs([{ label: 'Old', url: '/old' }]);
      service.setBreadcrumbs([{ label: 'New', url: '/new' }]);
      expect(service.breadcrumbs().length).toBe(1);
      expect(service.breadcrumbs()[0].label).toBe('New');
    });

    it('should handle empty array', () => {
      service.setBreadcrumbs([{ label: 'Test', url: '/test' }]);
      service.setBreadcrumbs([]);
      expect(service.breadcrumbs().length).toBe(0);
    });
  });

  describe('addBreadcrumb', () => {
    it('should add breadcrumb to existing list', () => {
      const initial: Breadcrumb[] = [{ label: 'Home', url: '/dashboard' }];
      service.setBreadcrumbs(initial);
      service.addBreadcrumb({ label: 'Jobs', url: '/consurf-job' });
      expect(service.breadcrumbs().length).toBe(2);
      expect(service.breadcrumbs()[1].label).toBe('Jobs');
    });

    it('should add breadcrumb to empty list', () => {
      service.setBreadcrumbs([]);
      service.addBreadcrumb({ label: 'Home', url: '/dashboard' });
      expect(service.breadcrumbs().length).toBe(1);
    });

    it('should preserve order', () => {
      service.setBreadcrumbs([{ label: 'First', url: '/first' }]);
      service.addBreadcrumb({ label: 'Second', url: '/second' });
      service.addBreadcrumb({ label: 'Third', url: '/third' });

      expect(service.breadcrumbs()[0].label).toBe('First');
      expect(service.breadcrumbs()[1].label).toBe('Second');
      expect(service.breadcrumbs()[2].label).toBe('Third');
    });
  });

  describe('setCurrentLabel', () => {
    it('should update current (last) label', () => {
      service.setBreadcrumbs([
        { label: 'Home', url: '/dashboard' },
        { label: 'Old Label', url: '/test' }
      ]);
      service.setCurrentLabel('New Label');
      expect(service.breadcrumbs()[1].label).toBe('New Label');
    });

    it('should not modify other breadcrumbs', () => {
      service.setBreadcrumbs([
        { label: 'Home', url: '/dashboard' },
        { label: 'Jobs', url: '/jobs' },
        { label: 'Current', url: '/current' }
      ]);
      service.setCurrentLabel('Updated');
      expect(service.breadcrumbs()[0].label).toBe('Home');
      expect(service.breadcrumbs()[1].label).toBe('Jobs');
      expect(service.breadcrumbs()[2].label).toBe('Updated');
    });

    it('should handle single breadcrumb', () => {
      service.setBreadcrumbs([{ label: 'Only', url: '/only' }]);
      service.setCurrentLabel('Changed');
      expect(service.breadcrumbs()[0].label).toBe('Changed');
    });

    it('should handle empty breadcrumbs gracefully', () => {
      service.setBreadcrumbs([]);
      expect(() => service.setCurrentLabel('Test')).not.toThrow();
    });
  });

  describe('clearing breadcrumbs', () => {
    it('should clear all breadcrumbs via setBreadcrumbs with empty array', () => {
      service.setBreadcrumbs([
        { label: 'Home', url: '/dashboard' },
        { label: 'Jobs', url: '/jobs' }
      ]);
      service.setBreadcrumbs([]);
      expect(service.breadcrumbs().length).toBe(0);
    });
  });

  describe('typical usage patterns', () => {
    it('should handle dashboard navigation', () => {
      service.setBreadcrumbs([{ label: 'Dashboard', url: '/dashboard' }]);
      expect(service.breadcrumbs().length).toBe(1);
      expect(service.breadcrumbs()[0].label).toBe('Dashboard');
    });

    it('should handle jobs list navigation', () => {
      service.setBreadcrumbs([
        { label: 'Dashboard', url: '/dashboard' },
        { label: 'Jobs', url: '/consurf-job' }
      ]);
      expect(service.breadcrumbs().length).toBe(2);
    });

    it('should handle job detail navigation', () => {
      service.setBreadcrumbs([
        { label: 'Dashboard', url: '/dashboard' },
        { label: 'Jobs', url: '/consurf-job' },
        { label: 'Job #123', url: '/consurf-job/123' }
      ]);
      expect(service.breadcrumbs().length).toBe(3);
      expect(service.breadcrumbs()[2].label).toBe('Job #123');
    });
  });
});
