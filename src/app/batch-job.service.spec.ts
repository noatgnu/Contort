import { TestBed } from '@angular/core/testing';
import { BatchJobService, BatchJob } from './batch-job.service';

describe('BatchJobService', () => {
  let service: BatchJobService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BatchJobService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createBatch', () => {
    it('should create a new batch and return its ID', () => {
      const batchId = service.createBatch('Test Batch');
      expect(batchId).toBeTruthy();
      expect(batchId.startsWith('batch_')).toBeTrue();
    });

    it('should store the batch in localStorage', () => {
      service.createBatch('Test Batch');
      const batches = service.getBatches();
      expect(batches.length).toBe(1);
      expect(batches[0].name).toBe('Test Batch');
    });
  });

  describe('getBatches', () => {
    it('should return empty array when no batches exist', () => {
      const batches = service.getBatches();
      expect(batches).toEqual([]);
    });

    it('should return all stored batches', () => {
      service.createBatch('Batch 1');
      service.createBatch('Batch 2');
      const batches = service.getBatches();
      expect(batches.length).toBe(2);
    });
  });

  describe('addJobToBatch', () => {
    it('should add a job ID to an existing batch', () => {
      const batchId = service.createBatch('Test Batch');
      service.addJobToBatch(batchId, 123);
      const jobIds = service.getBatchJobs(batchId);
      expect(jobIds).toContain(123);
    });

    it('should not add duplicate job IDs', () => {
      const batchId = service.createBatch('Test Batch');
      service.addJobToBatch(batchId, 123);
      service.addJobToBatch(batchId, 123);
      const jobIds = service.getBatchJobs(batchId);
      expect(jobIds.length).toBe(1);
    });

    it('should handle non-existent batch gracefully', () => {
      service.addJobToBatch('non-existent', 123);
      expect(service.getBatchJobs('non-existent')).toEqual([]);
    });
  });

  describe('getBatchJobs', () => {
    it('should return job IDs for a batch', () => {
      const batchId = service.createBatch('Test Batch');
      service.addJobToBatch(batchId, 1);
      service.addJobToBatch(batchId, 2);
      service.addJobToBatch(batchId, 3);
      const jobIds = service.getBatchJobs(batchId);
      expect(jobIds).toEqual([1, 2, 3]);
    });

    it('should return empty array for non-existent batch', () => {
      const jobIds = service.getBatchJobs('non-existent');
      expect(jobIds).toEqual([]);
    });
  });

  describe('getBatchForJob', () => {
    it('should return the batch containing a job', () => {
      const batchId = service.createBatch('Test Batch');
      service.addJobToBatch(batchId, 123);
      const batch = service.getBatchForJob(123);
      expect(batch).toBeTruthy();
      expect(batch?.id).toBe(batchId);
    });

    it('should return undefined for job not in any batch', () => {
      const batch = service.getBatchForJob(999);
      expect(batch).toBeUndefined();
    });
  });

  describe('deleteBatch', () => {
    it('should remove a batch', () => {
      const batchId = service.createBatch('Test Batch');
      service.deleteBatch(batchId);
      const batches = service.getBatches();
      expect(batches.length).toBe(0);
    });

    it('should handle deletion of non-existent batch', () => {
      service.createBatch('Test Batch');
      service.deleteBatch('non-existent');
      const batches = service.getBatches();
      expect(batches.length).toBe(1);
    });
  });
});
