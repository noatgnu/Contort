import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {environment} from "../environments/environment";
import {ConSurfGrade, ConSurfMSAVar} from "./con-surf-data";
import {ChunkUpload} from "./chunk-upload";
import {ProteinFastaDatabaseQuery} from "./protein-fasta-database";
import {ConsurfJob, ConsurfJobQuery} from "./consurf-job";
import {MultipleSequenceAlignment, MultipleSequenceAlignmentQuery} from "./msa";
import {forkJoin, map, Observable, of, switchMap, tap} from "rxjs";
import {StructureFile, StructureFileQuery} from "./structure";
import {UserSession} from "./user";
import {CacheService} from "./cache.service";

@Injectable({
  providedIn: 'root'
})
export class WebService {
  baseUrl: string = environment.baseUrl
  keycloakCallbackUrl: string = environment.keycloakCallback

  private readonly CACHE_TTL_TYPEAHEAD = 5 * 60 * 1000;
  private readonly CACHE_TTL_DATA = 2 * 60 * 1000;

  constructor(private http: HttpClient, private cacheService: CacheService) { }

  getConsurfMSAVar(uniprotId: string) {
    return this.http.get<ConSurfMSAVar[]>(`${this.baseUrl}/api/consurf/consurf_msa_variation/${uniprotId}`, {responseType: 'json', observe: 'body'})
  }

  getConsurfGrade(uniprotId: string) {
    return this.http.get<ConSurfGrade[]>(`${this.baseUrl}/api/consurf/consurf_grade/${uniprotId}`, {responseType: 'json', observe: 'body'})
  }

  getUniprotTypeAhead(query: string) {
    const cacheKey = this.cacheService.generateKey('typeahead', query);
    const cached = this.cacheService.get<string[]>(cacheKey);
    if (cached) {
      return of(cached);
    }
    return this.http.get<string[]>(`${this.baseUrl}/api/consurf/typeahead/${query}`, {responseType: 'json', observe: 'body'}).pipe(
      tap(data => this.cacheService.set(cacheKey, data, this.CACHE_TTL_TYPEAHEAD))
    );
  }

  getCount() {
    return this.http.get<number>(`${this.baseUrl}/api/consurf/count`, {responseType: 'json', observe: 'body'})
  }

  getProteinFastaDatabases(limit: number = 10, offset: number = 0, search: string = "") {
    const cacheKey = this.cacheService.generateKey('fasta', limit, offset, search);
    const cached = this.cacheService.get<ProteinFastaDatabaseQuery>(cacheKey);
    if (cached) {
      return of(cached);
    }

    let params = new HttpParams()
      .append("limit", limit.toString())
      .append("offset", offset.toString());

    if (search !== "" && search !== null) {
      params = params.append("search", search);
    }

    return this.http.get<ProteinFastaDatabaseQuery>(`${this.baseUrl}/api/fasta/`, {
      responseType: 'json',
      observe: 'body',
      params: params
    }).pipe(
      tap(data => this.cacheService.set(cacheKey, data, this.CACHE_TTL_DATA))
    );
  }

  deleteProteinFastaDatabase(id: number) {
    return this.http.delete<any>(`${this.baseUrl}/api/fasta/${id}/`, {responseType: 'json', observe: 'body'}).pipe(
      tap(() => this.cacheService.invalidateByPrefix('fasta'))
    );
  }

  getMSAs(limit: number = 10, offset: number = 0, search: string = "") {
    const cacheKey = this.cacheService.generateKey('msa', limit, offset, search);
    const cached = this.cacheService.get<MultipleSequenceAlignmentQuery>(cacheKey);
    if (cached) {
      return of(cached);
    }

    let params = new HttpParams()
      .append("limit", limit.toString())
      .append("offset", offset.toString());

    if (search !== "" && search !== null) {
      params = params.append("search", search);
    }

    return this.http.get<MultipleSequenceAlignmentQuery>(`${this.baseUrl}/api/msa/`, {
      responseType: 'json',
      observe: 'body',
      params: params
    }).pipe(
      tap(data => this.cacheService.set(cacheKey, data, this.CACHE_TTL_DATA))
    );
  }

