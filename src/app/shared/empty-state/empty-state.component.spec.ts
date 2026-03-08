import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { EmptyStateComponent } from './empty-state.component';

describe('EmptyStateComponent', () => {
  let component: EmptyStateComponent;
  let fixture: ComponentFixture<EmptyStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyStateComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(EmptyStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('default values', () => {
    it('should have default icon as inbox', () => {
      expect(component.icon).toBe('inbox');
    });

    it('should have default title as No data', () => {
      expect(component.title).toBe('No data');
    });

    it('should have empty description by default', () => {
      expect(component.description).toBe('');
    });
  });

  describe('input properties', () => {
    it('should accept custom icon', () => {
      component.icon = 'work_off';
      fixture.detectChanges();
      expect(component.icon).toBe('work_off');
    });

    it('should accept custom title', () => {
      component.title = 'No jobs found';
      fixture.detectChanges();
      expect(component.title).toBe('No jobs found');
    });

    it('should accept custom description', () => {
      component.description = 'Create your first job to get started';
      fixture.detectChanges();
      expect(component.description).toBe('Create your first job to get started');
    });
  });

  describe('DOM rendering', () => {
    it('should render the icon', () => {
      component.icon = 'search_off';
      fixture.detectChanges();

      const iconElement = fixture.debugElement.query(By.css('mat-icon'));
      expect(iconElement).toBeTruthy();
      expect(iconElement.nativeElement.textContent.trim()).toBe('search_off');
    });

    it('should render the title', () => {
      component.title = 'Custom Title';
      fixture.detectChanges();

      const titleElement = fixture.debugElement.query(By.css('.empty-state-title'));
      expect(titleElement).toBeTruthy();
      expect(titleElement.nativeElement.textContent.trim()).toBe('Custom Title');
    });

    it('should render the description when provided', () => {
      component.description = 'This is a description';
      fixture.detectChanges();

      const descElement = fixture.debugElement.query(By.css('.empty-state-description'));
      expect(descElement).toBeTruthy();
      expect(descElement.nativeElement.textContent.trim()).toBe('This is a description');
    });

    it('should not render description element when empty', () => {
      component.description = '';
      fixture.detectChanges();

      const descElement = fixture.debugElement.query(By.css('.empty-state-description'));
      expect(descElement).toBeFalsy();
    });

    it('should have empty-state container class', () => {
      const container = fixture.debugElement.query(By.css('.empty-state'));
      expect(container).toBeTruthy();
    });
  });

  describe('different use cases', () => {
    it('should display no jobs state correctly', () => {
      component.icon = 'work_off';
      component.title = 'No jobs yet';
      component.description = 'Create your first ConSurf job to get started.';
      fixture.detectChanges();

      const iconElement = fixture.debugElement.query(By.css('mat-icon'));
      const titleElement = fixture.debugElement.query(By.css('.empty-state-title'));
      const descElement = fixture.debugElement.query(By.css('.empty-state-description'));

      expect(iconElement.nativeElement.textContent.trim()).toBe('work_off');
      expect(titleElement.nativeElement.textContent.trim()).toBe('No jobs yet');
      expect(descElement.nativeElement.textContent.trim()).toBe('Create your first ConSurf job to get started.');
    });

    it('should display no search results state correctly', () => {
      component.icon = 'search_off';
      component.title = 'No jobs match your filters';
      component.description = 'Try adjusting your search term or status filter.';
      fixture.detectChanges();

      const iconElement = fixture.debugElement.query(By.css('mat-icon'));
      expect(iconElement.nativeElement.textContent.trim()).toBe('search_off');
    });
  });
});
