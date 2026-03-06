import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { WebService } from './web.service';
import { CacheService } from './cache.service';
import { environment } from '../environments/environment';

describe('WebService', () => {
  let service: WebService;
  let httpMock: HttpTestingController;
  let cacheServiceMock: {
    get: jasmine.Spy;
    set: jasmine.Spy;
    invalidateByPrefix: jasmine.Spy;
    generateKey: jasmine.Spy;
  };

  beforeEach(() => {
    cacheServiceMock = {
      get: jasmine.createSpy('get').and.returnValue(null),
      set: jasmine.createSpy('set'),
      invalidateByPrefix: jasmine.createSpy('invalidateByPrefix'),
      generateKey: jasmine.createSpy('generateKey').and.callFake((...parts: string[]) => parts.join(':'))
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: CacheService, useValue: cacheServiceMock }
      ]
    });

    service = TestBed.inject(WebService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getConsurfGrade', () => {
    it('should fetch consurf grades for a uniprot ID', () => {
      const mockGrades = [{ POS: 1, SEQ: 'M', COLOR: [1] }];

      service.getConsurfGrade('P12345').subscribe(data => {
        expect(data.length).toBe(1);
        expect(data[0].POS).toBe(1);
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/api/consurf/consurf_grade/P12345`);
      expect(req.request.method).toBe('GET');
      req.flush(mockGrades);
    });
  });

  describe('getConsurfMSAVar', () => {
    it('should fetch MSA variation for a uniprot ID', () => {
      const mockMSAVar = [{ pos: 1, A: 10, C: 5 }];

      service.getConsurfMSAVar('P12345').subscribe(data => {
        expect(data.length).toBe(1);
        expect(data[0].pos).toBe(1);
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/api/consurf/consurf_msa_variation/P12345`);
      expect(req.request.method).toBe('GET');
      req.flush(mockMSAVar);
    });
  });

  describe('getUniprotTypeAhead', () => {
    it('should return cached data if available', () => {
      const cachedData = ['P12345', 'P12346'];
      cacheServiceMock.get.and.returnValue(cachedData);

      service.getUniprotTypeAhead('P123').subscribe(data => {
        expect(data).toEqual(cachedData);
      });

      httpMock.expectNone(`${environment.baseUrl}/api/consurf/typeahead/P123`);
    });

    it('should fetch and cache typeahead results', () => {
      const mockResults = ['P12345', 'P12346'];

      service.getUniprotTypeAhead('P123').subscribe(data => {
        expect(data).toEqual(mockResults);
        expect(cacheServiceMock.set).toHaveBeenCalled();
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/api/consurf/typeahead/P123`);
      req.flush(mockResults);
    });
  });

  describe('getProteinFastaDatabases', () => {
    it('should fetch databases with pagination', () => {
      const mockQuery = { results: [], count: 0, next: null, previous: null };

      service.getProteinFastaDatabases(10, 0).subscribe(data => {
        expect(data).toEqual(mockQuery);
      });

      const req = httpMock.expectOne(r => r.url.includes('/api/fasta/'));
      expect(req.request.params.get('limit')).toBe('10');
      expect(req.request.params.get('offset')).toBe('0');
      req.flush(mockQuery);
    });

    it('should include search term when provided', () => {
      const mockQuery = { results: [], count: 0, next: null, previous: null };

      service.getProteinFastaDatabases(10, 0, 'test').subscribe(data => {
        expect(data).toEqual(mockQuery);
      });

      const req = httpMock.expectOne(r => r.url.includes('/api/fasta/'));
      expect(req.request.params.get('search')).toBe('test');
      req.flush(mockQuery);
    });
  });

  describe('deleteProteinFastaDatabase', () => {
    it('should delete a database and invalidate cache', () => {
      service.deleteProteinFastaDatabase(1).subscribe(() => {
        expect(cacheServiceMock.invalidateByPrefix).toHaveBeenCalledWith('fasta');
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/api/fasta/1/`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });

  describe('getMSAs', () => {
    it('should fetch MSAs with pagination', () => {
      const mockQuery = { results: [], count: 0, next: null, previous: null };

      service.getMSAs(10, 0).subscribe(data => {
        expect(data).toEqual(mockQuery);
      });

      const req = httpMock.expectOne(r => r.url.includes('/api/msa/'));
      expect(req.request.params.get('limit')).toBe('10');
      req.flush(mockQuery);
    });
  });

  describe('getStructures', () => {
    it('should fetch structures with pagination', () => {
      const mockQuery = { results: [], count: 0, next: null, previous: null };

      service.getStructures(10, 0).subscribe(data => {
        expect(data).toEqual(mockQuery);
      });

      const req = httpMock.expectOne(r => r.url.includes('/api/structure/'));
      expect(req.request.params.get('limit')).toBe('10');
      req.flush(mockQuery);
    });
  });

  describe('getConsurfJobs', () => {
    it('should fetch jobs with filters', () => {
      const mockQuery = { results: [], count: 0, next: null, previous: null };

      service.getConsurfJobs(10, 0, 'test', 'completed').subscribe(data => {
        expect(data).toEqual(mockQuery);
      });

      const req = httpMock.expectOne(r => r.url.includes('/api/job/'));
      expect(req.request.params.get('search')).toBe('test');
      expect(req.request.params.get('status')).toBe('completed');
      req.flush(mockQuery);
    });
  });

  describe('submitConsurfJob', () => {
    it('should submit a job', () => {
      const payload = { query_sequence: '>test\nMKT', job_title: 'Test' };
      const mockJob = { id: 1, status: 'pending' };

      service.submitConsurfJob(payload).subscribe(data => {
        expect(data).toEqual(mockJob as any);
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/api/job/`);
      expect(req.request.method).toBe('POST');
      req.flush(mockJob);
    });
  });

  describe('cancelConsurfJob', () => {
    it('should cancel a job', () => {
      const mockResponse = { message: 'cancelled', status: 'cancelled' };

      service.cancelConsurfJob(1).subscribe(data => {
        expect(data).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/api/consurf-job/1/cancel/`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('login', () => {
    it('should login and return token', () => {
      const mockResponse = { token: 'abc123' };

      service.login('user', 'pass').subscribe(data => {
        expect(data.token).toBe('abc123');
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/api/token-auth/`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ username: 'user', password: 'pass' });
      req.flush(mockResponse);
    });
  });

  describe('share methods', () => {
    it('should share database and invalidate cache', () => {
      service.shareFastaDatabase(1, ['user1']).subscribe(() => {
        expect(cacheServiceMock.invalidateByPrefix).toHaveBeenCalledWith('fasta');
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/api/fasta/1/share/`);
      req.flush({});
    });

    it('should share MSA and invalidate cache', () => {
      service.shareMSA(1, ['user1']).subscribe(() => {
        expect(cacheServiceMock.invalidateByPrefix).toHaveBeenCalledWith('msa');
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/api/msa/1/share/`);
      req.flush({});
    });

    it('should share structure and invalidate cache', () => {
      service.shareStructure(1, ['user1']).subscribe(() => {
        expect(cacheServiceMock.invalidateByPrefix).toHaveBeenCalledWith('structure');
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/api/structure/1/share/`);
      req.flush({});
    });
  });

  describe('bindUploadedFile', () => {
    it('should bind database file and invalidate cache', () => {
      service.bindUploadedFile('test.fasta', 'upload123', 'database').subscribe(() => {
        expect(cacheServiceMock.invalidateByPrefix).toHaveBeenCalledWith('fasta');
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/api/fasta/`);
      expect(req.request.body).toEqual({ name: 'test.fasta', upload_id: 'upload123' });
      req.flush({});
    });

    it('should bind MSA file and invalidate cache', () => {
      service.bindUploadedFile('test.aln', 'upload123', 'msa').subscribe(() => {
        expect(cacheServiceMock.invalidateByPrefix).toHaveBeenCalledWith('msa');
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/api/msa/`);
      req.flush({});
    });

    it('should bind structure file and invalidate cache', () => {
      service.bindUploadedFile('test.pdb', 'upload123', 'structure').subscribe(() => {
        expect(cacheServiceMock.invalidateByPrefix).toHaveBeenCalledWith('structure');
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/api/structure/`);
      req.flush({});
    });
  });
});