  deleteMSA(id: number) {
    return this.http.delete<any>(`${this.baseUrl}/api/msa/${id}/`, {responseType: 'json', observe: 'body'}).pipe(
      tap(() => this.cacheService.invalidateByPrefix('msa'))
    );
  }

  getStructures(limit: number = 10, offset: number = 0, search: string = "") {
    const cacheKey = this.cacheService.generateKey('structure', limit, offset, search);
    const cached = this.cacheService.get<StructureFileQuery>(cacheKey);
    if (cached) {
      return of(cached);
    }

    let params = new HttpParams()
      .append("limit", limit.toString())
      .append("offset", offset.toString());

    if (search !== "" && search !== null) {
      params = params.append("search", search);
    }

    return this.http.get<StructureFileQuery>(`${this.baseUrl}/api/structure/`, {
      responseType: 'json',
      observe: 'body',
      params: params
    }).pipe(
      tap(data => this.cacheService.set(cacheKey, data, this.CACHE_TTL_DATA))
    );
  }

  deleteStructure(id: number) {
    return this.http.delete<any>(`${this.baseUrl}/api/structure/${id}/`, {responseType: 'json', observe: 'body'}).pipe(
      tap(() => this.cacheService.invalidateByPrefix('structure'))
    );
  }

  shareFastaDatabase(id: number, usernames: string[]) {
    return this.http.post<ProteinFastaDatabaseQuery>(`${this.baseUrl}/api/fasta/${id}/share/`, {usernames: usernames}, {responseType: 'json', observe: 'body'}).pipe(
      tap(() => this.cacheService.invalidateByPrefix('fasta'))
    );
  }

  unshareFastaDatabase(id: number, usernames: string[]) {
    return this.http.post<ProteinFastaDatabaseQuery>(`${this.baseUrl}/api/fasta/${id}/unshare/`, {usernames: usernames}, {responseType: 'json', observe: 'body'}).pipe(
      tap(() => this.cacheService.invalidateByPrefix('fasta'))
    );
  }

  setFastaDatabasePublic(id: number, isPublic: boolean) {
    return this.http.post<ProteinFastaDatabaseQuery>(`${this.baseUrl}/api/fasta/${id}/set_public/`, {is_public: isPublic}, {responseType: 'json', observe: 'body'}).pipe(
      tap(() => this.cacheService.invalidateByPrefix('fasta'))
    );
  }

  buildBlastIndex(id: number) {
    return this.http.post<ProteinFastaDatabaseQuery>(`${this.baseUrl}/api/fasta/${id}/build_blast/`, {}, {responseType: 'json', observe: 'body'}).pipe(
      tap(() => this.cacheService.invalidateByPrefix('fasta'))
    );
  }

  buildMmseqsIndex(id: number) {
    return this.http.post<ProteinFastaDatabaseQuery>(`${this.baseUrl}/api/fasta/${id}/build_mmseqs/`, {}, {responseType: 'json', observe: 'body'}).pipe(
      tap(() => this.cacheService.invalidateByPrefix('fasta'))
    );
  }

  shareMSA(id: number, usernames: string[]) {
    return this.http.post<MultipleSequenceAlignmentQuery>(`${this.baseUrl}/api/msa/${id}/share/`, {usernames: usernames}, {responseType: 'json', observe: 'body'}).pipe(
      tap(() => this.cacheService.invalidateByPrefix('msa'))
    );
  }

  unshareMSA(id: number, usernames: string[]) {
    return this.http.post<MultipleSequenceAlignmentQuery>(`${this.baseUrl}/api/msa/${id}/unshare/`, {usernames: usernames}, {responseType: 'json', observe: 'body'}).pipe(
      tap(() => this.cacheService.invalidateByPrefix('msa'))
    );
  }

  setMSAPublic(id: number, isPublic: boolean) {
    return this.http.post<MultipleSequenceAlignmentQuery>(`${this.baseUrl}/api/msa/${id}/set_public/`, {is_public: isPublic}, {responseType: 'json', observe: 'body'}).pipe(
      tap(() => this.cacheService.invalidateByPrefix('msa'))
    );
  }

  shareStructure(id: number, usernames: string[]) {
    return this.http.post<StructureFileQuery>(`${this.baseUrl}/api/structure/${id}/share/`, {usernames: usernames}, {responseType: 'json', observe: 'body'}).pipe(
      tap(() => this.cacheService.invalidateByPrefix('structure'))
    );
  }

