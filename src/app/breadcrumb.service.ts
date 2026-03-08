import { Injectable, signal } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';

export interface Breadcrumb {
  label: string;
  url: string;
}

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {
  readonly breadcrumbs = signal<Breadcrumb[]>([]);

  private routeLabels: Record<string, string> = {
    'dashboard': 'Dashboard',
    'consurf-job': 'Jobs',
    'consurf-view': 'Visualization',
    'home': 'Home'
  };

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.buildBreadcrumbs();
      });
  }

  private buildBreadcrumbs(): void {
    const url = this.router.url.split('?')[0];
    const segments = url.split('/').filter(s => s);
    const breadcrumbs: Breadcrumb[] = [
      { label: 'Home', url: '/dashboard' }
    ];

    let currentPath = '';
    for (const segment of segments) {
      currentPath += `/${segment}`;
      const label = this.getLabel(segment);
      if (label) {
        breadcrumbs.push({ label, url: currentPath });
      }
    }

    this.breadcrumbs.set(breadcrumbs);
  }

  private getLabel(segment: string): string {
    if (this.routeLabels[segment]) {
      return this.routeLabels[segment];
    }
    if (/^\d+$/.test(segment)) {
      return `#${segment}`;
    }
    return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
  }

  setBreadcrumbs(breadcrumbs: Breadcrumb[]): void {
    this.breadcrumbs.set(breadcrumbs);
  }

  addBreadcrumb(breadcrumb: Breadcrumb): void {
    this.breadcrumbs.update(current => [...current, breadcrumb]);
  }

  setCurrentLabel(label: string): void {
    this.breadcrumbs.update(current => {
      if (current.length > 0) {
        const updated = [...current];
        updated[updated.length - 1] = { ...updated[updated.length - 1], label };
        return updated;
      }
      return current;
    });
  }
}
