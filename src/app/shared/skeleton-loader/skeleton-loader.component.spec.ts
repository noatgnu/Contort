import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { SkeletonLoaderComponent } from './skeleton-loader.component';

describe('SkeletonLoaderComponent', () => {
  let component: SkeletonLoaderComponent;
  let fixture: ComponentFixture<SkeletonLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkeletonLoaderComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SkeletonLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('default values', () => {
    it('should have default variant as text', () => {
      expect(component.variant).toBe('text');
    });

    it('should have default count as 1', () => {
      expect(component.count).toBe(1);
    });

    it('should have default columns as 5', () => {
      expect(component.columns).toBe(5);
    });
  });

  describe('items generation', () => {
    it('should generate correct number of items', () => {
      component.count = 5;
      expect(component.items.length).toBe(5);
    });

    it('should generate items array with sequential numbers', () => {
      component.count = 3;
      expect(component.items).toEqual([0, 1, 2]);
    });

    it('should generate correct number of columns for table-row variant', () => {
      component.columns = 8;
      expect(component.columnItems.length).toBe(8);
    });

    it('should update items when count changes', () => {
      component.count = 2;
      expect(component.items.length).toBe(2);
      component.count = 4;
      expect(component.items.length).toBe(4);
    });
  });

  describe('variant rendering', () => {
    it('should render text variant correctly', () => {
      component.variant = 'text';
      component.count = 2;
      fixture.detectChanges();

      const textElements = fixture.debugElement.queryAll(By.css('.skeleton-text'));
      expect(textElements.length).toBe(2);
    });

    it('should render card variant correctly', () => {
      component.variant = 'card';
      component.count = 3;
      fixture.detectChanges();

      const cardElements = fixture.debugElement.queryAll(By.css('.skeleton-card'));
      expect(cardElements.length).toBe(3);
    });

    it('should render circle variant correctly', () => {
      component.variant = 'circle';
      component.count = 2;
      fixture.detectChanges();

      const circleElements = fixture.debugElement.queryAll(By.css('.skeleton-circle'));
      expect(circleElements.length).toBe(2);
    });

    it('should render table-row variant with correct columns', () => {
      component.variant = 'table-row';
      component.count = 2;
      component.columns = 4;
      fixture.detectChanges();

      const rows = fixture.debugElement.queryAll(By.css('.skeleton-table-row'));
      expect(rows.length).toBe(2);

      const cells = fixture.debugElement.queryAll(By.css('.skeleton-cell'));
      expect(cells.length).toBe(8);
    });
  });

  describe('shimmer animation', () => {
    it('should have shimmer class on skeleton elements', () => {
      component.variant = 'text';
      fixture.detectChanges();

      const shimmerElement = fixture.debugElement.query(By.css('.shimmer'));
      expect(shimmerElement).toBeTruthy();
    });
  });

  describe('edge cases', () => {
    it('should handle count of 0', () => {
      component.count = 0;
      expect(component.items.length).toBe(0);
    });

    it('should handle large count', () => {
      component.count = 100;
      expect(component.items.length).toBe(100);
    });

    it('should handle columns of 1', () => {
      component.columns = 1;
      expect(component.columnItems.length).toBe(1);
    });
  });
});