  unshareStructure(id: number, usernames: string[]) {
    return this.http.post<StructureFileQuery>(`${this.baseUrl}/api/structure/${id}/unshare/`, {usernames: usernames}, {responseType: 'json', observe: 'body'}).pipe(
      tap(() => this.cacheService.invalidateByPrefix('structure'))
    );
  }

  setStructurePublic(id: number, isPublic: boolean) {
    return this.http.post<StructureFileQuery>(`${this.baseUrl}/api/structure/${id}/set_public/`, {is_public: isPublic}, {responseType: 'json', observe: 'body'}).pipe(
      tap(() => this.cacheService.invalidateByPrefix('structure'))
    );
  }

  cancelConsurfJob(id: number) {
    return this.http.post<{message: string, status: string}>(`${this.baseUrl}/api/job/${id}/cancel/`, {}, {responseType: 'json', observe: 'body'})
  }

  bulkShareFastaDatabase(ids: number[], usernames: string[]) {
    if (ids.length === 0) return of([]);
    return forkJoin(ids.map(id => this.shareFastaDatabase(id, usernames)));
  }

  bulkUnshareFastaDatabase(ids: number[], usernames: string[]) {
    if (ids.length === 0) return of([]);
    return forkJoin(ids.map(id => this.unshareFastaDatabase(id, usernames)));
  }

  bulkShareMSA(ids: number[], usernames: string[]) {
    if (ids.length === 0) return of([]);
    return forkJoin(ids.map(id => this.shareMSA(id, usernames)));
  }

  bulkUnshareMSA(ids: number[], usernames: string[]) {
    if (ids.length === 0) return of([]);
    return forkJoin(ids.map(id => this.unshareMSA(id, usernames)));
  }

  bulkShareStructure(ids: number[], usernames: string[]) {
    if (ids.length === 0) return of([]);
    return forkJoin(ids.map(id => this.shareStructure(id, usernames)));
  }

  bulkUnshareStructure(ids: number[], usernames: string[]) {
    if (ids.length === 0) return of([]);
    return forkJoin(ids.map(id => this.unshareStructure(id, usernames)));
  }

  login(username: string, password: string) {
    return this.http.post<{token: string}>(`${this.baseUrl}/api/token-auth/`, {username: username, password: password}, {responseType: 'json', observe: 'body'})
  }

  uploadDataChunk(url: string = "", chunk: File, filename: string, contentRange: string) {
    const form = new FormData()
    form.append('file', chunk)
    form.append('filename', filename)
    let headers = new HttpHeaders()
    headers = headers.append('Content-Range', contentRange)
    if (url !== "") {
      return this.http.put<ChunkUpload>(
        this.upgradeUrl(url),
        form,
        {responseType: 'json', observe: 'body', headers: headers}
      )

    } else {
      return this.http.put<ChunkUpload>(
        `${this.baseUrl}/api/chunked_upload/`,
        form,
        {responseType: 'json', observe: 'body', headers: headers}
      )

    }
  }

  uploadDataChunkComplete(url: string = "", md5: string, file?: File, filename?: string) {
    const form = new FormData()
    form.append('sha256', md5)
    url = this.upgradeUrl(url);
    if (file && filename) {
      form.append('file', file)
      form.append('filename', filename)
      return this.http.post<ChunkUpload>(
        `${this.baseUrl}/api/chunked_upload/`,
        form,
        {responseType: 'json', observe: 'body'}
      )
    } else {
      return this.http.post<ChunkUpload>(
        url,
        form,
        {responseType: 'json', observe: 'body'}
      )
    }
  }

  bindUploadedFile(file_name: string, upload_id: string, file_type: "database"|"msa"|"structure") {
    if (file_type === "database") {
      return this.http.post<any>(
        `${this.baseUrl}/api/fasta/`,
        {name: file_name, upload_id: upload_id},
        {responseType: 'json', observe: 'body'}
      ).pipe(
        tap(() => this.cacheService.invalidateByPrefix('fasta'))
      );
    } else if (file_type === "msa") {
      return this.http.post<any>(
        `${this.baseUrl}/api/msa/`,
        {name: file_name, upload_id: upload_id},
        {responseType: 'json', observe: 'body'}
      ).pipe(
        tap(() => this.cacheService.invalidateByPrefix('msa'))
      );
    } else {
      return this.http.post<any>(
        `${this.baseUrl}/api/structure/`,
        {name: file_name, upload_id: upload_id},
        {responseType: 'json', observe: 'body'}
      ).pipe(
        tap(() => this.cacheService.invalidateByPrefix('structure'))
      );
    }
  }

