import { Component, Input } from '@angular/core';

export type SkeletonVariant = 'table-row' | 'card' | 'text' | 'circle';

@Component({
  selector: 'app-skeleton-loader',
  imports: [],
  templateUrl: './skeleton-loader.component.html',
  styleUrl: './skeleton-loader.component.scss'
})
export class SkeletonLoaderComponent {
  @Input() variant: SkeletonVariant = 'text';
  @Input() count: number = 1;
  @Input() columns: number = 5;
  @Input() width: string = '100%';
  @Input() height: string = '20px';

  get items(): number[] {
    return Array.from({ length: this.count }, (_, i) => i);
  }

  get columnItems(): number[] {
    return Array.from({ length: this.columns }, (_, i) => i);
  }
}
