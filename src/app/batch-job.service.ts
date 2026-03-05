import { Injectable } from '@angular/core';

export interface BatchJob {
  id: string;
  name: string;
  createdAt: Date;
  jobIds: number[];
}

@Injectable({
  providedIn: 'root'
})
export class BatchJobService {
  private readonly STORAGE_KEY = 'consurfBatchJobs';

  getBatches(): BatchJob[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) {
      return [];
    }
    const batches: BatchJob[] = JSON.parse(stored);
    return batches.map(b => ({
      ...b,
      createdAt: new Date(b.createdAt)
    }));
  }

  createBatch(name: string): string {
    const batches = this.getBatches();
    const id = this.generateBatchId();
    const newBatch: BatchJob = {
      id,
      name,
      createdAt: new Date(),
      jobIds: []
    };
    batches.push(newBatch);
    this.saveBatches(batches);
    return id;
  }

  addJobToBatch(batchId: string, jobId: number): void {
    const batches = this.getBatches();
    const batch = batches.find(b => b.id === batchId);
    if (batch && !batch.jobIds.includes(jobId)) {
      batch.jobIds.push(jobId);
      this.saveBatches(batches);
    }
  }

  getBatchJobs(batchId: string): number[] {
    const batch = this.getBatches().find(b => b.id === batchId);
    return batch?.jobIds || [];
  }

  getBatchForJob(jobId: number): BatchJob | undefined {
    return this.getBatches().find(b => b.jobIds.includes(jobId));
  }

  deleteBatch(batchId: string): void {
    const batches = this.getBatches().filter(b => b.id !== batchId);
    this.saveBatches(batches);
  }

  private generateBatchId(): string {
    return `batch_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private saveBatches(batches: BatchJob[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(batches));
  }
}
