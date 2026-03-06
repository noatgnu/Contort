import { TestBed } from '@angular/core/testing';
import { CacheService } from './cache.service';

describe('CacheService', () => {
  let service: CacheService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CacheService);
  });

  afterEach(() => {
    service.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('get and set', () => {
    it('should store and retrieve data', () => {
      service.set('test-key', { data: 'test' });
      const result = service.get<{ data: string }>('test-key');
      expect(result).toEqual({ data: 'test' });
    });

    it('should return null for non-existent keys', () => {
      const result = service.get('non-existent');
      expect(result).toBeNull();
    });

    it('should return null for expired entries', (done) => {
      service.set('expiring-key', 'data', 50);
      setTimeout(() => {
        const result = service.get('expiring-key');
        expect(result).toBeNull();
        done();
      }, 100);
    });

    it('should return data before TTL expires', (done) => {
      service.set('valid-key', 'data', 200);
      setTimeout(() => {
        const result = service.get('valid-key');
        expect(result).toBe('data');
        done();
      }, 50);
    });
  });

  describe('invalidate', () => {
    it('should remove a specific key', () => {
      service.set('key1', 'data1');
      service.set('key2', 'data2');
      service.invalidate('key1');
      expect(service.get('key1')).toBeNull();
      expect(service.get('key2')).toBe('data2');
    });
  });

  describe('invalidateByPrefix', () => {
    it('should remove all keys with the specified prefix', () => {
      service.set('fasta:1:0', 'data1');
      service.set('fasta:2:0', 'data2');
      service.set('msa:1:0', 'data3');
      service.invalidateByPrefix('fasta');
      expect(service.get('fasta:1:0')).toBeNull();
      expect(service.get('fasta:2:0')).toBeNull();
      expect(service.get('msa:1:0')).toBe('data3');
    });
  });

  describe('clear', () => {
    it('should remove all cached entries', () => {
      service.set('key1', 'data1');
      service.set('key2', 'data2');
      service.clear();
      expect(service.get('key1')).toBeNull();
      expect(service.get('key2')).toBeNull();
    });
  });

  describe('has', () => {
    it('should return true for existing keys', () => {
      service.set('existing-key', 'data');
      expect(service.has('existing-key')).toBe(true);
    });

    it('should return false for non-existent keys', () => {
      expect(service.has('non-existent')).toBe(false);
    });

    it('should return false for expired keys', (done) => {
      service.set('expiring-key', 'data', 50);
      setTimeout(() => {
        expect(service.has('expiring-key')).toBe(false);
        done();
      }, 100);
    });
  });

  describe('generateKey', () => {
    it('should generate a key from parts', () => {
      const key = service.generateKey('fasta', 10, 0, 'search');
      expect(key).toBe('fasta:10:0:search');
    });

    it('should filter out undefined and null values', () => {
      const key = service.generateKey('fasta', 10, undefined, null, 'search');
      expect(key).toBe('fasta:10:search');
    });
  });
});
