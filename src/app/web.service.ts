import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {environment} from "../environments/environment";
import {ConSurfGrade, ConSurfMSAVar} from "./con-surf-data";
import {ChunkUpload} from "./chunk-upload";
import {ProteinFastaDatabaseQuery} from "./protein-fasta-database";
import {ConsurfJob, ConsurfJobQuery} from "./consurf-job";
import {MultipleSequenceAlignment, MultipleSequenceAlignmentQuery} from "./msa";
import {map, Observable, switchMap} from "rxjs";
import {StructureFile, StructureFileQuery} from "./structure";
import {UserSession} from "./user";

@Injectable({
  providedIn: 'root'
})
export class WebService {
  baseUrl: string = environment.baseUrl
  keycloakCallbackUrl: string = environment.keycloakCallback
  constructor(private http: HttpClient) { }

  getConsurfMSAVar(uniprotId: string) {
    return this.http.get<ConSurfMSAVar[]>(`${this.baseUrl}/api/consurf/consurf_msa_variation/${uniprotId}`, {responseType: 'json', observe: 'body'})
  }

  getConsurfGrade(uniprotId: string) {
    return this.http.get<ConSurfGrade[]>(`${this.baseUrl}/api/consurf/consurf_grade/${uniprotId}`, {responseType: 'json', observe: 'body'})
  }

  getUniprotTypeAhead(query: string) {
    return this.http.get<string[]>(`${this.baseUrl}/api/consurf/typeahead/${query}`, {responseType: 'json', observe: 'body'})
  }

  getCount() {
    return this.http.get<number>(`${this.baseUrl}/api/consurf/count`, {responseType: 'json', observe: 'body'})
  }

  getProteinFastaDatabases(limit: number = 10, page: number = 1, search: string = "") {
    let params = new HttpParams()
    params = params.append("limit", limit.toString())
    params = params.append("page", page.toString())
    if (search !== "" && search !== null) {
      params = params.append("search", search)
    }
    return this.http.get<ProteinFastaDatabaseQuery>(`${this.baseUrl}/api/fasta/`, {responseType: 'json', observe: 'body', params: params})
  }

  deleteProteinFastaDatabase(id: number) {
    return this.http.delete<any>(`${this.baseUrl}/api/fasta/${id}/`, {responseType: 'json', observe: 'body'})
  }

  getMSAs(limit: number = 10, page: number = 1, search: string = "") {
    let params = new HttpParams()
    params = params.append("limit", limit.toString())
    params = params.append("page", page.toString())
    if (search !== "" && search !== null) {
      params = params.append("search", search)
    }
    return this.http.get<MultipleSequenceAlignmentQuery>(`${this.baseUrl}/api/msa/`, {responseType: 'json', observe: 'body', params: params})
  }

  deleteMSA(id: number) {
    return this.http.delete<any>(`${this.baseUrl}/api/msa/${id}/`, {responseType: 'json', observe: 'body'})
  }

  getStructures(limit: number = 10, page: number = 1, search: string = "") {
    let params = new HttpParams()
    params = params.append("limit", limit.toString())
    params = params.append("page", page.toString())
    if (search !== "" && search !== null) {
      params = params.append("search", search)
    }
    return this.http.get<StructureFileQuery>(`${this.baseUrl}/api/structure/`, {responseType: 'json', observe: 'body', params: params})
  }

  deleteStructure(id: number) {
    return this.http.delete<any>(`${this.baseUrl}/api/structure/${id}/`, {responseType: 'json', observe: 'body'})
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
    //headers.append('Content-Disposition', `attachment; filename=${filename}`)
    console.log(headers)
    if (url !== "") {
      if (url.startsWith("http://") && !url.startsWith("http://localhost")) {
        url = url.replace("http://", "https://")
      }
      return this.http.put<ChunkUpload>(
        url,
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
    if (url.startsWith("http://") && !url.startsWith("http://localhost")) {
      url = url.replace("http://", "https://")
    }
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
      )
    } else if (file_type === "msa") {
      return this.http.post<any>(
        `${this.baseUrl}/api/msa/`,
        {name: file_name, upload_id: upload_id},
        {responseType: 'json', observe: 'body'}
      )
    } else {
      return this.http.post<any>(
        `${this.baseUrl}/api/structure/`,
        {name: file_name, upload_id: upload_id},
        {responseType: 'json', observe: 'body'}
      )
    }
  }

  savePDBContent(file_name: string, content: string) {
    return this.http.post<StructureFile>(
      `${this.baseUrl}/api/structure/`,
      {name: file_name, content: content},
      {responseType: 'json', observe: 'body'}
    )
  }

  getConsurfJobs(limit: number = 10, page: number = 1, search: string = "", status: string = "") {
    let params = new HttpParams()
    params = params.append("limit", limit.toString())
    params = params.append("page", page.toString())
    if (search !== "" && search !== null) {
      params = params.append("search", search)
    }
    if (status !== "" && status !== null && status !== "all") {
      params = params.append("status", status)
    }
    return this.http.get<ConsurfJobQuery>(`${this.baseUrl}/api/job/`, {responseType: 'json', observe: 'body', params: params})
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
    return this.http.get<any>(`https://rest.uniprot.org/uniprotkb/${uniprotID}`, {observe: 'body', responseType: 'json'})
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
    const csrf = cookies.find((cookie) => cookie.trim().startsWith('csrfToken='));
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

}