  savePDBContent(file_name: string, content: string) {
    return this.http.post<StructureFile>(
      `${this.baseUrl}/api/structure/`,
      {name: file_name, content: content},
      {responseType: 'json', observe: 'body'}
    ).pipe(
      tap(() => this.cacheService.invalidateByPrefix('structure'))
    );
  }

  getConsurfJobs(limit: number = 10, offset: number = 0, search: string = "", status: string = "") {
    let params = new HttpParams()
      .append("limit", limit.toString())
      .append("offset", offset.toString());
    
    if (search !== "" && search !== null) {
      params = params.append("search", search);
    }
    
    if (status !== "" && status !== null && status !== "all") {
      params = params.append("status", status);
    }
    
    return this.http.get<ConsurfJobQuery>(`${this.baseUrl}/api/job/`, {
      responseType: 'json',
      observe: 'body',
      params: params
    });
  }

  getConsurfJob(id: number) {
    return this.http.get<ConsurfJob>(`${this.baseUrl}/api/job/${id}/`, {responseType: 'json', observe: 'body'})
  }

  submitConsurfJob(payload: any) {
    if (typeof payload['fasta_database_id'] !== 'number') {
      if (payload['fasta_database_id']) {
        if (payload['fasta_database_id'].length === 0) {
          payload['fasta_database_id'] = null
        } else {
          payload['fasta_database_id'] = payload['fasta_database_id'][0]
        }
      }

    }
    if (typeof payload['msa_id'] !== 'number') {
      if (payload['msa_id']) {
        if (payload['msa_id'].length === 0) {
          payload['msa_id'] = null
        } else {
          payload['msa_id'] = payload['msa_id'][0]
        }
      }

    }
    if (typeof payload['structure_id'] !== 'number') {
      if (payload['structure_id']) {
        if (payload['structure_id'].length === 0) {
          payload['structure_id'] = null
        } else {
          payload['structure_id'] = payload['structure_id'][0]
        }
      }

    }
    return this.http.post<ConsurfJob>(`${this.baseUrl}/api/job/`, payload, {responseType: 'json', observe: 'body'})
  }

  generateJobDownloadToken(id: number) {
    return this.http.get<{token: string}>(`${this.baseUrl}/api/job/${id}/generate_download_token/`, {responseType: 'json', observe: 'body'})
  }

  getConsurfGradeFromToken(token: string) {
    return this.http.get<ConSurfGrade[]>(`${this.baseUrl}/api/job/download/?token=${token}&file_type=grades`, {responseType: 'json', observe: 'body'})
  }

  getConsurfMSAVarFromToken(token: string) {
    return this.http.get<ConSurfMSAVar[]>(`${this.baseUrl}/api/job/download/?token=${token}&file_type=msa_aa_variety_percentage`, {responseType: 'json', observe: 'body'})
  }

  getConsurfGradeFromJob(id: number) {
    return this.http.get<ConSurfGrade[]>(`${this.baseUrl}/api/job/${id}/consurf_grade/`, {responseType: 'json', observe: 'body'})
  }

  getConeurfMSAVarFromJob(id: number) {
    return this.http.get<ConSurfMSAVar[]>(`${this.baseUrl}/api/job/${id}/consurf_msa_variation/`, {responseType: 'json', observe: 'body'})
  }

  getAllSequenceNamesFromMSA(msa_id: number) {
    return this.http.get<string[]>(`${this.baseUrl}/api/msa/${msa_id}/get_all_sequence_names/`, {responseType: 'json', observe: 'body'})
  }

  downloadJobResults(id: number, token: string, file_type: string = "zip") {
    // create a clickable link and click it then remove it
    let a = document.createElement('a')
    a.href = `${this.baseUrl}/api/job/download/?token=${token}&file_type=${file_type}`
    a.download = `consurf_job_${id}.zip`
    a.target = "_blank"
    a.click()
    a.remove()
  }

