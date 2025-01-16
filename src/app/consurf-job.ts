export interface ConsurfJob {
  user: number;
  job_title: string;
  query_sequence: string;
  alignment_program: string;
  fasta_database: number;
  created_at: Date;
  status: string;
  updated_at: Date;
  log_data: string;
  error_data: string;
  process_cmd: string;
  max_homologs: number;
  max_iterations: number;
  substitution_model: string;
  maximum_likelihood: boolean;
  max_id: number;
  min_id: number;
  closest: boolean;
  cutoff: number;
  algorithm: string;
  email_notification: boolean;
  id: number;
  structure_file: number;
  msa: number;
  chain: string;
  uniprot_accession: string;
  query_name: string;
}

export interface ConsurfJobQuery {
  results: ConsurfJob[];
  count: number;
  previous: string|null;
  next: string|null;
}

export interface MessageJob {
  'type': string,
  'job_id': number,
  'status': string,
  'session_id': string,
  'log_data': string,
  'error_data': string,
  'message': string
}
