import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle, MatCardActions } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDivider } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { WebService } from '../web.service';
import { ConsurfJob } from '../consurf-job';
import { UploadFastaDatabaseComponent } from '../upload-fasta-database/upload-fasta-database.component';
import { SkeletonLoaderComponent } from '../shared/skeleton-loader/skeleton-loader.component';

interface DashboardStats {
  total: number;
  running: number;
  completed: number;
  failed: number;
  pending: number;
}

@Component({
  selector: 'app-dashboard',
  imports: [
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    MatCardActions,
    MatButton,
    MatIcon,
    MatDivider,
    DatePipe,
    SkeletonLoaderComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  stats = signal<DashboardStats | null>(null);
  recentJobs = signal<ConsurfJob[]>([]);
  loading = signal(true);

  constructor(
    private web: WebService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardData(): void {
    forkJoin({
      all: this.web.getConsurfJobs(1, 0, '', 'all'),
      running: this.web.getConsurfJobs(1, 0, '', 'running'),
      completed: this.web.getConsurfJobs(5, 0, '', 'completed'),
      failed: this.web.getConsurfJobs(1, 0, '', 'failed'),
      pending: this.web.getConsurfJobs(1, 0, '', 'pending')
    }).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.stats.set({
            total: data.all.count,
            running: data.running.count,
            completed: data.completed.count,
            failed: data.failed.count,
            pending: data.pending.count
          });
          this.recentJobs.set(data.completed.results.slice(0, 5));
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        }
      });
  }

  navigateToJobs(): void {
    this.router.navigate(['/consurf-job']);
  }

  navigateToJobsByStatus(status: string): void {
    this.router.navigate(['/consurf-job'], { queryParams: { status } });
  }

  navigateToJob(jobId: number): void {
    this.router.navigate(['/consurf-job', jobId]);
  }

  openUploadDialog(): void {
    this.dialog.open(UploadFastaDatabaseComponent);
  }

  refreshData(): void {
    this.loading.set(true);
    this.loadDashboardData();
  }
}