  getUniprot(uniprotID: string) {
    return this.http.get<any>(`${this.baseUrl}/api/get-uniprot-proxy/?accession=${uniprotID}`, {observe: 'body', responseType: 'json'})
  }

  getPDBFileFromUniProtID(uniprotID: string): Observable<string> {
    return this.http.get(`${this.baseUrl}/api/job/get_pdb/?uniprotID=${uniprotID}`, {observe: 'body', responseType: 'text'})
  }

  getUniqueSessionID() {
    return this.http.get<{'token': string}>(`${this.baseUrl}/api/users/get_unique_session_id/`, {responseType: 'json', observe: 'body'})
  }

  getLoginProviderRedirect() {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `${this.baseUrl}/_allauth/browser/v1/auth/provider/redirect`;

    const providerInput = document.createElement('input');
    providerInput.type = 'hidden';
    providerInput.name = 'provider';
    providerInput.value = 'keycloak';
    form.appendChild(providerInput);

    const callbackUrlInput = document.createElement('input');
    callbackUrlInput.type = 'hidden';
    callbackUrlInput.name = 'callback_url';
    callbackUrlInput.value = this.keycloakCallbackUrl;
    form.appendChild(callbackUrlInput);

    const processInput = document.createElement('input');
    processInput.type = 'hidden';
    processInput.name = 'process';
    processInput.value = 'login';
    form.appendChild(processInput);

    const csrfToken = this.getCSRFTokenFromCookies();
    if (csrfToken) {
      const csrfInput = document.createElement('input');
      csrfInput.type = 'hidden';
      csrfInput.name = 'csrfmiddlewaretoken';
      csrfInput.value = csrfToken;
      form.appendChild(csrfInput);
    }

    document.body.appendChild(form);
    form.submit();
  }

  getCSRFTokenFromCookies(): string | null {
    const cookies = document.cookie.split(';');
    const csrf = cookies.find((cookie) => cookie.trim().startsWith('csrftoken='));
    if (csrf) {
      return csrf.split('=')[1];
    }
    return null;
  }

  getCSRFToken() {
    return this.http.get(`${this.baseUrl}/api/set-csrf/`, { observe: 'response'})
  }

  getAuthenticationStatus(){
    return this.http.get<UserSession>(`${this.baseUrl}/_allauth/browser/v1/auth/session`, {responseType: 'json', observe: 'body', withCredentials: true})
  }

  logoutProvider() {
    let headers = new HttpHeaders()
    headers = headers.append('X-Session-Token', this.getSessionIDFromCookies() || "")
    headers = headers.append('X-CSRFToken', this.getCSRFTokenFromCookies() || "")
    return this.http.delete(`${this.baseUrl}/_allauth/browser/v1/auth/session`, {headers: headers, withCredentials: true})
  }

  getSessionIDFromCookies(): string | null {
    const cookies = document.cookie.split(';');
    const sessionID = cookies.find((cookie) => cookie.trim().startsWith('sessionid='));
    if (sessionID) {
      return sessionID.split('=')[1];
    }
    return null;
  }

  getUserTokenThroughSession() {
    return this.http.get<{token: string}>(`${this.baseUrl}/api/users/get_token/`, {responseType: 'json', observe: 'body'})
  }

  userLogoutProvider() {
    let headers = new HttpHeaders()
    headers = headers.append('X-Session-Token', this.getSessionIDFromCookies() || "")
    headers = headers.append('X-CSRFToken', this.getCSRFTokenFromCookies() || "")
    return this.http.post(`${this.baseUrl}/api/users/logout_provider/`, {withCredentials: true, headers: headers})
  }

  upgradeUrl(url: string): string {
    if (url.startsWith("http://") && !url.startsWith("http://localhost")) {
      return url.replace("http://", "https://");
    }
    return url;
  }

  previewFile(id: number, fileType: 'database' | 'msa' | 'structure') {
    const endpointMap = {
      database: `${this.baseUrl}/api/fasta/${id}/preview/`,
      msa: `${this.baseUrl}/api/msa/${id}/preview/`,
      structure: `${this.baseUrl}/api/structure/${id}/preview/`
    };
    return this.http.get(endpointMap[fileType], { responseType: 'text', observe: 'body' });
  }

}
