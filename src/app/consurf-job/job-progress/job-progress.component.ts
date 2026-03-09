import { Component, Input, computed, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatProgressBar } from '@angular/material/progress-bar';

@Component({
  selector: 'app-job-progress',
  imports: [MatIcon, MatProgressBar],
  templateUrl: './job-progress.component.html',
  styleUrl: './job-progress.component.scss'
})
export class JobProgressComponent {
  @Input() set status(value: string) {
    this._status.set(value);
  }

  @Input() compact = false;

  private _status = signal<string>('pending');

  statusIcon = computed(() => {
    const status = this._status();
    switch (status) {
      case 'completed': return 'check_circle';
      case 'failed': return 'error';
      case 'cancelled': return 'cancel';
      case 'running': return 'sync';
      case 'pending':
      default: return 'hourglass_empty';
    }
  });

  statusLabel = computed(() => {
    const status = this._status();
    switch (status) {
      case 'completed': return 'Completed';
      case 'failed': return 'Failed';
      case 'cancelled': return 'Cancelled';
      case 'running': return 'Running';
      case 'pending':
      default: return 'Pending';
    }
  });

  statusDescription = computed(() => {
    const status = this._status();
    switch (status) {
      case 'completed': return 'Job has completed successfully';
      case 'failed': return 'Job has failed. Check error log for details';
      case 'cancelled': return 'Job was cancelled';
      case 'running': return 'Job is currently running';
      case 'pending':
      default: return 'Job is waiting to be processed';
    }
  });

  statusClass = computed(() => this._status());
  isRunning = computed(() => this._status() === 'running');
  isError = computed(() => this._status() === 'failed');
  isCancelled = computed(() => this._status() === 'cancelled');
  isCompleted = computed(() => this._status() === 'completed');
}
