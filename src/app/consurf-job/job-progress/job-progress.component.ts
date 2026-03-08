import { Component, Input, computed, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatProgressBar } from '@angular/material/progress-bar';

export interface ProgressStage {
  id: string;
  label: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-job-progress',
  imports: [MatIcon, MatTooltip, MatProgressBar],
  templateUrl: './job-progress.component.html',
  styleUrl: './job-progress.component.scss'
})
export class JobProgressComponent {
  @Input() set status(value: string) {
    this._status.set(value);
  }

  @Input() set logData(value: string) {
    this._logData.set(value);
  }

  @Input() compact = false;

  private _status = signal<string>('pending');
  private _logData = signal<string>('');

  readonly stages: ProgressStage[] = [
    { id: 'queued', label: 'Queued', icon: 'hourglass_empty', description: 'Job is waiting to be processed' },
    { id: 'searching', label: 'Homolog Search', icon: 'search', description: 'Searching for homologous sequences' },
    { id: 'aligning', label: 'Alignment', icon: 'align_horizontal_left', description: 'Building multiple sequence alignment' },
    { id: 'computing', label: 'Computing', icon: 'calculate', description: 'Computing conservation scores' },
    { id: 'output', label: 'Output', icon: 'file_copy', description: 'Generating output files' },
    { id: 'complete', label: 'Complete', icon: 'check_circle', description: 'Job completed successfully' }
  ];

  currentStageIndex = computed(() => {
    const status = this._status();
    const log = this._logData();

    if (status === 'cancelled') return -2;
    if (status === 'failed') return -1;
    if (status === 'completed') return 5;
    if (status === 'pending') return 0;

    if (status === 'running') {
      if (log.includes('Generating output') || log.includes('Writing results')) return 4;
      if (log.includes('Computing conservation') || log.includes('Rate4Site') || log.includes('Bayesian')) return 3;
      if (log.includes('MAFFT') || log.includes('CLUSTAL') || log.includes('alignment')) return 2;
      if (log.includes('HMMER') || log.includes('BLAST') || log.includes('searching')) return 1;
      return 1;
    }

    return 0;
  });

  progressPercent = computed(() => {
    const index = this.currentStageIndex();
    if (index < 0) return 0;
    return Math.round((index / (this.stages.length - 1)) * 100);
  });

  getStageStatus(index: number): 'completed' | 'active' | 'pending' | 'error' {
    const current = this.currentStageIndex();
    if (current === -2 || current === -1) {
      if (index === 0) return 'error';
      return 'pending';
    }
    if (index < current) return 'completed';
    if (index === current) return 'active';
    return 'pending';
  }

  isError = computed(() => this._status() === 'failed');
  isCancelled = computed(() => this._status() === 'cancelled');
  statusLabel = computed(() => {
    const status = this._status();
    if (status === 'failed') return 'Failed';
    if (status === 'cancelled') return 'Cancelled';
    if (status === 'completed') return 'Completed';
    if (status === 'pending') return 'Queued';
    return 'Running';
  });
}
